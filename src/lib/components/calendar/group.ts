import type { Occurrence } from '$lib/types';

/** Occurrences bucketed by local date key, in first-seen (i.e. start) order. */
export function groupByDay(occurrences: Occurrence[]): Map<string, Occurrence[]> {
  const groups = new Map<string, Occurrence[]>();
  for (const occurrence of occurrences) {
    const bucket = groups.get(occurrence.dateKey);
    if (bucket) bucket.push(occurrence);
    else groups.set(occurrence.dateKey, [occurrence]);
  }
  return groups;
}

export function dayAnchorId(dateKey: string): string {
  return `day-${dateKey}`;
}
