import { json } from '@sveltejs/kit';

export function GET({ url }) {
  return json({
    name: 'Pagelet',
    description: 'Publish Markdown as shareable web pages.',
    api_version: 'v1',
    authentication: { type: 'bearer', env_hint: 'PAGELET_API_KEY' },
    openapi_url: new URL('/openapi.json', url).toString(),
    publish_url: new URL('/api/v1/pagelets', url).toString(),
    accepted_content_types: ['application/json', 'text/markdown'],
    instructions_url: new URL('/llms.txt', url).toString()
  });
}
