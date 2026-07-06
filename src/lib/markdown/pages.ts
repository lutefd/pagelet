import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import { renderMarkdownDocument } from './render';
import type { PageMeta, PageSummary, RenderedPage } from './types';

const contentDirectory = join(process.cwd(), 'content', 'pages');

const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  theme: z.literal('default').default('default')
});

export async function listPageSlugs(): Promise<string[]> {
  const files = await readdir(contentDirectory);

  return files
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''))
    .sort();
}

export async function listPages(): Promise<PageSummary[]> {
  const slugs = await listPageSlugs();
  const pages = await Promise.all(slugs.map((slug) => readPageSource(slug)));

  return pages.map(({ slug, meta }) => ({
    slug,
    title: meta.title,
    description: meta.description
  }));
}

export async function loadPage(slug: string): Promise<RenderedPage | null> {
  if (!isFlatSlug(slug)) {
    return null;
  }

  try {
    const source = await readPageSource(slug);
    return {
      slug,
      meta: source.meta,
      blocks: await renderMarkdownDocument(source.body)
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }

    throw error;
  }
}

async function readPageSource(slug: string): Promise<{ slug: string; meta: PageMeta; body: string }> {
  const raw = await readFile(join(contentDirectory, `${slug}.md`), 'utf8');
  const parsed = matter(raw);
  const meta = frontmatterSchema.parse(parsed.data);

  return {
    slug,
    meta,
    body: parsed.content
  };
}

function isFlatSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug);
}

function isMissingFileError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}
