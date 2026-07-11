import { json } from '@sveltejs/kit';
import GithubSlugger from 'github-slugger';
import { parsePageSource } from '$lib/markdown/pages';
import { renderMarkdownDocument } from '$lib/markdown/render';
import { getIdempotentResponse, getStoredPage, putStoredPage, saveIdempotentResponse } from '$lib/server/database';
import { apiError, errorResponse, readMarkdownRequest, requireWriteAuth, slugPattern } from '$lib/server/api';

export async function POST(event) {
  const denied = requireWriteAuth(event);
  if (denied) return denied;
  const idempotencyKey = event.request.headers.get('idempotency-key');
  if (idempotencyKey) {
    const previous = getIdempotentResponse(idempotencyKey);
    if (previous) return json(previous, { status: 200, headers: { 'idempotent-replayed': 'true' } });
  }
  try {
    const input = await readMarkdownRequest(event.request);
    const { meta, body } = parsePageSource(input.markdown);
    await renderMarkdownDocument(body);
    const slug = input.slug ?? new GithubSlugger().slug(meta.title);
    if (!slugPattern.test(slug)) return apiError(422, 'invalid_slug', 'Slug must be 1-63 lowercase letters, numbers, or hyphens.');
    if (getStoredPage(slug)) return apiError(409, 'slug_exists', `Pagelet '${slug}' already exists. Use PUT to replace it.`);
    const timestamps = putStoredPage(slug, input.markdown, meta);
    const response = { slug, url: new URL(`/${slug}`, event.url).toString(), ...timestamps };
    if (idempotencyKey) saveIdempotentResponse(idempotencyKey, response);
    return json(response, { status: 201, headers: { location: `/${slug}` } });
  } catch (error) {
    return errorResponse(error);
  }
}
