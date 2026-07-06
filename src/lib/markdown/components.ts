import { z } from 'zod';
import Callout from '$lib/components/markdown/Callout.svelte';
import Card from '$lib/components/markdown/Card.svelte';
import Checklist from '$lib/components/markdown/Checklist.svelte';
import Gallery from '$lib/components/markdown/Gallery.svelte';
import LinkCard from '$lib/components/markdown/LinkCard.svelte';
import Timeline from '$lib/components/markdown/Timeline.svelte';
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
  images: z.array(z.string().min(1)).min(1)
});

const checklistSchema = z.object({
  items: z.array(z.string().min(1)).min(1)
});

const timelineSchema = z.object({
  items: z.array(z.string().min(1)).min(1)
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

function parseWithSchema<Props>(schema: z.ZodType<Props>, value: unknown, name: string): Props {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid props for ::${name}: ${message}`);
  }

  return parsed.data;
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
    parse: (_attributes, body) => parseWithSchema(gallerySchema, { images: listBody(body) }, 'gallery')
  },
  checklist: {
    component: Checklist,
    parse: (_attributes, body) => parseWithSchema(checklistSchema, { items: listBody(body) }, 'checklist')
  },
  timeline: {
    component: Timeline,
    parse: (_attributes, body) => parseWithSchema(timelineSchema, { items: listBody(body) }, 'timeline')
  }
} satisfies Record<string, MarkdownComponentDefinition<Record<string, unknown>>>;

export type MarkdownComponentName = keyof typeof markdownComponents;
