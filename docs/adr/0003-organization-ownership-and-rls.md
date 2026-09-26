---
name: adr-0003-organization-ownership-and-rls
description: Events are owned by Organizations (teams), not individuals; isolation enforced by RLS
metadata:
  type: reference
---

# ADR-0003: Organization/Team ownership with RLS isolation

**Status:** Accepted
**Date:** 2026-08-03

## Context

The founding feature is collaboration — "a Luma that lets collaborators work on the
same calendar." But organizers also must not be able to touch each other's events.
The unit of ownership had to be decided:

- **Solo organizer** (account = its own events): simplest, but no co-editing —
  kills the collaboration pitch.
- **Region-wiki** (anyone in a region edits a shared calendar): maximally open, but
  "can't touch others' events" becomes meaningless and moderation is harder.
- **Organization/Team**: a person (User) belongs to one or more Orgs; the Org owns
  Venues + Events; members co-edit with roles; cross-org is read-only.

## Decision

**Organization/Team ownership.** `User` _member-of_ (role: `owner` | `editor`)
`Organization` _owns_ `Venue` and `Event`. Co-editing happens within an Org;
cross-org access is read-only. Isolation is enforced by **Postgres Row-Level
Security** keyed on Org membership, not by application checks alone.

## Consequences

- Delivers "collaborators on one calendar" and "can't mess with others' events" in a
  single model ✅
- RLS makes isolation a database invariant — a forgotten app-layer check can't leak
  data ✅
- Every Org-owned table needs an `org_id` and RLS policies from day one ⚠️
- Membership, invites, and role management are now product surface to build (invite
  by email → accept → editor)
- A User in multiple Orgs is supported (someone who runs two communities)

**Why:** Team ownership is the only model that satisfies both collaboration and
isolation; RLS turns isolation into a guarantee rather than a convention.
**How to apply:** No Org-owned row is queried without an `org_id` scope. Write RLS
policies alongside every new table. The super-admin role bypasses Org scoping by
design (see glossary), through a separate, audited path.
