// Category -> visual treatment. Full class strings (not interpolated) so
// Tailwind's scanner sees every one of them.
import type { Component } from 'svelte';
import Coffee from '@lucide/svelte/icons/coffee';
import Drama from '@lucide/svelte/icons/drama';
import Footprints from '@lucide/svelte/icons/footprints';
import GraduationCap from '@lucide/svelte/icons/graduation-cap';
import Music from '@lucide/svelte/icons/music';
import PartyPopper from '@lucide/svelte/icons/party-popper';
import Sparkles from '@lucide/svelte/icons/sparkles';
import type { Category } from '$lib/types';

export interface CategoryStyle {
  surface: string;
  text: string;
  dot: string;
  ring: string;
  icon: Component;
}

export const CATEGORY_STYLE: Record<Category, CategoryStyle> = {
  milonga: {
    surface: 'bg-cat-milonga',
    text: 'text-cat-milonga-strong',
    dot: 'bg-cat-milonga-strong',
    ring: 'ring-cat-milonga-strong',
    icon: Music
  },
  practica: {
    surface: 'bg-cat-practica',
    text: 'text-cat-practica-strong',
    dot: 'bg-cat-practica-strong',
    ring: 'ring-cat-practica-strong',
    icon: Footprints
  },
  workshop: {
    surface: 'bg-cat-workshop',
    text: 'text-cat-workshop-strong',
    dot: 'bg-cat-workshop-strong',
    ring: 'ring-cat-workshop-strong',
    icon: GraduationCap
  },
  festival: {
    surface: 'bg-cat-festival',
    text: 'text-cat-festival-strong',
    dot: 'bg-cat-festival-strong',
    ring: 'ring-cat-festival-strong',
    icon: Sparkles
  },
  show: {
    surface: 'bg-cat-show',
    text: 'text-cat-show-strong',
    dot: 'bg-cat-show-strong',
    ring: 'ring-cat-show-strong',
    icon: Drama
  },
  cafe: {
    surface: 'bg-cat-cafe',
    text: 'text-cat-cafe-strong',
    dot: 'bg-cat-cafe-strong',
    ring: 'ring-cat-cafe-strong',
    icon: Coffee
  },
  hangout: {
    surface: 'bg-cat-hangout',
    text: 'text-cat-hangout-strong',
    dot: 'bg-cat-hangout-strong',
    ring: 'ring-cat-hangout-strong',
    icon: PartyPopper
  }
};

/** The category that colours an event: its first one. */
export function primaryStyle(categories: Category[]): CategoryStyle {
  return CATEGORY_STYLE[categories[0] ?? 'milonga'];
}
