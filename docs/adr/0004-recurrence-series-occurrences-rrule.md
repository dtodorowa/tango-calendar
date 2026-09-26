---
name: adr-0004-recurrence-series-occurrences-rrule
description: Events are series carrying an iCal RRULE; the system materializes Occurrences
metadata:
  type: reference
---

# ADR-0004: Recurrence as series + Occurrences, stored as iCal RRULE

**Status:** Accepted
**Date:** 2026-08-03

## Context

Organizers run weekly milongas, monthly events, "repeat 5 times this month," etc.
Recurrence is the classic calendar failure mode (exceptions, editing one instance vs
the series). The product rule is "adding events should be super easy." Options:

- **No recurrence**: every date is a separate Event (copy/paste 52 times). Worst UX.
- **Homemade recurrence fields**: our own frequency columns — but then we must
  translate to iCal RRULE anyway for add-to-calendar and .ics import/export.
- **Series + Occurrences with RRULE storage**: an Event is a series carrying an iCal
  **RRULE**; the system materializes one **Occurrence** per date; a single Occurrence
  can be cancelled/overridden.

The UI-exposed patterns (a few friendly options) are a _subset_ of RRULE; storing
full RRULE means the UI can grow later with **no database change**.

## Decision

An **Event is a series** with recurrence stored as an **iCal RRULE**. The system
materializes **Occurrences** (one per date), which is what lists, maps, and embeds
display. A single Occurrence can be cancelled or overridden (skip a date; different
time/venue) without touching the series. v1 UI exposes only friendly options
(weekly / monthly / every-N / repeat x times, end by date or count); storage is the
full standard.

## Consequences

- "Add to calendar" and .ics import/export work with no translation layer ✅
- Translation and photo live on the series → a weekly event is translated once, not
  per date ✅
- UI can expand toward full RRULE later without migrations ✅
- Materialization strategy (store occurrences vs expand on read within a window)
  must be chosen at build time; recommended: expand within a bounded window on read,
  persist only overrides/cancellations ⚠️
- Overrides/exceptions need their own small table (per-Occurrence deltas + EXDATE)

**Why:** RRULE is the lingua franca of every calendar app; a friendly UI over
standard storage gives easy authoring now and interoperability forever.
**How to apply:** Never invent a bespoke recurrence encoding. Persist RRULE; derive
Occurrences; store only per-date overrides and cancellations as deltas.
