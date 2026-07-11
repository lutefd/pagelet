import { error } from '@sveltejs/kit';
import { loadPage } from '$lib/markdown/pages';

export async function load({ params }) {
  const page = await loadPage(params.slug);

  if (!page) {
    error(404, 'Page not found');
  }

  return {
    page
  };
}
