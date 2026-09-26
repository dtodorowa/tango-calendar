# Wann-der — working agreement

Rules for anyone (human or agent) writing code here. Domain language lives in
[CONTEXT.md](CONTEXT.md); scope in [DESIGN.md](DESIGN.md); past decisions in
[docs/adr](docs/adr). This file is about **how** we build, not what the app means.

Stack: SvelteKit 2 + Svelte 5 (runes only), TypeScript (strict), Tailwind v4,
`@lucide/svelte`. Node 22. Data layer is **Supabase EU** (a new project, separate
from tkRaum): Postgres + PostGIS, Auth, Storage, Row-Level Security. Unlike
tkRaum's prerendered `main`, Wann-der is a **dynamic SSR + API app** — see
[docs/adr/0005](docs/adr/0005-embedding-api-ssr-iframe.md).

## Multi-tenant and RLS are non-negotiable

- **Every Org-owned row carries `org_id`.** No exceptions. See
  [docs/adr/0003](docs/adr/0003-organization-ownership-and-rls.md).
- **Isolation is enforced in the database via RLS**, not by remembering to add a
  `where` clause. Write RLS policies alongside every new table, in the same
  migration. An app-layer check is a convenience, never the security boundary.
- **The service-role key bypasses RLS.** It stays server-only and is used only for
  deliberate, audited super-admin paths. Never ship it to the client; never reach
  for it to "make a query work".
- Client reads go through the anon key + RLS. If a query needs the service role to
  succeed, that's a design smell — fix the policy, don't escalate.

## Keep files small and single-purpose

Route files (`+page.svelte`, `+page.server.ts`) are **composition roots**. A
`+page.svelte` mostly wires components together; a `+page.server.ts` mostly calls a
data function and returns. If a component grows past ~300 lines it's a smell; past
~500 it's a bug in how it's split.

- **Presentation** → `.svelte` components under `src/lib/components/**`.
- **UI copy / chrome** → a central content module keyed by `Locale`.
- **Pure logic** (recurrence expansion, RRULE parsing, `.ics` building, geo
  formatting, embed-param parsing) → plain `.ts`, colocated with its consumer or
  under `src/lib/**` if shared.
- **Data access** → `src/lib/server/**` (Supabase clients, queries). Server-only
  code never leaks into the client bundle.

## Pure and testable by default

- A pure helper takes its inputs as **arguments** and returns a value. It must not
  reach into `page.url`, `localStorage`, Supabase, or the DOM. Thread those in as
  params — that's what makes it unit-testable. Recurrence expansion
  (`rrule + window → occurrences`) is the reference: pure, deterministic.
- When extracting from a component, split the **pure core** from the **I/O shell**:
  the pure function takes plain data; a thin wrapper does the DB / DOM work.
- **Vitest covers the pure logic** (`pnpm test`): recurrence, time zones, filters,
  `.ics`, locale resolution. New branching logic ships with a test. Colocate as
  `foo.ts` + `foo.test.ts`.

## Reuse before you build

Before hand-rolling UI or a helper, grep `src/lib` for what exists.

- Icons → `@lucide/svelte`. Don't inline bespoke SVGs for common glyphs.
- Recurrence → a maintained RRULE library, not a homemade frequency parser (see
  [docs/adr/0004](docs/adr/0004-recurrence-series-occurrences-rrule.md)).
- Repeated surface/button shells live as `@layer components` classes in
  `src/app.css`. Reuse them; don't re-derive the same padding/radius by hand.
- Never hand-roll what a proven library does. Add a dep before writing bespoke code.

If you copy a block a second time, stop and extract it.

## Styling

- **Tailwind v4 utilities, inline.** Design tokens are defined once in
  `src/app.css`: the shadcn semantic colours (`background`, `foreground`, `card`,
  `primary`, `muted`, `muted-foreground`, `border`, …), brand accents
  (`primary-soft`, `sand`), the category palette (`cat-milonga`,
  `cat-milonga-strong`, …), fonts (DM Sans for everything, self-hosted via
  Fontsource; `font-display` marks headings and adds weight and tracking) and the
  type scale (`text-step-1`–`text-step4`). Use those tokens; don't introduce raw
  hex or one-off font sizes inline.
