# Wann-der — v1 Design

> Standalone, multi-tenant, embeddable community events calendar.
> "When" + "wander". See [CONTEXT.md](./CONTEXT.md) for terms and
> [docs/adr](./docs/adr) for the load-bearing decisions.

## One-paragraph pitch

A shared, region-aware events calendar where any organizer signs up, adds their
venue once, posts events (including recurring ones) in minutes, and gets a beautiful
embeddable view for their own site — while their events also appear on one shared
regional map alongside everyone else's. Collaborators co-manage the same calendar;
nobody can touch another org's events. Multilingual out of the box. tkRaum consumes
it via API; booking stays entirely inside tkRaum.

## Decisions locked (grilling session, 2026-08-03)

| #              | Decision                                                                                             | ADR  |
| -------------- | ---------------------------------------------------------------------------------------------------- | ---- |
| Scope          | Separate product; pure **events directory** (no booking/PII); own login + dashboard + read/write API | —    |
| Topology       | **One shared multi-tenant instance**; tkRaum = consumer + org + branded embed                        | 0001 |
| Stack          | **SvelteKit + new Supabase EU project**; Firebase rejected                                           | 0002 |
| Ownership      | **Organization/Team**, roles owner/editor, **RLS** isolation                                         | 0003 |
| Recurrence     | **Series + Occurrences**, iCal **RRULE** storage, friendly UI                                        | 0004 |
| Location       | **Auto-geocode** venue → lat/lng + city/area/country; EU/OSM map tiles                               | —    |
| Category       | **Curated, growable** list; Event.category defaults from Org                                         | —    |
| Embedding      | **API + host SSR primary; iframe fallback**; own SSR site = SEO home                                 | 0005 |
| Translation    | **Eager on save + cache + human-override**, source-hash invalidation (DeepL)                         | —    |
| Trust & safety | **Publish-now + guardrails + super-admin takedown/ban**                                              | —    |
| Media          | **Eager webp on upload**, EXIF-stripped, 2–3 sizes in Supabase Storage                               | —    |
| Auth           | **Passwordless** magic-link + OTP; invite-by-email org join                                          | —    |
| Import         | **Deferred**; one-time `.ics` upload as fast-follow                                                  | —    |
| Name           | **Wann-der** (working handle)                                                                        | —    |

## Data model sketch (not final schema)

```
users            (Supabase Auth)
organizations    id, name, slug, default_category, created_at
memberships      user_id, org_id, role(owner|editor)          -- RLS pivot
venues           id, org_id, name, address, lat, lng, city, admin_area, country
events           id, org_id, venue_id, category, rrule,
                 dtstart, dtend/duration, hero_photo_id, status(draft|published),
                 source_lang
event_i18n       event_id, locale, title, description,
                 source_hash, is_human_edited                 -- translation cache
occurrence_overrides  event_id, occ_date, status(cancelled|moved),
                      override_start, override_venue_id        -- deltas + EXDATE
photos           id, org_id, original_path, thumb_path, card_path, full_path
reports          id, event_id, reporter_email, reason, created_at
bans             email, org_id?, reason, created_by, created_at
```

- Occurrences are **derived** from `events.rrule` within a bounded window on read,
  minus `occurrence_overrides`. Only overrides/cancellations are persisted.
- Every Org-owned table carries `org_id` and RLS policies.

## v1 scope (build)

- Passwordless auth; create Org; invite editor by email.
- Venue: create with address → geocode.
- Event: create/edit with friendly recurrence; publish toggle; one hero photo
  (webp pipeline); category.
- Eager translation to {de, en, fr} on save, with override.
- Own SSR public site: month / list / map views; event detail; org and city pages.
- **Read API** (JSON) + `.ics` feed.
- **iframe embed** with auto-height + view/filter params.
- Trust & safety: verified email, Turnstile, rate limits, report button,
  super-admin takedown + ban.
- tkRaum bridge: an API endpoint to create a Placeholder Event from a confirmed
  booking (tkRaum calls it; organizer completes + publishes).

## Deferred (post-v1)

- One-time `.ics` file import; live `.ics` feed sync.
- WordPress plugin / server-rendered HTML snippet (no-code host SEO).
- Web component with host theming.
- Native mobile app + home-screen widgets.
- Self-hosting packaging.
- Social login.
- Cross-border "scene" groupings beyond derived geo.
- `es` locale (config-ready, not enabled).

## Open questions to resolve before/at build

- Geocoding provider (Nominatim/OSM free vs paid) + map tile provider (Leaflet+OSM
  vs MapTiler). Both must be EU/GDPR-clean.
- Occurrence window size + pagination strategy for busy orgs.
- Rate-limit thresholds and Turnstile placement (signup only vs first-event too).
- Where the repo lives and whether to scaffold now.
