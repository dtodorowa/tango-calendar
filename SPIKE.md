# Wann-der — Spike Plan

> Purpose: answer "**is this possible as a standalone embeddable thing?**" with a
> thin vertical slice, before committing to the full v1 build. A spike is
> throwaway code that buys certainty on the riskiest unknowns.

## The riskiest unknowns (what the spike must de-risk)

1. **Embeddable + host-SEO path.** Can a standalone SvelteKit+Supabase app expose
   events that (a) render on its _own_ SSR page, (b) embed via iframe with working
   auto-height, and (c) be consumed by _another_ app's SSR (a stub "tkRaum") so the
   content lands on the host's domain?
2. **RLS collaboration/isolation.** Does Supabase RLS actually give intra-org
   co-edit + cross-org read-only, as a database invariant?
3. **RRULE → Occurrences → render.** Does a stored RRULE expand to occurrences that
   render correctly on a month + list view, including one cancelled date?
4. **Geocode → map.** Address → lat/lng → pin on an EU/OSM map tile provider.

Translation, media pipeline, moderation, invites, and polish are **out of the
spike** — they're known-solvable and add no new risk.

## Spike build (thinnest slice)

- One Supabase EU project, tables: `organizations`, `memberships`, `venues`,
  `events`, `occurrence_overrides` (+ RLS policies).
- Seed **two Orgs** (Org A, Org B), one User in each.
- Org A: one geocoded Venue, one **weekly** Event (RRULE), one **cancelled**
  occurrence.
- Prove, end to end:
  - [ ] Wann-der SSR page lists Org A's occurrences for the next 8 weeks (month +
        list), cancelled date omitted.
  - [ ] `/embed?org=A&view=month` renders in an `<iframe>` on a dummy page and
        auto-resizes via `postMessage`.
  - [ ] A stub "tkRaum" SvelteKit route calls the Wann-der **JSON API** in `load`
        and **server-renders** Org A's events (view source → real HTML on the host).
  - [ ] `.ics` feed for Org A opens in a native calendar with the recurrence intact.
  - [ ] Org B's User **cannot** read or edit Org A's rows (RLS denies it); Org A's
        second member **can** edit.
  - [ ] Venue address geocodes and drops a correct pin on an OSM/MapTiler map.

## Success criteria

The concept is **proven** if all six boxes pass with no architectural surprises
(especially #2 RLS and the #1c host-SSR path). Any that fights back → capture why in
an ADR and decide before committing to v1.

## Timebox

Aim for a few focused days. If the SSR-from-API path or RLS isolation turns out
awkward, stop and reconsider — those two are the load-bearing bets.

## Explicitly NOT in the spike

Translation, webp pipeline, Turnstile/rate-limits/reports, magic-link email flow
(use a seeded session), invites, admin UI, styling polish, WordPress, web component.
