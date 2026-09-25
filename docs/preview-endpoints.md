# Preview Endpoints Documentation

This document describes the OpenGraph (OG) image generation and preview endpoints available in the NeuroWealth Frontend application.

## Overview

The preview endpoints render dynamic SVG/PNG images using Next.js `next/og` (`ImageResponse`). These are used for social sharing cards, dashboard embeds, and interactive widget snapshots.

## Endpoints

### 1. `/api/transaction-preview`
Generates a visual summary card for a specific transaction.

- **Method:** `GET`
- **Query Parameters:**
  - `kind`: Transaction kind (`deposit`, `withdraw`, `rebalance`, `yield`, `transfer`)
  - `amount`: Transaction amount
  - `currency`: Currency symbol/code (e.g. `USD`, `XLM`)
  - `status`: Transaction status (`completed`, `pending`, `failed`)
  - `theme`: Color scheme (`light` | `dark`, default `dark`)
  - `timestamp`: ISO timestamp string or UNIX epoch

### 2. `/api/widget-preview`
Generates a snapshot card of portfolio and strategy metrics.

- **Method:** `GET`
- **Query Parameters:**
  - `scenario`: Scenario key or risk profile (`conservative`, `balanced`, `growth`)
  - `theme`: Color scheme (`light` | `dark`, default `dark`)
  - `horizon`: Projection horizon (e.g. `1y`, `5y`, `10y`)

## Route Configuration & Caching

- The preview routes inspect incoming request URL parameters (`request.url` / `searchParams`) on each invocation to render personalized preview cards.
- **Dynamic behavior:** In Next.js App Router, routes reading request URL parameters or search params are dynamically evaluated per request without requiring redundant `export const dynamic = "force-dynamic"` declarations.
- **Response Headers:** `Cache-Control` headers are set on the returned `ImageResponse` to allow CDN-level caching of static asset renders while preventing unwanted stale browser caches when needed.
