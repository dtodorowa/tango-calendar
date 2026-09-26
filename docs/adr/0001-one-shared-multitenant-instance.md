---
name: adr-0001-one-shared-multitenant-instance
description: Wann-der is one shared multi-tenant instance; tkRaum is a consumer, not a separate deployment
metadata:
  type: reference
---

# ADR-0001: One shared multi-tenant instance, not per-community deployments

**Status:** Accepted
**Date:** 2026-08-03

## Context

Wann-der must serve many communities (tango, yoga, …) across a cross-border region
(Saarland, Grand Est, Trier, …), and tkRaum wants to show _its_ events on its own
site. Two topologies were considered:

- **Two+ instances**: a dedicated tkRaum-branded calendar plus a community one (and
  eventually one per community / self-host).
- **One shared multi-tenant instance**: communities and regions are data; everyone
  embeds a filtered view of the same pool.

The founding motivation was: _organizers can't see what other organizers in the
region are doing, so they double-book_. Separate instances reintroduce exactly that
fragmentation — tkRaum's events would be invisible on the regional map, requiring
sync/duplication.

The data-isolation fear ("don't mess up tkRaum's database") is satisfied
independently: tkRaum's **app + booking/PII database stays a separate system**.
Wann-der only ever holds _public_ event data.

## Decision

Run Wann-der as **one shared multi-tenant instance**. Regions and communities are
rows, not servers. tkRaum is a **consumer + one Organization**, showing a filtered,
branded view on its own site while its events also appear on the shared regional
map. Self-hosting stays possible later via configuration but is **not** built for on
day one (YAGNI).

## Consequences

- One map, one moderation surface, cross-community visibility ✅
- tkRaum's booking/PII DB remains fully separate and untouched ✅
- Multi-tenancy must be correct from day one (every row is tenant-scoped; see
  [ADR-0003](./0003-organization-ownership-and-rls.md)) ✅ / ⚠️
- No per-community branding beyond what filtered embeds + theming allow
- If a community ever demands hard isolation, self-host/dedicated instance is a
  later, config-driven option — not a rebuild

**Why:** Separate instances would recreate the regional-invisibility problem the
product exists to solve; the isolation people fear lives at the tkRaum _app_
boundary, not the calendar-instance boundary.
**How to apply:** Never hardcode a tenant. Every Org-owned row is scoped by
`org_id`. tkRaum integrates as a consumer, never by forking the deployment.
