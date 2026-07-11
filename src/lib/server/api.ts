import { timingSafeEqual } from 'node:crypto';
import { json, type RequestEvent } from '@sveltejs/kit';
import { ZodError } from 'zod';

export const slugPattern = /^[a-z0-9][a-z0-9-]{0,62}$/;

export function requireWriteAuth(event: RequestEvent): Response | null {
  const configured = process.env.PAGELET_API_KEY;
  if (!configured) return apiError(503, 'not_configured', 'PAGELET_API_KEY is not configured on this server.');
  const supplied = event.request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const expectedBuffer = Buffer.from(configured);
  const suppliedBuffer = Buffer.from(supplied);
  if (expectedBuffer.length !== suppliedBuffer.length || !timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    return apiError(401, 'unauthorized', 'Use Authorization: Bearer <PAGELET_API_KEY>.');
  }
  return null;
}

export function apiError(status: number, code: string, message: string, details?: unknown): Response {
  return json({ error: { code, message, ...(details ? { details } : {}) } }, { status });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ZodError) return apiError(422, 'invalid_pagelet', 'Frontmatter is invalid.', error.flatten());
  const message = error instanceof Error ? error.message : 'The pagelet could not be processed.';
  return apiError(422, 'invalid_markdown', message);
}

export async function readMarkdownRequest(request: Request): Promise<{ markdown: string; slug?: string }> {
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('text/markdown') || contentType.includes('text/plain')) {
    return { markdown: await request.text(), slug: request.headers.get('x-pagelet-slug') ?? undefined };
  }
  const body = await request.json() as { markdown?: unknown; slug?: unknown };
  if (typeof body.markdown !== 'string') throw new Error('Request body must include a Markdown string in `markdown`.');
  return { markdown: body.markdown, ...(typeof body.slug === 'string' ? { slug: body.slug } : {}) };
}
