---
name: wann-der-context
description: Domain glossary for Wann-der — the canonical terms used across code, database, and conversation
metadata:
  type: reference
---

# Wann-der Domain Glossary

> Wann-der is a standalone, multi-tenant, embeddable community events calendar.
> "When" + "wander": discover _when_ things are happening as you wander your local
> scene. Any organizer can self-manage their own events; any site can embed or read
> them. tkRaum is one consumer, not the owner.

## User

A person with a login (passwordless: email magic-link or OTP via Supabase Auth).
A User belongs to one or more Organizations, each with a role. A User owns no
events directly; events belong to Organizations.

## Organization (Org)

The unit of ownership and isolation. An Org owns its Venues and Events. Multiple
Users are members of an Org and co-edit the _same_ calendar. Members have a
**role**: `owner` (can invite/remove members, delete the Org) or `editor` (can
manage events and venues). A User in one Org has **read-only** visibility into
other Orgs' events. Isolation is enforced by Postgres Row-Level Security, not by
application code alone.

## Venue

A reusable physical location, entered **once** and referenced by many Events. On
creation the address is **geocoded** to `{lat, lng, city, admin_area, country}`.
Map pins use lat/lng; region filtering uses the derived city. Belongs to an Org.

## Event

A public **series** owned by an Org. Carries: title, description, category, an
optional hero photo, a Venue reference, and a **recurrence rule** stored as an iCal
RRULE. Translatable text (title, description) is machine-translated and cached per
locale. An Event materializes one or more **Occurrences**.

## Occurrence

One dated instance of an Event (e.g. "the milonga on Tue 12 Aug"). What the
calendar, map, and embeds actually display. An Occurrence can be individually
**cancelled** or **overridden** (different time or venue for one date) without
affecting the rest of the series.

## Placeholder Event

An Event created but **not yet public** — typically spawned when a tkRaum Booking is
_confirmed_. It becomes public only if the Org opts in and fills in the details.
The bridge from tkRaum: a booking exists as PII inside tkRaum; only on confirmation
(and only if the organizer chooses) does a Placeholder Event appear in Wann-der.

## Category

A curated, growable topic tag (tango, yoga, live-music, workshop, …). An Event's
category defaults from its Org but can be set per Event. Powers `?category=tango`
filtering and embeds. Not free text — curated to avoid duplicates and translation
sprawl.

## Consumer

Any site that reads or embeds the calendar. Three tiers:

1. **API + SSR consumer** (e.g. tkRaum, any coder): calls the REST/JSON API and
   server-renders events natively — content indexed on the _consumer's_ domain.
2. **iframe embedder** (no-code host): pastes an iframe; sealed styling, auto-height.
3. **WordPress / SSR-snippet embedder** (later): gets own-domain SEO without coding.

## Region (derived, not an entity)

Not a stored taxonomy. "Region" is _derived_ from a Venue's geocoded city / admin
area, or expressed spatially (map bounds, center + radius). There is no manual
region list to maintain.

## Super-admin

The platform operator (you). Can unpublish or delete **any** Event, and suspend or
ban an Org or User across the whole instance. An email-level ban blocks re-signup.
Distinct from an Org `owner`, whose powers stop at their own Org.

## Instance

Wann-der runs as **one shared multi-tenant instance**. Communities and regions are
data, not deployments. Self-hosting is possible later via config, but is not a
day-one goal.
