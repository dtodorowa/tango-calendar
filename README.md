# SaarLorLux+ Tango Calendar

Milongas, prácticas, workshops and festivals across Saarland, Lorraine, Luxembourg
and around, in list, calendar and map views, in German, English and French.

This repo started as **Wann-der**, a multi-tenant embeddable community calendar.
v1 is scoped to the tango community first (see
[ADR-0006](docs/adr/0006-start-as-one-community-calendar.md)); the plan is to open
it up as a forkable community calendar once it works for tango.

> Status: public calendar (list, calendar, map) plus organizer sign-in by email
> code and an event editor, on Supabase. Without Supabase env it falls back to
> demo data (`src/lib/fixtures.ts`).

## Read these first

- **[AGENTS.md](AGENTS.md)** — how we build (the working agreement).
- **[CONTEXT.md](CONTEXT.md)** — domain glossary.
- **[DESIGN.md](DESIGN.md)** — v1 scope, data-model sketch, deferred list.
- **[SPIKE.md](SPIKE.md)** — the thin vertical slice + its 6 pass/fail checks.
- **[docs/adr](docs/adr)** — the load-bearing decisions and why.

## Stack

SvelteKit 2 · Svelte 5 (runes only) · TypeScript (strict) · Tailwind v4 ·
shadcn-svelte (bits-ui) · `@lucide/svelte` · Leaflet + OSM · Node 22 · pnpm.
Deploys to Vercel (`dub1`, next to the database). Data layer: **Supabase EU** (a new project, separate
from tkRaum) — Postgres + PostGIS, Auth, Storage, Row-Level Security.

## Develop

```sh
pnpm install
pnpm dev               # http://localhost:3100, runs on demo data without .env
pnpm test
pnpm db:start          # optional: local Supabase in Docker, see supabase/README.md
```

Before finishing any change: `pnpm format`, then `pnpm check` and `pnpm build`
must pass. **Never commit — the human commits.** See AGENTS.md.
