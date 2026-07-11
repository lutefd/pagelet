#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const origin = (process.env.PAGELET_ORIGIN ?? 'https://pages.luisdourado.com').replace(/\/$/, '');
const [command, ...args] = process.argv.slice(2);

if (!command || command === 'help' || command === '--help') usage(0);

try {
  if (command === 'publish') {
    const [file, slug] = args;
    if (!file || args.length > 2) usage(1);
    const markdown = await readFile(file, 'utf8');
    const key = createHash('sha256').update(`${origin}\0${slug ?? ''}\0${markdown}`).digest('hex');
    await request('/api/v1/pagelets', {
      method: 'POST',
      authenticated: true,
      headers: { 'content-type': 'application/json', 'idempotency-key': `pagelet-${key}` },
      body: JSON.stringify({ markdown, ...(slug ? { slug } : {}) })
    });
  } else if (command === 'update') {
    const [slug, file] = args;
    if (!slug || !file || args.length !== 2) usage(1);
    const markdown = await readFile(file, 'utf8');
    await request(`/api/v1/pagelets/${encodeURIComponent(slug)}`, {
      method: 'PUT', authenticated: true, headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ markdown })
    });
  } else if (command === 'get') {
    const [slug] = args;
    if (!slug || args.length !== 1) usage(1);
    await request(`/api/v1/pagelets/${encodeURIComponent(slug)}`);
  } else if (command === 'delete') {
    const [slug] = args;
    if (!slug || args.length !== 1) usage(1);
    await request(`/api/v1/pagelets/${encodeURIComponent(slug)}`, { method: 'DELETE', authenticated: true });
  } else {
    usage(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

async function request(path, options = {}) {
  const { authenticated = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  if (authenticated) {
    const key = process.env.PAGELET_API_KEY;
    if (!key) throw new Error('PAGELET_API_KEY is not set. Configure it in the agent environment; do not pass it as a command argument.');
    headers.set('authorization', `Bearer ${key}`);
  }
  const response = await fetch(`${origin}${path}`, { ...fetchOptions, headers });
  const text = await response.text();
  if (!response.ok) {
    let message = text;
    try {
      const parsed = JSON.parse(text);
      message = parsed.error?.message ?? text;
    } catch {}
    throw new Error(`Pagelet API ${response.status}: ${message || response.statusText}`);
  }
  if (text) {
    try { console.log(JSON.stringify(JSON.parse(text), null, 2)); }
    catch { console.log(text); }
  } else {
    console.log(JSON.stringify({ ok: true, status: response.status }));
  }
}

function usage(exitCode) {
  console.error(`Usage:
  pagelet.mjs publish <markdown-file> [slug]
  pagelet.mjs update <slug> <markdown-file>
  pagelet.mjs get <slug>
  pagelet.mjs delete <slug>`);
  process.exit(exitCode);
}
