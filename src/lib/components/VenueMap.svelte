<script lang="ts" module>
  export type MapPoint = { lat: number; lng: number; label: string; sub?: string };
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import type { Map as LeafletMap } from 'leaflet';

  type Props = { points: MapPoint[] };
  let { points }: Props = $props();

  let container: HTMLDivElement;

  // Leaflet touches `window`, so it must load only in the browser (dynamic import
  // inside onMount) — never during SSR. circleMarker avoids the marker-icon asset
  // pitfall bundlers hit with Leaflet's default PNG markers.
  onMount(() => {
    let map: LeafletMap | undefined;

    (async () => {
      if (points.length === 0) return;
      const L = await import('leaflet');
      map = L.map(container, { scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const latlngs: [number, number][] = [];
      for (const point of points) {
        L.circleMarker([point.lat, point.lng], {
          radius: 8,
          color: '#473d7f',
          fillColor: '#473d7f',
          fillOpacity: 0.7
        })
          .addTo(map)
          .bindPopup(point.sub ? `<strong>${point.label}</strong><br>${point.sub}` : point.label);
        latlngs.push([point.lat, point.lng]);
      }

      if (latlngs.length === 1) map.setView(latlngs[0], 13);
      else map.fitBounds(latlngs, { padding: [30, 30] });
    })();

    return () => map?.remove();
  });
</script>

<div
  bind:this={container}
  class="h-80 w-full rounded-2xl border border-border"
  role="region"
  aria-label="Map of venues"
></div>
