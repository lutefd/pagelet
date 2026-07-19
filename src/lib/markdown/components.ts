import { z } from 'zod';
import Callout from '$lib/components/markdown/Callout.svelte';
import Card from '$lib/components/markdown/Card.svelte';
import Checklist from '$lib/components/markdown/Checklist.svelte';
import Gallery from '$lib/components/markdown/Gallery.svelte';
import LinkCard from '$lib/components/markdown/LinkCard.svelte';
import Timeline from '$lib/components/markdown/Timeline.svelte';
import Map from '$lib/components/markdown/Map.svelte';
import Event from '$lib/components/markdown/Event.svelte';
import Spotify from '$lib/components/markdown/Spotify.svelte';
import YouTube from '$lib/components/markdown/YouTube.svelte';
import Video from '$lib/components/markdown/Video.svelte';
import Button from '$lib/components/markdown/Button.svelte';
import Details from '$lib/components/markdown/Details.svelte';
import type { MarkdownComponentDefinition } from './types';

const calloutSchema = z.object({
  type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
  content: z.string().min(1)
});

const cardSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1)
});

const linkCardSchema = z.object({
  href: z.string().url(),
  title: z.string().min(1),
  description: z.string().optional()
});

const gallerySchema = z.object({
  images: z.array(z.string().min(1)).min(1),
  fit: z.enum(['cover', 'contain']).default('cover'),
  aspect: z.enum(['landscape', 'square', 'portrait', 'natural']).default('landscape'),
  size: z.enum(['full', 'medium', 'small']).default('full')
});

const checklistSchema = z.object({
  items: z.array(z.string().min(1)).min(1)
});

const timelineSchema = z.object({
  items: z.array(z.string().min(1)).min(1)
});

const mapSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  href: z.string().url()
});

const eventSchema = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must use YYYY-MM-DD'),
  time: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  href: z.string().url().optional()
});

const mediaSchema = z.object({
  href: z.string().url(),
  title: z.string().min(1).optional()
});

const videoSchema = z.object({
  src: z.string().url(),
  poster: z.string().url().optional(),
  title: z.string().min(1).optional(),
  caption: z.string().min(1).optional(),
  captions: z.string().url().optional(),
  captionsLang: z.string().min(2).optional(),
  captionsLabel: z.string().min(1).optional()
});

const buttonSchema = z.object({
  href: z.string().url(),
  variant: z.enum(['primary', 'secondary']).default('primary'),
  label: z.string().min(1)
});

const detailsSchema = z.object({
  title: z.string().min(1),
  open: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  content: z.string().min(1)
});

function textBody(body: string): string {
  return body.trim();
}

function listBody(body: string): string[] {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);
}

function parseWithSchema<Props>(schema: z.ZodType<Props, z.ZodTypeDef, unknown>, value: unknown, name: string): Props {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid props for ::${name}: ${message}`);
  }

  return parsed.data;
}

function spotifyEmbedUrl(href: string): string | undefined {
  const url = new URL(href);
  const match = url.pathname.match(/^\/(track|album|artist|playlist|episode|show)\/([A-Za-z0-9]+)\/?$/);

  if (url.hostname !== 'open.spotify.com' || !match) return undefined;
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
}

function youtubeEmbedUrl(href: string): string | undefined {
  const url = new URL(href);
  let id: string | undefined;

  if (url.hostname === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0];
  if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
    id = url.pathname === '/watch' ? url.searchParams.get('v') ?? undefined : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
  }

  if (!id || !/^[A-Za-z0-9_-]{6,}$/.test(id)) return undefined;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

function parseMedia(attributes: Record<string, unknown>, name: 'spotify' | 'youtube') {
  const media = parseWithSchema(mediaSchema, attributes, name);
  const embedUrl = name === 'spotify' ? spotifyEmbedUrl(media.href) : youtubeEmbedUrl(media.href);

  if (!embedUrl) throw new Error(`Invalid props for ::${name}: href: Must be a supported ${name} URL`);
  return { embedUrl, title: media.title };
}

export const markdownComponents = {
  callout: {
    component: Callout,
    parse: (attributes, body) =>
      parseWithSchema(calloutSchema, { ...attributes, content: textBody(body) }, 'callout')
  },
  card: {
    component: Card,
    parse: (attributes, body) => parseWithSchema(cardSchema, { ...attributes, content: textBody(body) }, 'card')
  },
  'link-card': {
    component: LinkCard,
    parse: (attributes, body) =>
      parseWithSchema(
        linkCardSchema,
        {
          ...attributes,
          description: textBody(body) || undefined
        },
        'link-card'
      )
  },
  gallery: {
    component: Gallery,
    parse: (attributes, body) =>
      parseWithSchema(gallerySchema, { ...attributes, images: listBody(body) }, 'gallery')
  },
  checklist: {
    component: Checklist,
    parse: (_attributes, body) => parseWithSchema(checklistSchema, { items: listBody(body) }, 'checklist')
  },
  timeline: {
    component: Timeline,
    parse: (_attributes, body) => parseWithSchema(timelineSchema, { items: listBody(body) }, 'timeline')
  },
  map: {
    component: Map,
    parse: (attributes) => parseWithSchema(mapSchema, attributes, 'map')
  },
  event: {
    component: Event,
    parse: (attributes) => parseWithSchema(eventSchema, attributes, 'event')
  },
  spotify: {
    component: Spotify,
    parse: (attributes) => parseMedia(attributes, 'spotify')
  },
  youtube: {
    component: YouTube,
    parse: (attributes) => parseMedia(attributes, 'youtube')
  },
  video: {
    component: Video,
    parse: (attributes) => parseWithSchema(videoSchema, attributes, 'video')
  },
  button: {
    component: Button,
    parse: (attributes, body) =>
      parseWithSchema(buttonSchema, { ...attributes, label: textBody(body) }, 'button')
  },
  details: {
    component: Details,
    parse: (attributes, body) =>
      parseWithSchema(detailsSchema, { ...attributes, content: textBody(body) }, 'details')
  }
} satisfies Record<string, MarkdownComponentDefinition<Record<string, unknown>>>;

export type MarkdownComponentName = keyof typeof markdownComponents;
