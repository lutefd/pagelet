---
name: r2-image-upload
description: Upload local image files to a user-controlled Cloudflare R2 bucket and return public CDN URLs. Use when Codex must make attached or workspace images available over HTTPS for Pagelet galleries, Markdown, websites, or other agent-authored content, especially when credentials must remain out of model context and image metadata should be removed before publication.
---

# Upload images to R2

Use the bundled Node.js client to sign uploads locally with AWS Signature V4. The client reads secrets internally and never prints them.

## Configure access

Require these values in the process environment or an ignored `.env` file:

- `R2_S3_API`: S3 endpoint, optionally including the bucket path.
- `R2_ACCESS_KEY_ID`: bucket-scoped access key ID; `R2_ACCESS_ID` is accepted as an alias.
- `R2_SECRET_ACCESS_KEY`: matching secret access key; `R2_ACCESS_KEY` is accepted as an alias.
- `R2_PUBLIC_BASE`: public HTTPS origin, such as `https://images.example.com`.

Never ask the user to paste credentials into chat or print their values. Inspect variable names only when diagnosing configuration.

## Upload

Run with Node.js 18 or later:

```sh
node <skill-directory>/scripts/upload-images.mjs \
  --prefix pagelet/example \
  /path/to/first.jpg /path/to/second.png
```

Options:

- `--env <file>`: dotenv file; defaults to `.env`.
- `--prefix <path>`: object-key prefix for all inputs.
- `--key <path>`: exact object key; valid only with one input.
- `--public-base <url>`: override `R2_PUBLIC_BASE` without changing secrets.
- `--keep-metadata`: retain JPEG metadata. Omit this for public images.

The client strips JPEG APP metadata and comments by default, including EXIF GPS data. It never changes the source file. Other supported image types are uploaded byte-for-byte.

Use descriptive lowercase filenames and a scoped prefix. Existing keys are replaced, so avoid collisions unless replacement is intended.

## Verify and use

Treat the JSON-lines output as the authoritative mapping from local files to public URLs. Verify each returned URL with a read-only HTTP request before embedding it. Do not claim success when an upload or verification fails.

For a Pagelet gallery, place the returned absolute HTTPS URLs in `::gallery` blocks. Keep nearby prose identifying the images because galleries render with empty alt attributes.

## Handle failures

- Missing variable: ask the user to add it to their secret settings or ignored `.env`; do not request the value in chat.
- `Authorization` or `SignatureDoesNotMatch`: confirm the endpoint, bucket path, credential names, and bucket-scoped Object Read & Write permission.
- Successful upload but CDN `404`: confirm `R2_PUBLIC_BASE`, the custom-domain bucket binding, and the object key.
- Network failure: retry the identical upload; uploading to the same key is idempotent replacement.
