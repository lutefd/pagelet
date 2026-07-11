import { describe, expect, it } from 'vitest';
import { renderMarkdownDocument } from '../src/lib/markdown/render';
import { parsePageSource } from '../src/lib/markdown/pages';

describe('Markdown rendering', () => {
  it('parses frontmatter metadata and renders Markdown HTML', async () => {
    const source = parsePageSource(`---
title: Example Page
description: A small example
theme: default
---

# Hello, Pagelet
`);
    const blocks = await renderMarkdownDocument(source.body);

    expect(source.meta).toMatchObject({
      title: 'Example Page',
      description: 'A small example',
      theme: 'default'
    });
    expect(blocks.some((block) => block.kind === 'html' && block.html.includes('<h1>'))).toBe(true);
  });

  it('parses registered shortcode blocks', async () => {
    const blocks = await renderMarkdownDocument(`::callout{type="success"}\nDone well.\n::`);

    expect(blocks).toEqual([
      {
        kind: 'component',
        name: 'callout',
        props: {
          type: 'success',
          content: 'Done well.'
        }
      }
    ]);
  });

  it('rejects unknown components', async () => {
    await expect(renderMarkdownDocument(`::carousel\nSomewhere\n::`)).rejects.toThrow(
      'Unknown Markdown component ::carousel'
    );
  });

  it('parses map and event components', async () => {
    const blocks = await renderMarkdownDocument(`
::map{name="Japan House" address="Av. Paulista, 52" href="https://maps.google.com/?q=Japan+House"}
::

::event{title="Opening night" date="2026-07-18" time="19:00" timezone="BRT" location="Japan House" href="https://calendar.google.com/calendar/render?action=TEMPLATE"}
::
`);

    expect(blocks).toMatchObject([
      {
        kind: 'component',
        name: 'map',
        props: {
          name: 'Japan House',
          address: 'Av. Paulista, 52',
          href: 'https://maps.google.com/?q=Japan+House'
        }
      },
      {
        kind: 'component',
        name: 'event',
        props: {
          title: 'Opening night',
          date: '2026-07-18',
          time: '19:00',
          timezone: 'BRT',
          location: 'Japan House'
        }
      }
    ]);
  });

  it('rejects malformed event dates', async () => {
    await expect(renderMarkdownDocument(`::event{title="Launch" date="July 18"}\n::`)).rejects.toThrow(
      'Invalid props for ::event'
    );
  });

  it('rejects invalid component props', async () => {
    await expect(renderMarkdownDocument(`::callout{type="loud"}\nListen.\n::`)).rejects.toThrow(
      'Invalid props for ::callout'
    );
  });

  it('parses list bodies for gallery, checklist, and timeline components', async () => {
    const blocks = await renderMarkdownDocument(`
::gallery
- /a.jpg
- /b.jpg
::

::checklist
- Book restaurant
- Send invite
::

::timeline
- 10:00 Breakfast
- 12:00 Museum
::
`);

    expect(blocks).toMatchObject([
      {
        kind: 'component',
        name: 'gallery',
        props: { images: ['/a.jpg', '/b.jpg'] }
      },
      {
        kind: 'component',
        name: 'checklist',
        props: { items: ['Book restaurant', 'Send invite'] }
      },
      {
        kind: 'component',
        name: 'timeline',
        props: { items: ['10:00 Breakfast', '12:00 Museum'] }
      }
    ]);
  });
});
