<script lang="ts" module>
  export type MapMarker = {
    id: string;
    lat: number;
    lng: number;
    label: string;
    dotClass: string;
  };
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet.markercluster/dist/MarkerCluster.css';
  import type * as Leaflet from 'leaflet';
  import { getI18n } from '$lib/i18n/context';
  import { cn } from '$lib/utils';

  type Props = {
    markers: MapMarker[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    class?: string;
  };
  let { markers, selectedId, onSelect, class: className }: Props = $props();

  const i18n = getI18n();

  // Region-wide fallback view when there's nothing to fit (Saarbrücken-ish centre).
  const REGION_CENTER: [number, number] = [49.4, 6.6];

  let container: HTMLDivElement;
  let leaflet = $state.raw<typeof Leaflet | null>(null);
  let map = $state.raw<Leaflet.Map | null>(null);
  let clusters: Leaflet.MarkerClusterGroup | null = null;
  const markerById = new Map<string, Leaflet.Marker>();
  let fittedIds = '';

  function pinIcon(L: typeof Leaflet, marker: MapMarker, selected: boolean): Leaflet.DivIcon {
    const size = selected ? 36 : 26;
    return L.divIcon({
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      html: `<span class="grid size-full place-items-center rounded-full border-2 border-white shadow-md ${marker.dotClass} ${selected ? 'ring-4 ring-primary/30' : ''}"><span class="size-2 rounded-full bg-white"></span></span>`
    });
  }

  // Leaflet touches `window`, so it loads only in the browser, never during SSR.
  // markercluster is a UMD plugin that patches the global `L`, hence the assignment.
  onMount(() => {
    let disposed = false;

    (async () => {
      const L = (await import('leaflet')).default;
      (window as unknown as { L: typeof Leaflet }).L = L;
      await import('leaflet.markercluster');
      if (disposed) return;

      const instance = L.map(container, {
        zoomControl: false,
        scrollWheelZoom: true,
        fadeAnimation: false
      });
      L.control.zoom({ position: 'topright' }).addTo(instance);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(instance);
      instance.setView(REGION_CENTER, 8);

      clusters = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 45,
        iconCreateFunction: (cluster) =>
          L.divIcon({
            className: '',
            iconSize: [36, 36],
            html: `<span class="grid size-9 place-items-center rounded-full bg-primary/85 text-sm font-semibold text-primary-foreground ring-4 ring-primary/20">${cluster.getChildCount()}</span>`
          })
      });
      instance.addLayer(clusters);

      leaflet = L;
      map = instance;
    })();

    return () => {
      disposed = true;
      map?.remove();
    };
  });

  // Rebuild markers when the filtered set changes; refit only if the ids changed.
  $effect(() => {
    const L = leaflet;
    const instance = map;
    if (!L || !instance || !clusters) return;

    clusters.clearLayers();
    markerById.clear();
    for (const marker of markers) {
      const layer = L.marker([marker.lat, marker.lng], {
        icon: pinIcon(L, marker, false),
        title: marker.label,
        keyboard: true
      });
      layer.on('click', () => onSelect(marker.id));
      markerById.set(marker.id, layer);
    }
    clusters.addLayers([...markerById.values()]);

    const ids = markers.map((marker) => marker.id).join('|');
    if (ids !== fittedIds) {
      fittedIds = ids;
      if (markers.length === 1) instance.setView([markers[0].lat, markers[0].lng], 13);
      else if (markers.length > 1) {
        instance.fitBounds(
          markers.map((marker) => [marker.lat, marker.lng] as [number, number]),
          { padding: [40, 40], maxZoom: 13 }
        );
      }
    }
  });

  // Highlight + reveal the selected marker (un-clustering it if needed).
  $effect(() => {
    const L = leaflet;
    if (!L || !map || !clusters) return;
    // Re-run after markers are rebuilt.
    void markers;

    for (const marker of markers) {
      markerById.get(marker.id)?.setIcon(pinIcon(L, marker, marker.id === selectedId));
    }
    const selected = selectedId ? markerById.get(selectedId) : undefined;
    if (selected) {
      clusters.zoomToShowLayer(selected, () => revealBesideCard(selected.getLatLng()));
    }
  });

  // The preview card sits top-right on desktop and along the bottom on phones
  // (MapView), so centre the pin off-axis to keep it visible next to the card.
  function revealBesideCard(latLng: Leaflet.LatLng) {
    if (!map || !leaflet) return;
    const size = map.getSize();
    const wide = window.matchMedia('(min-width: 1024px)').matches;
    const offset = wide ? leaflet.point(size.x * 0.2, 0) : leaflet.point(0, size.y * 0.25);
    map.panTo(map.unproject(map.project(latLng).add(offset)));
  }
</script>

<div
  bind:this={container}
  class={cn('map-tiles-soft z-0 h-full w-full', className)}
  role="region"
  aria-label={i18n.t.mapLabel}
></div>
