---
name: adr-0007-host-on-vercel-fra1
description: The SvelteKit app deploys to Vercel with functions pinned to fra1; data stays in Supabase EU
metadata:
  type: reference
---

# ADR-0007: Host on Vercel, functions in Frankfurt

**Status:** Proposed
**Date:** 2026-09-26

## Context

AGENTS.md requires an ADR before adding a US-based data processor. Vercel is a US
company. The app needs SSR and API routes, previews per branch, and zero server
maintenance for a volunteer-run project.

## Decision

Deploy with `@sveltejs/adapter-vercel`, serverless functions pinned to `fra1`
(Frankfurt) so they run next to the Supabase EU project.

- Event data, accounts and photos live in Supabase EU. Vercel serves pages and runs
  functions but holds no database.
- Vercel's request logs contain IP addresses. That goes in the privacy notice, and
  we sign Vercel's DPA (EU Standard Contractual Clauses) before launch.

## Alternatives

- **Netlify:** same US-processor question, no advantage for SvelteKit.
- **An EU host (Hetzner, Scaleway) with adapter-node:** fully EU, but someone has
  to patch and monitor a server. Worth revisiting if the DPA route is rejected.

## Consequences

Switching hosts means swapping the adapter in `vite.config.ts`. Nothing in `src/`
depends on Vercel.
