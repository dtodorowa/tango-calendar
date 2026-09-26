<script lang="ts">
  import Users from '@lucide/svelte/icons/users';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Label } from '$lib/components/ui/label';
  import * as Select from '$lib/components/ui/select';
  import { Slider } from '$lib/components/ui/slider';
  import { formatEuro } from '$lib/format';
  import { EMPTY_FILTERS, PRICE_CEILING, activeFilterCount, type Filters } from '$lib/filters';
  import { getI18n } from '$lib/i18n/context';
  import { CATEGORIES, TAGS, type Category, type Organization, type Tag } from '$lib/types';
  import { cn } from '$lib/utils';

  type Props = {
    filters: Filters;
    organizers: Organization[];
    onChange: (next: Filters) => void;
    /** Distinguishes ids when the panel renders twice (sidebar + drawer). */
    idPrefix: string;
    class?: string;
  };
  let { filters, organizers, onChange, idPrefix, class: className }: Props = $props();

  const i18n = getI18n();
  const ALL = 'all';

  // Local while dragging; the URL only updates on commit.
  let priceRange = $derived([filters.priceMin, filters.priceMax]);

  const priceLabel = $derived.by(() => {
    const [min, max] = priceRange;
    if (min === 0 && max === PRICE_CEILING) return i18n.t.anyPrice;
    return i18n.t.priceRange(min, max === PRICE_CEILING ? null : max);
  });

  const selectedOrganizer = $derived(organizers.find((o) => o.slug === filters.organizer));

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  function toggleCategory(category: Category) {
    onChange({ ...filters, categories: toggle(filters.categories, category) });
  }

  function toggleTag(tag: Tag) {
    onChange({ ...filters, tags: toggle(filters.tags, tag) });
  }
</script>

<div class={cn('flex flex-col gap-6', className)}>
  <fieldset class="flex flex-col gap-2.5">
    <legend class="mb-2.5 text-sm font-medium">{i18n.t.whatToDo}</legend>
    <div class="flex flex-wrap gap-2">
      {#each CATEGORIES as category (category)}
        <button
          type="button"
          class="chip"
          aria-pressed={filters.categories.includes(category)}
          onclick={() => toggleCategory(category)}
        >
          {i18n.t.categories[category]}
        </button>
      {/each}
    </div>
  </fieldset>

  <div class="flex flex-col gap-2.5">
    <Label for="{idPrefix}-organizer">{i18n.t.organizers}</Label>
    <Select.Root
      type="single"
      value={filters.organizer ?? ALL}
      onValueChange={(value) => onChange({ ...filters, organizer: value === ALL ? null : value })}
    >
      <Select.Trigger id="{idPrefix}-organizer" class="h-10 w-full bg-card">
        <span class="flex items-center gap-2 truncate">
          <Users size={15} class="shrink-0 text-muted-foreground" />
          {selectedOrganizer?.name ?? i18n.t.allOrganizers}
        </span>
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={ALL} label={i18n.t.allOrganizers} />
        {#each organizers as organizer (organizer.slug)}
          <Select.Item value={organizer.slug} label={organizer.name} />
        {/each}
      </Select.Content>
    </Select.Root>
  </div>

  <div class="flex flex-col gap-3">
    <div class="flex items-baseline justify-between">
      <span id="{idPrefix}-price" class="text-sm font-medium">{i18n.t.price}</span>
      <span class="text-xs text-muted-foreground">{priceLabel}</span>
    </div>
    <Slider
      type="multiple"
      bind:value={priceRange}
      min={0}
      max={PRICE_CEILING}
      step={1}
      aria-labelledby="{idPrefix}-price"
      onValueCommit={([min, max]) => onChange({ ...filters, priceMin: min, priceMax: max })}
      class="[&_[data-slot=slider-thumb]]:size-4"
    />
    <div class="flex justify-between text-xs text-muted-foreground">
      <span>{i18n.t.free}</span>
      <span>{formatEuro(PRICE_CEILING, i18n.locale)}+</span>
    </div>
  </div>

  <div role="group" aria-labelledby="{idPrefix}-tags" class="flex flex-col gap-2.5 border-t pt-5">
    <span id="{idPrefix}-tags" class="mb-0.5 text-sm font-medium">{i18n.t.moreFilters}</span>
    {#each TAGS as tag (tag)}
      <div class="flex items-center gap-2.5">
        <Checkbox
          id="{idPrefix}-tag-{tag}"
          checked={filters.tags.includes(tag)}
          onCheckedChange={() => toggleTag(tag)}
        />
        <Label for="{idPrefix}-tag-{tag}" class="font-normal">{i18n.t.tags[tag]}</Label>
      </div>
    {/each}
  </div>

  {#if activeFilterCount(filters) > 0}
    <button
      type="button"
      class="self-start text-sm font-medium text-primary hover:underline"
      onclick={() => onChange({ ...EMPTY_FILTERS, query: filters.query })}
    >
      {i18n.t.resetFilters}
    </button>
  {/if}
</div>
