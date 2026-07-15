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

### Map

Use for a named place and a direct link to an external map. Prefer a canonical Google Maps,
Apple Maps, or OpenStreetMap URL. Pagelet renders a place card rather than an interactive map.

```md
::map{name="Japan House" address="Av. Paulista, 52 — São Paulo" href="https://maps.google.com/?q=Japan+House"}
::
```

### Event

Use for a dated event. `date` must use `YYYY-MM-DD`. `time`, `timezone`, `location`, and an
absolute calendar `href` are optional. Do not invent missing schedule details.

```md
::event{title="Opening night" date="2026-07-18" time="19:00" timezone="BRT" location="Japan House" href="https://calendar.google.com/calendar/render?action=TEMPLATE"}
::
```

### Spotify

Use for a Spotify track, album, artist, playlist, episode, or show. Pass its public
`open.spotify.com` URL; Pagelet converts it into a lazy-loaded player.

```md
::spotify{href="https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6" title="Focus playlist"}
::
```

### YouTube

Use for a YouTube video or Short. Standard watch, short, embed, and `youtu.be` URLs are
accepted and rendered through YouTube's privacy-enhanced domain.

```md
::youtube{href="https://youtu.be/dQw4w9WgXcQ" title="Demo video"}
::
```

### Video

Use for a direct video file such as an MP4 or WebM hosted at a public URL. Pagelet renders a
lightweight custom player with play, replay, seek, speed, mute, volume, and fullscreen controls.
`poster`, `title`, and the visible `caption` are optional. For accessibility, provide a WebVTT
`captions` URL when one is available; `captionsLang` defaults to `en` and `captionsLabel` defaults
to `Captions`.

```md
::video{src="https://cdn.example.com/film.mp4" poster="https://cdn.example.com/poster.jpg" title="Launch film" caption="A short launch film." captions="https://cdn.example.com/film.vtt" captionsLang="en" captionsLabel="English"}
::
```

### Button

Use for one prominent external action such as registering, buying tickets, or downloading.
The body is the label. `variant` may be `primary` (the default) or `secondary`.

```md
::button{href="https://example.com/tickets" variant="primary"}
Buy tickets
::
```

### Details

Use for optional supporting information such as FAQs or accessibility notes. The body is
plain text. Set `open="true"` only when the content should initially be expanded.

```md
::details{title="Accessibility"}
The venue has step-free access.
::
```

## Composition guidance

- Prefer normal headings, paragraphs, lists, tables, quotes, and code fences for most content.
- Use no more component blocks than the content needs; components are emphasis, not a replacement for structure.
- Keep every component at the document root, separated by blank lines.
- Do not place component syntax inside lists, blockquotes, or other components.
- Do not use arbitrary Svelte components, JavaScript, inline event handlers, or unsanitized HTML.
- Use media embeds sparingly; introduce the track or video in nearby prose so the page remains useful if the provider is unavailable.
