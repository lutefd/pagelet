# Pagelet

Pagelet is a small publishing service for turning Markdown into polished, shareable pages.
Agents can publish through a self-describing HTTP API, while Markdown stays the source of
truth and SQLite provides durable runtime storage.

## Install the Agent Skill

Install Pagelet publishing support into Codex, Claude Code, Cursor, GitHub Copilot, and
other Agent Skills-compatible tools with one command:

```sh
npx skills add lutefd/pagelet --skill pagelet-publish
```

The installer prompts for the target agent and project/global scope. Configure
`PAGELET_API_KEY` in that agent's secret settings or an ignored, mode-`0600` `.env` file;
do not paste it into a prompt or commit it. The client parses `.env` from the working
directory without executing it, and existing process environment variables take
precedence. Set `PAGELET_ENV_FILE` to select another dotenv file. The skill defaults to
`https://pages.luisdourado.com`; set `PAGELET_ORIGIN` alongside the key to use another
Pagelet installation.

After installation, ask the agent naturally, for example:

```text
Publish these release notes as a Pagelet and give me the shareable URL.
Update my launch-plan Pagelet with this Markdown.
Turn these trip notes into a polished Pagelet with a timeline and checklist.
```

The distributable skill lives in `skills/pagelet-publish` and includes the publishing
client, complete component/UI guidance, and API error handling.

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

::map{name="Japan House" address="Av. Paulista, 52" href="https://maps.google.com/?q=Japan+House"}
::

::event{title="Opening night" date="2026-07-18" time="19:00" timezone="BRT" location="Japan House" href="https://calendar.google.com/calendar/render?action=TEMPLATE"}
::

::spotify{href="https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6" title="Focus playlist"}
::

::youtube{href="https://youtu.be/dQw4w9WgXcQ" title="Demo video"}
::

::button{href="https://example.com/tickets" variant="primary"}
Buy tickets
::

::details{title="Accessibility"}
The venue has step-free access.
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

The production Node server listens on `0.0.0.0:3000`.

## Docker

Build and run Pagelet locally:

```sh
docker build -t pagelet .
docker run --rm -p 3000:3000 pagelet
```

## Production Deployment with Cloudflare Tunnel

The Compose stack intentionally publishes no host ports. Pagelet joins the external,
server-wide `cloudflare_ingress` Docker network, where the independently managed
`cloudflared` connector can reach it at `http://pagelet:3000`.

The tunnel is infrastructure shared by multiple home-server applications and is not owned
by this repository. In Cloudflare Zero Trust, add a public hostname whose service is
`http://pagelet:3000`.

### Create the ingress network

Create the shared internal network once, before starting Pagelet:

```sh
docker network create --driver bridge --internal cloudflare_ingress
```

The network is marked `internal`; the standalone tunnel connector uses its own separate
egress network for Cloudflare connectivity. Manage the connector and its token in the
server infrastructure project rather than in Pagelet.

### Configure and deploy

Copy `.env.example` to `.env` and set the Pagelet values:

```sh
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
docker compose logs --tail=100 pagelet
```

The explicitly named `pagelet_pagelet-data` volume holds the SQLite database and remains
stable even if the Compose project or directory is renamed. Back it up while the service
is stopped, or use SQLite's online backup tooling. Never expose port 3000 with a Compose
`ports` entry; all public traffic should enter through the tunnel. Rotate the publishing
key if it is disclosed.
