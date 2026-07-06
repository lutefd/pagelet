# Pagelet

Pagelet is a small personal publishing platform for turning Markdown files into polished,
shareable static pages. Markdown stays the source of truth, with a controlled set of
prebuilt Svelte components available through shortcodes.

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

The static build is written to `build/`.

## Serve the Static Build

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

## Cloudflared Deployment

For a personal home server, the recommended setup is to run `cloudflared` as
server-level infrastructure, either with systemd or a separate server-wide Docker
Compose stack. That lets one tunnel route multiple apps and keeps Pagelet restarts
from affecting the tunnel.

Build and run Pagelet on the server:

```sh
docker build -t pagelet .
docker run -d --name pagelet --restart unless-stopped -p 3000:3000 pagelet
```

Then configure a Cloudflare Tunnel public hostname to route to:

```txt
http://127.0.0.1:3000
```

If Pagelet and cloudflared share a Docker network, route to:

```txt
http://pagelet:3000
```

### Optional Project-Local Tunnel

Create a Cloudflare Tunnel token in the Cloudflare dashboard, then copy `.env.example`
to `.env` and set:

```sh
CLOUDFLARED_TOKEN=your-token
```

Start the app and tunnel:

```sh
docker compose up -d --build
```

Configure the tunnel's public hostname in Cloudflare to route to:

```txt
http://pagelet:3000
```
