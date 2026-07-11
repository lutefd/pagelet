import { json } from '@sveltejs/kit';

export function GET({ url }) {
  const pageletSchema = {
    type: 'object', required: ['markdown'], additionalProperties: false,
    properties: {
      markdown: { type: 'string', description: 'Complete Markdown document with YAML frontmatter containing title.' },
      slug: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{0,62}$', description: 'Optional on POST; derived from title when omitted.' }
    }
  };
  const responseSchema = {
    type: 'object', required: ['slug', 'url', 'createdAt', 'updatedAt'],
    properties: { slug: { type: 'string' }, url: { type: 'string', format: 'uri' }, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' } }
  };
  return json({
    openapi: '3.1.0',
    info: { title: 'Pagelet Publishing API', version: '1.0.0', description: 'Agent-first API for publishing Markdown as shareable pages.' },
    servers: [{ url: url.origin }],
    paths: {
      '/api/v1/pagelets': { post: { operationId: 'publishPagelet', summary: 'Publish a new pagelet', security: [{ bearerAuth: [] }], parameters: [{ name: 'Idempotency-Key', in: 'header', schema: { type: 'string' }, description: 'Unique retry key; strongly recommended.' }], requestBody: { required: true, content: { 'application/json': { schema: pageletSchema }, 'text/markdown': { schema: { type: 'string' } } } }, responses: { '201': { description: 'Published', content: { 'application/json': { schema: responseSchema } } }, '409': { description: 'Slug already exists' }, '422': { description: 'Invalid Markdown, frontmatter, component, or slug' } } } },
      '/api/v1/pagelets/{slug}': {
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        get: { operationId: 'getPageletSource', summary: 'Read a published pagelet and its Markdown source', responses: { '200': { description: 'Pagelet source' }, '404': { description: 'Not found' } } },
        put: { operationId: 'putPagelet', summary: 'Create or replace a pagelet at a known slug', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: pageletSchema }, 'text/markdown': { schema: { type: 'string' } } } }, responses: { '200': { description: 'Replaced', content: { 'application/json': { schema: responseSchema } } }, '201': { description: 'Created' }, '422': { description: 'Invalid input' } } },
        delete: { operationId: 'deletePagelet', summary: 'Delete a pagelet', security: [{ bearerAuth: [] }], responses: { '204': { description: 'Deleted' }, '404': { description: 'Not found' } } }
      }
    },
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', description: 'Publishing key configured as PAGELET_API_KEY.' } } }
  });
}
