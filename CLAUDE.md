# CLAUDE.md

The working agreement for this repo lives in **[AGENTS.md](AGENTS.md)** — read it
before writing or editing code. It is the single source of truth for how we build.

Companion docs:

- **[CONTEXT.md](CONTEXT.md)** — domain glossary (what the terms mean).
- **[DESIGN.md](DESIGN.md)** — v1 scope, data-model sketch, deferred list.
- **[SPIKE.md](SPIKE.md)** — the thin vertical slice that de-risks the concept.
- **[docs/adr](docs/adr)** — architecture decision records (why things are the way
  they are).

## Quick reference (full detail in AGENTS.md)

- **Current scope:** v1 ships as the **SaarLorLux+ Tango Calendar** for one
  community; multi-tenant self-service comes later (ADR-0006). Hosted on Vercel
  `dub1`, next to the Supabase project in eu-west-1 (ADR-0007).

- **Wann-der** is a standalone, multi-tenant, **embeddable community events
  calendar**. "When" + "wander". Any organizer self-manages events; any site embeds
  or reads them. tkRaum is a _consumer_, not the owner.
- **Stack:** SvelteKit 2, Svelte 5 **runes only** (`$state` / `$derived` / `$props`;
  `$effect` is a last resort), TypeScript strict, Tailwind v4, `@lucide/svelte`.
  Node 22. **Supabase EU (new project)** — Postgres+PostGIS, Auth, Storage, RLS.
- **Dynamic SSR + API, not a static site.** Public pages are server-rendered (they
  are the SEO home); there is a read API + `.ics` feed and an iframe embed. This is
  the opposite of tkRaum's prerendered `main`.
- **Multi-tenant from day one.** Every Org-owned row is scoped by `org_id` and
  guarded by **Row-Level Security**. Never rely on app-layer checks alone.
- **User-facing copy** is trilingual (de/en/fr) and centralised, never hardcoded.
  Event _content_ is machine-translated + cached; UI _chrome_ copy lives in a
  content module.
- **No em dashes (`—`) in user-facing copy.** Hard rule.
- **Before finishing:** run `pnpm format`, then `pnpm check`, `pnpm test`
  and `pnpm build` must pass; no `: any`, no stray `console.*`.
- **Never commit.** The human commits, always. (Full detail in AGENTS.md.)
