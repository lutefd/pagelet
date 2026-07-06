import { listPages } from '$lib/markdown/pages';

export async function load() {
  return {
    pages: await listPages()
  };
}
