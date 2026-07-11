---
name: pagelet-publish
description: Publish, update, inspect, and remove polished shareable Pagelet pages from Markdown through the Pagelet API. Use when a user asks an agent to publish or share Markdown, turn notes or a document into a hosted page, create a Pagelet, update an existing Pagelet URL, or compose content using Pagelet's callouts, cards, galleries, checklists, timelines, and link cards.
---

# Publish with Pagelet

Turn user content into valid Pagelet Markdown, preview the source with the user when material editorial choices are required, and publish through the bundled client.

## Configure access

Require `PAGELET_API_KEY`. The bundled client first honors the agent process environment,
then parses `.env` in the current working directory without executing it as shell code.
Set `PAGELET_ENV_FILE` to use a different dotenv file. Default to
`https://pages.luisdourado.com`; honor `PAGELET_ORIGIN` when set for another installation.

Never ask the user to paste an API key into chat, embed it in Markdown, write it into a
tracked file, or print it in command output. Accept an ignored, mode-`0600` `.env` file for
local use. If the key is missing, tell the user to configure `PAGELET_API_KEY` in their
agent's secret settings or ignored `.env` and stop before publishing.

## Compose the page

1. Preserve the user's meaning and requested tone.
2. Add YAML frontmatter with a concise `title`, optional `description`, and `theme: default`.
3. Use ordinary GitHub-flavored Markdown by default.
4. Add Pagelet components only when they materially improve scanning or interaction. Read [references/ui.md](references/ui.md) before using components.
5. Use absolute HTTPS image URLs for remotely accessible galleries. Do not invent URLs or upload assets implicitly.
6. Save the complete source to a temporary or user-designated `.md` file.

Minimum valid document:

```md
---
title: Project Notes
description: Decisions and next steps
theme: default
---

# Project Notes

The work is ready to begin.
```

## Publish

Run the bundled client with Node.js 18 or later:

```sh
node <skill-directory>/scripts/pagelet.mjs publish <markdown-file> [slug]
```

Omit the slug unless the user requested one; Pagelet derives it from the title. The client supplies a deterministic idempotency key, so retry the same command safely after network uncertainty.

Return the public URL from the successful response. Do not claim success unless the command returns a URL.

## Update, inspect, or delete

Use an explicit slug for mutations:

```sh
node <skill-directory>/scripts/pagelet.mjs update <slug> <markdown-file>
node <skill-directory>/scripts/pagelet.mjs get <slug>
node <skill-directory>/scripts/pagelet.mjs delete <slug>
```

Treat deletion as destructive: confirm the exact slug with the user immediately before running it. Updating replaces the complete stored Markdown document at that slug.

Read [references/api.md](references/api.md) when diagnosing API errors, integrating without the client, or explaining the protocol.

## Handle failures

- `401`: the publishing key is absent or invalid; ask the user to repair agent secret configuration.
- `409`: the slug exists; use `update` only if the user intends to replace it, otherwise choose a distinct slug.
- `422`: correct the frontmatter, component syntax, URL, or slug reported by the API, then retry.
- `503`: the Pagelet server has no publishing key configured; report an operator-side configuration issue.
- Network uncertainty after POST: rerun the identical publish command so its idempotency key is reused.
