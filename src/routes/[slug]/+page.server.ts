import { error } from '@sveltejs/kit';
import { listPageSlugs, loadPage } from '$lib/markdown/pages';

export const prerender = true;

export async function entries() {
  return (await listPageSlugs()).map((slug) => ({ slug }));
}

export async function load({ params }) {
  const page = await loadPage(params.slug);

  if (!page) {
    error(404, 'Page not found');
  }

  return {
    page
  };
}
