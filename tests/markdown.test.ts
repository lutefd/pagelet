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

  it('normalizes supported Spotify and YouTube URLs', async () => {
    const blocks = await renderMarkdownDocument(`
::spotify{href="https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6" title="Focus playlist"}
::

::youtube{href="https://youtu.be/dQw4w9WgXcQ" title="Demo video"}
::
`);

    expect(blocks).toMatchObject([
      {
        kind: 'component',
        name: 'spotify',
        props: {
          embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6',
          title: 'Focus playlist'
        }
      },
      {
        kind: 'component',
        name: 'youtube',
        props: {
          embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
          title: 'Demo video'
        }
      }
    ]);
  });

  it('rejects unsupported media URLs', async () => {
    await expect(renderMarkdownDocument(`::spotify{href="https://example.com/song"}\n::`)).rejects.toThrow(
      'Must be a supported spotify URL'
    );
    await expect(renderMarkdownDocument(`::youtube{href="https://example.com/video"}\n::`)).rejects.toThrow(
      'Must be a supported youtube URL'
    );
  });

  it('parses a direct video player with optional presentation and caption props', async () => {
    const blocks = await renderMarkdownDocument(`
::video{src="https://cdn.example.com/launch.mp4" poster="https://cdn.example.com/poster.jpg" title="Launch film" caption="A short launch film." captions="https://cdn.example.com/launch.vtt" captionsLang="en" captionsLabel="English"}
::
`);

    expect(blocks).toMatchObject([
      {
        kind: 'component',
        name: 'video',
        props: {
          src: 'https://cdn.example.com/launch.mp4',
          poster: 'https://cdn.example.com/poster.jpg',
          title: 'Launch film',
          caption: 'A short launch film.',
          captions: 'https://cdn.example.com/launch.vtt',
          captionsLang: 'en',
          captionsLabel: 'English'
        }
      }
    ]);
  });

  it('requires a valid direct video URL', async () => {
    await expect(renderMarkdownDocument(`::video{src="not-a-url"}\n::`)).rejects.toThrow(
      'Invalid props for ::video'
    );
  });

  it('parses button and details components', async () => {
    const blocks = await renderMarkdownDocument(`
::button{href="https://example.com/tickets" variant="secondary"}
Buy tickets
::

::details{title="Accessibility" open="true"}
The venue has step-free access.
::
`);

    expect(blocks).toMatchObject([
      {
        kind: 'component',
        name: 'button',
        props: { href: 'https://example.com/tickets', variant: 'secondary', label: 'Buy tickets' }
      },
      {
        kind: 'component',
        name: 'details',
        props: { title: 'Accessibility', open: true, content: 'The venue has step-free access.' }
      }
    ]);
  });

  it('applies the primary button default', async () => {
    const blocks = await renderMarkdownDocument(`::button{href="https://example.com"}\nVisit site\n::`);
    expect(blocks[0]).toMatchObject({ props: { variant: 'primary' } });
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
        props: { images: ['/a.jpg', '/b.jpg'], fit: 'cover', aspect: 'landscape', size: 'full' }
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

  it('parses controlled gallery image layout options', async () => {
    const blocks = await renderMarkdownDocument(`
::gallery{fit="contain" aspect="natural" size="medium"}
- /portrait.jpg
::
`);

    expect(blocks[0]).toMatchObject({
      kind: 'component',
      name: 'gallery',
      props: { images: ['/portrait.jpg'], fit: 'contain', aspect: 'natural', size: 'medium' }
    });
  });

  it('rejects unsupported gallery image layout options', async () => {
    await expect(
      renderMarkdownDocument(`
::gallery{fit="stretch" aspect="cinema" size="giant"}
- /a.jpg
::
`)
    ).rejects.toThrow('Invalid props for ::gallery');
  });
});
