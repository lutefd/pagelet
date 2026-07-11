# Pagelet

Pagelet is a small publishing service for turning Markdown into polished, shareable pages.
Agents can publish through a self-describing HTTP API, while Markdown stays the source of
truth and SQLite provides durable runtime storage.

## Write a Page

Add Markdown files to `content/pages`. A flat filename becomes the public slug:

```txt
content/pages/sao-paulo-saturday-plan.md -> /sao-paulo-saturday-plan
```

Frontmatter supports:

```md
---
title: Sao Paulo Saturday Plan
description: A small guide for food, walking, and music
theme: default
---
```

## Components

Pagelet supports registered component blocks only. Use two-colon Pagelet syntax:

```md
::callout{type="info"}
Start with coffee, then walk somewhere interesting.
::

::card{title="Lunch"}
Try somewhere casual, not absurdly expensive.
::

::link-card{href="https://example.com" title="Example"}
Short description.
::

::gallery
- /images/photo-1.svg
- /images/photo-2.svg
::

::checklist
- Book restaurant
- Send invite
::

::timeline
- 10:00 Breakfast
- 12:00 Museum
::
```

Unknown components or invalid props fail during development/build.

## Agent Publishing API

Point an agent at `https://your-pagelet.example/llms.txt` or
`https://your-pagelet.example/openapi.json`. Machine-readable discovery is also available
at `/.well-known/pagelet.json`.

Writes use `Authorization: Bearer <PAGELET_API_KEY>`. The main operations are:

- `POST /api/v1/pagelets` — publish a new pagelet; optionally provide a slug
- `PUT /api/v1/pagelets/{slug}` — create or replace a known slug
- `GET /api/v1/pagelets/{slug}` — read metadata and Markdown source
- `DELETE /api/v1/pagelets/{slug}` — delete a pagelet

The JSON body is `{"markdown":"...","slug":"optional"}`. Agents may instead send raw
`text/markdown` and use `X-Pagelet-Slug` on POST. Markdown must include frontmatter with a
`title`. POST supports `Idempotency-Key`, which agents should set to a unique value so a
retry cannot create a duplicate publication.

Example payload:

```json
{
  "slug": "release-notes",
  "markdown": "---\ntitle: Release Notes\ndescription: What changed\n---\n\n# Version 1\n\nShipped."
}
```

Successful responses include the public `url` to share. Invalid frontmatter, unsupported
components, and unsafe slugs return structured JSON errors before anything is stored.

## Local Development

```sh
pnpm install
pnpm dev
```

Useful checks:

```sh
pnpm check
pnpm test
pnpm build
```

The Node server build is written to `build/`. For local API testing, set `PAGELET_API_KEY`
and optionally `DATABASE_PATH` (defaults to `data/pagelet.sqlite`).

## Serve the Production Build

```sh
pnpm build
pnpm serve
```

The production static server listens on `0.0.0.0:3000`.

## Docker

Build and run Pagelet locally:

```sh
docker build -t pagelet .
docker run --rm -p 3000:3000 pagelet
```

## Production Deployment with Cloudflare Tunnel

The Compose stack intentionally publishes no host ports. Pagelet sits on an internal
Docker network and only its paired `cloudflared` container can reach it. The tunnel has a
separate egress network so it can connect to Cloudflare without placing Pagelet on that
network.

In Cloudflare Zero Trust, create a remotely managed tunnel and add exactly one public
hostname whose service is `http://pagelet:3000`. Copy `.env.example` to `.env` and set:

```sh
CLOUDFLARED_TOKEN=your-token
PAGELET_API_KEY=a-long-random-publishing-secret
PAGELET_ORIGIN=https://pages.example.com
```

Generate the API key with a password manager or `openssl rand -hex 32`. Then deploy:

```sh
docker compose up -d --build
```

Check the health endpoint and logs through Docker:

```sh
docker compose ps
docker compose logs --tail=100 pagelet cloudflared
```

The named `pagelet-data` volume holds the SQLite database. Back it up while the service is
stopped, or use SQLite's online backup tooling. Never expose port 3000 with a Compose
`ports` entry; all public traffic should enter through the tunnel. Rotate both the tunnel
token and publishing key if either is disclosed.
