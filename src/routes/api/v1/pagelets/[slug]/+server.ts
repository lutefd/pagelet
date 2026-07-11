import { json } from '@sveltejs/kit';
import { parsePageSource } from '$lib/markdown/pages';
import { renderMarkdownDocument } from '$lib/markdown/render';
import { deleteStoredPage, getStoredPage, putStoredPage } from '$lib/server/database';
import { apiError, errorResponse, readMarkdownRequest, requireWriteAuth, slugPattern } from '$lib/server/api';

export function GET({ params }) {
  const page = getStoredPage(params.slug);
  if (!page) return apiError(404, 'not_found', 'Pagelet not found.');
  return json({ slug: params.slug, ...page });
}

export async function PUT(event) {
  const denied = requireWriteAuth(event);
  if (denied) return denied;
  if (!slugPattern.test(event.params.slug)) return apiError(422, 'invalid_slug', 'Slug must be 1-63 lowercase letters, numbers, or hyphens.');
  try {
    const { markdown } = await readMarkdownRequest(event.request);
    const { meta, body } = parsePageSource(markdown);
    await renderMarkdownDocument(body);
    const existed = Boolean(getStoredPage(event.params.slug));
    const timestamps = putStoredPage(event.params.slug, markdown, meta);
    return json({ slug: event.params.slug, url: new URL(`/${event.params.slug}`, event.url).toString(), ...timestamps }, { status: existed ? 200 : 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export function DELETE(event) {
  const denied = requireWriteAuth(event);
  if (denied) return denied;
  if (!deleteStoredPage(event.params.slug)) return apiError(404, 'not_found', 'Pagelet not found.');
  return new Response(null, { status: 204 });
}
