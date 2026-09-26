---
name: adr-0005-embedding-api-ssr-iframe
description: API + host SSR is the primary embed path (host-domain SEO); iframe is the no-code fallback
metadata:
  type: reference
---

# ADR-0005: Embedding via API + host SSR (primary) and iframe (fallback); SEO on own domain

**Status:** Accepted
**Date:** 2026-08-03

## Context

Wann-der must be embeddable "everywhere" (WordPress, iframe, web components) and
must give a beautiful, consistent experience. It must _also_ let a consumer like
tkRaum have its embedded events **indexed on the consumer's own domain**. Key facts:

- An **iframe's** content is credited to the iframe's origin, **not** the host — so
  iframe-embedded events do **not** boost the host's SEO.
- A **web component** renders into the host DOM (themeable, host-SEO-capable) but is
  client-rendered JS, more to build, and WordPress can strip scripts.
- **Server-side rendering from an API** puts real event HTML on the _consumer's_
  domain — fully indexable as theirs, fully styled as theirs.
- Wann-der has its **own SSR public site** on its own domain regardless; that site
  is the canonical SEO home for every event.

## Decision

Three tiers, built in this order:

1. **API + host SSR (primary).** A REST/JSON API + `.ics` feed. Capable consumers
   (tkRaum and any coder) call it and **server-render** events natively → indexed on
   _their_ domain. This is how tkRaum integrates. **v1.**
2. **iframe (fallback).** A paste-and-go iframe with sealed styling, `postMessage`
   auto-height, and view/filter URL params (`view`, `org`, `category`, `city`) for
   no-code hosts. **v1.**
3. **WordPress plugin / server-rendered HTML snippet.** Gives no-code hosts
   own-domain SEO. **Later.** Web component for host theming: **later.** Native
   mobile app widgets: **out of scope.**

Wann-der's own SSR site (`/events/…`, `/org/…`, `/<city>`, `/<category>`, map) is
the canonical SEO layer and reuses the same components as the iframe.

## Consequences

- tkRaum's events are indexed as tkRaum's, with no iframe, via the API path ✅
- No-code hosts get a beautiful paste-and-go embed immediately ✅
- The UI is built once and reused by the SSR site and the iframe ✅
- The API is the load-bearing interface — it must be stable and versioned ⚠️
- No-code + own-domain-SEO hosts wait for the later WordPress/snippet tier

**Why:** SEO is owned by the consumer's SSR (via the API) and by Wann-der's own
domain — so the iframe's SEO weakness is irrelevant, and non-technical hosts still
get paste-and-go.
**How to apply:** Design the read API first; the SSR site and iframe are clients of
it. Never make the iframe the only way in.
