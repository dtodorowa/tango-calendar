---
name: adr-0002-sveltekit-supabase-eu
description: Wann-der runs on SvelteKit + a new, separate Supabase EU project; Firebase rejected
metadata:
  type: reference
---

# ADR-0002: SvelteKit + Supabase EU (new project); not Firebase, not a custom backend

**Status:** Accepted
**Date:** 2026-08-03
**Related:** tkRaum ADR-0001 (Supabase EU over Firebase for GDPR)

## Context

Wann-der collects PII (organizer emails, possibly photos of people at events) from
EU residents, so GDPR data-residency applies — the same reasoning that made the
tkRaum project choose Supabase EU over Firebase. Options weighed:

- **Firebase** — easiest managed auth, but US data residency (fails EU residency)
  and Firestore's document model fights relational Org→Venue→Event→Region queries
  and geo/maps.
- **Custom backend (Rust/Go + Postgres)** — max control, but hand-building auth,
  storage, RLS, migrations, and a DPA is premature for a zero-scale non-profit.
- **SvelteKit + Supabase EU** — matches existing team skills and gives, in one EU
  vendor: Postgres + PostGIS (relational + maps), Auth (magic-link/OTP), Storage
  (webp photos), and Row-Level Security (per-Org isolation).

## Decision

Build Wann-der on **SvelteKit** with a **new, separate Supabase project in the EU
(Frankfurt)** — isolated from tkRaum's Supabase project. Deploy frontend on Vercel,
data on Supabase.

## Consequences

- Reuses the team's existing stack and mental model ✅
- GDPR-clean: EU residency + DPA, matching tkRaum's stance ✅
- RLS becomes the primary isolation mechanism (see
  [ADR-0003](./0003-organization-ownership-and-rls.md)) ✅
- Separate Supabase project = zero risk to tkRaum's data ✅
- Supabase vendor lock-in for auth/storage; acceptable given it is open-source and
  self-hostable if ever needed
- A custom high-performance backend can be introduced later _if and when_ a real
  scale problem exists — not before

**Why:** GDPR rules out Firebase (same reasoning as tkRaum ADR-0001); Supabase
happens to provide Postgres+PostGIS, Auth, Storage, and RLS — exactly Wann-der's
feature list — in one EU vendor.
**How to apply:** New Supabase EU project, never shared with tkRaum. Service-role
key stays server-side. All tenant isolation goes through RLS.
