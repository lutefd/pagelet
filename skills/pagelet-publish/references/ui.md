# Pagelet UI reference

Pagelet renders GitHub-flavored Markdown with syntax-highlighted code blocks. Raw HTML is sanitized. Component blocks must be top-level and use the exact two-colon syntax below. Unknown components and invalid properties reject the whole publication.

## Frontmatter

```md
---
title: Required non-empty title
description: Optional page summary
theme: default
---
```

Only `default` is currently supported as a theme.

## Components

### Callout

Use for one short piece of important context. Valid types are `info`, `warning`, `success`, and `error`.

```md
::callout{type="warning"}
Reservations close at 18:00.
::
```

The UI displays the type as a label and the body as text. Keep the body concise; nested Markdown is not rendered inside components.

### Card

Use to visually group one titled idea.

```md
::card{title="Recommended route"}
Walk through the park before lunch.
::
```

### Link card

Use for a prominent external destination. `href` must be an absolute valid URL.

```md
::link-card{href="https://example.com" title="Official guide"}
Opening hours and current visitor information.
::
```

It opens in a new tab. The body becomes the optional description.

### Gallery

Use for one or more images. Each list item is used directly as an image URL; Pagelet does not upload or proxy images. Images render lazily with an empty alt attribute, so explain essential image meaning in nearby prose.

```md
::gallery
- https://example.com/first.jpg
- https://example.com/second.jpg
::
```

### Checklist

Use for reader-actionable tasks. Check state is interactive and stored locally in that reader's browser for the specific page and block position.

```md
::checklist
- Confirm the date
- Invite the team
::
```

Do not use it to represent authoritative shared completion state.

### Timeline

Use for chronological schedules or sequences.

```md
::timeline
- 09:00 Doors open
- 10:30 Opening talk
- 12:00 Lunch
::
```

## Composition guidance

- Prefer normal headings, paragraphs, lists, tables, quotes, and code fences for most content.
- Use no more component blocks than the content needs; components are emphasis, not a replacement for structure.
- Keep every component at the document root, separated by blank lines.
- Do not place component syntax inside lists, blockquotes, or other components.
- Do not use arbitrary Svelte components, JavaScript, inline event handlers, or unsanitized HTML.
