import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { PageMeta, PageSummary } from '$lib/markdown/types';

type PageRow = {
  slug: string;
  title: string;
  description: string | null;
  theme: string;
  markdown: string;
  created_at: string;
  updated_at: string;
};

const databasePath = resolve(process.env.DATABASE_PATH ?? 'data/pagelet.sqlite');
mkdirSync(dirname(databasePath), { recursive: true });
const database = new DatabaseSync(databasePath);
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS pages (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    theme TEXT NOT NULL DEFAULT 'default',
    markdown TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  ) STRICT;
  CREATE TABLE IF NOT EXISTS idempotency_keys (
    key TEXT PRIMARY KEY,
    response_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;
`);

export function listStoredPages(): PageSummary[] {
  const rows = database.prepare('SELECT slug, title, description FROM pages ORDER BY updated_at DESC').all() as Array<Pick<PageRow, 'slug' | 'title' | 'description'>>;
  return rows.map((row) => ({ slug: row.slug, title: row.title, ...(row.description ? { description: row.description } : {}) }));
}

export function getStoredPage(slug: string): { meta: PageMeta; body: string; markdown: string; createdAt: string; updatedAt: string } | null {
  const row = database.prepare('SELECT * FROM pages WHERE slug = ?').get(slug) as PageRow | undefined;
  if (!row) return null;
  return {
    meta: { title: row.title, ...(row.description ? { description: row.description } : {}), theme: 'default' },
    body: row.markdown.replace(/^---[\s\S]*?---\s*/, ''),
    markdown: row.markdown,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function putStoredPage(slug: string, markdown: string, meta: PageMeta): { createdAt: string; updatedAt: string } {
  const now = new Date().toISOString();
  database.prepare(`
    INSERT INTO pages (slug, title, description, theme, markdown, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET title = excluded.title, description = excluded.description,
      theme = excluded.theme, markdown = excluded.markdown, updated_at = excluded.updated_at
  `).run(slug, meta.title, meta.description ?? null, meta.theme, markdown, now, now);
  const row = database.prepare('SELECT created_at, updated_at FROM pages WHERE slug = ?').get(slug) as Pick<PageRow, 'created_at' | 'updated_at'>;
  return { createdAt: row.created_at, updatedAt: row.updated_at };
}

export function deleteStoredPage(slug: string): boolean {
  return database.prepare('DELETE FROM pages WHERE slug = ?').run(slug).changes > 0;
}

export function getIdempotentResponse(key: string): unknown | null {
  const row = database.prepare('SELECT response_json FROM idempotency_keys WHERE key = ?').get(key) as { response_json: string } | undefined;
  return row ? JSON.parse(row.response_json) : null;
}

export function saveIdempotentResponse(key: string, response: unknown): void {
  database.prepare('INSERT OR IGNORE INTO idempotency_keys (key, response_json, created_at) VALUES (?, ?, ?)')
    .run(key, JSON.stringify(response), new Date().toISOString());
}
