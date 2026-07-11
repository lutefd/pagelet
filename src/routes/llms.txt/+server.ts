export function GET({ url }) {
  const origin = url.origin;
  return new Response(`# Pagelet\n\nPagelet publishes Markdown as a shareable web page.\n\n## Agent workflow\n\n1. Read ${origin}/openapi.json.\n2. Create a pagelet with POST ${origin}/api/v1/pagelets.\n3. Authenticate writes with Authorization: Bearer $PAGELET_API_KEY.\n4. Send application/json with {"markdown":"---\\ntitle: My page\\n---\\n\\n# Hello","slug":"optional-slug"}.\n5. Add a unique Idempotency-Key header when retrying POST requests.\n6. Use PUT /api/v1/pagelets/{slug} to create or replace a known slug.\n\nMarkdown must include frontmatter with a non-empty title. Optional fields are description and theme (currently only default). The response's url is the public page to share.\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
}
