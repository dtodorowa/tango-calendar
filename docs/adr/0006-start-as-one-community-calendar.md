---
name: adr-0006-start-as-one-community-calendar
description: v1 ships as the SaarLorLux+ Tango Calendar for one community; multi-tenant self-service comes later
metadata:
  type: reference
---

# ADR-0006: Start as one community's calendar, generalize later

**Status:** Accepted
**Date:** 2026-09-26
**Amends:** ADR-0001, ADR-0003 (timing only)

## Context

The design pack plans a multi-tenant platform from day one: any organizer signs up,
creates an Organization, and gets RLS-isolated data plus an embed. The tango scene
in the Greater Region needs a calendar now, and we don't yet know what organizers
actually want from the tool. Building sign-up, org management and invites before
anyone has used the calendar means guessing at all of it.

## Decision

Ship v1 as the **SaarLorLux+ Tango Calendar**: one community, one brand, designed
with the organizers who use it. Once it works for tango, turn it into an
open-source project other communities can fork or join.

What stays from the original plan:

- The data model keeps `org_id` on every organizer-owned row, and RLS ships with
  every table. An organizer is still an Organization in the schema.
- Recurrence, `.ics`, the read API and the embed keep working as designed.

What waits:

- Self-service org creation, invites and roles beyond "organizer can edit their own
  events".
- Per-community branding and theming.
- Category lists other than the tango set (milonga, práctica, workshop, festival,
  show, café).

## Consequences

- Categories and tags are a closed TypeScript union for now. Opening them up is a
  schema change we make when a second community shows up.
- The brand name lives in `src/lib/site.ts`, so a fork changes one file.