- **Phones first.** Primary action buttons (form submits, "new event", the filter
  drawer's confirm) are full width below `sm` (`w-full sm:w-auto`).
- **UI primitives come from shadcn-svelte** (bits-ui underneath) in
  `src/lib/components/ui`. Add more with
  `pnpm dlx shadcn-svelte@latest add <name>`; edit the copies freely.
- **Repeated multi-property patterns** become an `@layer components` class in
  `app.css`. A genuinely one-off gradient or `clamp()` value may live in an inline
  `style=` only when there's no clean utility.
- **Border-radius by role:** `rounded-full` for pills/tokens/buttons; `--radius-soft`
  or `rounded-2xl` for surfaces/cards. Don't scatter arbitrary radii.
- **Respect `prefers-reduced-motion`.** All motion must gate on it; `app.css`
  already neutralises animation under the media query — don't regress that.
- **The embed must look identical everywhere.** Embed styling is self-contained; it
  must never depend on inheriting the host page's CSS.

## Svelte (runes only)

State is `$state` / `$derived` / `$props` — never Svelte 4 style. If you see
`export let`, `$:`, or `$$props`/`$$restProps`, it's legacy — migrate it.

- **`$derived` is the default for computed state; `$effect` is a last resort.** If a
  value is a function of other state, it's a `$derived`. Reserve `$effect` for true
  side effects outside the reactive graph: DOM measurement, `matchMedia`/event
  listeners, timers, the embed's `postMessage` auto-height handshake.
- **Never use `$effect` to keep one piece of state in sync with another.** A
  `$derived` is writable in Svelte 5: a local `bind:` edit overrides it until a
  dependency changes, then it resyncs.
- **`onMount` for one-time, non-reactive setup; `$effect` when setup must re-run.**

## Clarity and naming

- **Spell it out.** Full words: `occurrence` not `occ`, `organization` not `org` in
  identifiers (the `org_id` column is the one blessed exception, matching SQL).
  Widely understood initialisms (`url`, `id`, `api`, `seo`, `rrule`, `ics`) are fine.
- **Name the props type; don't inline it.** Declare `type Props = { … }` above the
  destructure and annotate with it.
- **Type the locale.** Anything language-keyed uses the shared `Locale` type, not a
  bare `string`.
- **No nested ternaries** — an `else if` chain reads better. **Prefer guard clauses**
  over wrapping the body in an `if`; keep nesting shallow.
- **Comment the _why_, not the _what_.** A comment earns its place only when it
  carries a footgun, a constraint, or a non-obvious reason. Delete comments that
  restate the line.

## Imports

- **`$lib` alias for cross-feature imports; relative paths for colocated siblings.**
  Reach into shared code through `$lib`, not `../../..` chains. A file importing its
  own sibling uses a plain relative path.

## SvelteKit (dynamic SSR + API)

- **Public pages are server-rendered and are the SEO home.** Give them proper
  canonical / og / hreflang tags. Don't push SEO onto embeds — see
  [docs/adr/0005](docs/adr/0005-embedding-api-ssr-iframe.md).
- **The read API is a stable, versioned contract.** Consumers (tkRaum) server-render
  from it. Don't break its shape casually; treat it like a public interface.
- **The iframe embed route** is self-contained: its own styling, a `postMessage`
  auto-height handshake, and view/filter params (`view`, `org`, `category`, `city`).
- **Validate all untrusted input** — route params, query strings, API bodies, embed
  params — before use. Never trust `params`/`url.searchParams` raw.
- **Never put PII in URLs or query strings.** Wann-der holds little PII, but the rule
  is absolute.

## Copy & i18n

- **User-facing UI chrome is trilingual (de/en/fr)** and lives in a central content
  module keyed by `Locale`. Never hardcode a visible string in a component.
- **Event content** (title, description) is machine-translated on save and cached
  per locale, with human overrides winning — that's a data path, distinct from UI
  chrome copy.
- **Never use em dashes (`—`) in user-facing copy.** Not in headings, labels,
  placeholders, aria-labels, titles/descriptions, or error messages. Use a comma, a
  colon, or a period. This is a hard rule. En dashes in real ranges (`Mon–Thu`) are
  fine. Code comments are exempt.

## Privacy & GDPR

- **EU-only data path.** Supabase EU, EU/OSM map tiles + geocoder (not Google Maps),
  DeepL (EU). Don't introduce a US-based data processor without an ADR.
- **Strip EXIF on photo upload; never overwrite the original** with a derivative.
- Design so a User / Org can be erased. Keep anything erasable cleanly separable.

## Before you finish

- `npm run format` (Prettier `--write`) has been run so the tree is formatted.
- `npm run check` (svelte-kit sync + svelte-check) passes — zero errors.
- `npm run build` succeeds.
- No `: any` where a real type fits; no stray `console.*` left in.
- No em dashes in user-facing copy; new UI strings exist in all three locales.
- New tables shipped **with** their RLS policies in the same migration.

## Committing

- **Never commit. The human commits, always.** Agents stage nothing and run no
  `git commit`, `git push`, or history-rewriting commands. Leave changes in the
  working tree for the human to review — even when asked to "finish" or "wrap up".
  If a commit seems warranted, say so and stop.
