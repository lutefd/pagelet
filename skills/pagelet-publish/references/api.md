# Pagelet API reference

Default origin: `https://pages.luisdourado.com`

Discovery:

- `GET /.well-known/pagelet.json`
- `GET /openapi.json`
- `GET /llms.txt`
- `GET /api/health`

Writes require `Authorization: Bearer <PAGELET_API_KEY>`. Never log or serialize the key.

## Publish

`POST /api/v1/pagelets`

JSON body:

```json
{
  "markdown": "---\ntitle: Example\n---\n\n# Example",
  "slug": "optional-slug"
}
```

Set a stable `Idempotency-Key` for retries. A successful initial request returns `201`; a replay returns `200` with `Idempotent-Replayed: true`. The response contains `slug`, public `url`, `createdAt`, and `updatedAt`.

Raw `text/markdown` is also accepted. Supply an optional slug through `X-Pagelet-Slug`.

## Known slug

- `GET /api/v1/pagelets/{slug}` reads metadata and Markdown source without authentication.
- `PUT /api/v1/pagelets/{slug}` creates or completely replaces a pagelet and requires authentication.
- `DELETE /api/v1/pagelets/{slug}` deletes a pagelet and requires authentication.

Slugs contain 1–63 lowercase ASCII letters, digits, or hyphens, begin with a letter or digit, and match `^[a-z0-9][a-z0-9-]{0,62}$`.

Errors use `{ "error": { "code": "...", "message": "...", "details": ... } }`.
