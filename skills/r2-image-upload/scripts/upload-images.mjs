#!/usr/bin/env node

import { createHash, createHmac } from 'node:crypto';
import { basename, posix } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

function parseArgs(argv) {
  const options = { envFile: '.env', prefix: '', keepMetadata: false, files: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--env') options.envFile = argv[++index];
    else if (value === '--prefix') options.prefix = argv[++index];
    else if (value === '--key') options.key = argv[++index];
    else if (value === '--public-base') options.publicBase = argv[++index];
    else if (value === '--keep-metadata') options.keepMetadata = true;
    else if (value === '--help' || value === '-h') options.help = true;
    else if (value.startsWith('-')) throw new Error(`Unknown option: ${value}`);
    else options.files.push(value);
  }
  return options;
}

function parseEnv(text) {
  const values = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return values;
}

function stripJpegMetadata(source) {
  if (source[0] !== 0xff || source[1] !== 0xd8) return { body: source, stripped: false };
  const chunks = [source.subarray(0, 2)];
  let offset = 2;

  while (offset < source.length) {
    if (source[offset] !== 0xff) throw new Error(`Invalid JPEG marker at byte ${offset}`);
    const marker = source[offset + 1];
    if (marker === 0xda || marker === 0xd9) {
      chunks.push(source.subarray(offset));
      return { body: Buffer.concat(chunks), stripped: true };
    }
    const length = source.readUInt16BE(offset + 2);
    const end = offset + 2 + length;
    if (end > source.length) throw new Error('Invalid JPEG segment length');
    const metadata = (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe;
    if (!metadata) chunks.push(source.subarray(offset, end));
    offset = end;
  }
  throw new Error('Incomplete JPEG file');
}

function contentType(file, body) {
  if (body[0] === 0xff && body[1] === 0xd8) return 'image/jpeg';
  if (body.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (body.subarray(0, 4).toString() === 'RIFF' && body.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  if (body.subarray(0, 6).toString() === 'GIF87a' || body.subarray(0, 6).toString() === 'GIF89a') return 'image/gif';
  if (file.toLowerCase().endsWith('.svg')) return 'image/svg+xml';
  throw new Error(`Unsupported image type: ${file}`);
}

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const hmac = (key, value) => createHmac('sha256', key).update(value).digest();

async function putObject({ endpoint, accessKeyId, secretAccessKey, file, key, keepMetadata }) {
  const source = readFileSync(file);
  const processed = keepMetadata ? { body: source, stripped: false } : stripJpegMetadata(source);
  const type = contentType(file, processed.body);
  const base = new URL(endpoint.replace(/\/$/, '') + '/');
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  const url = new URL(encodedKey, base);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const payloadHash = sha256(processed.body);
  const canonicalHeaders = `content-type:${type}\nhost:${url.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = ['PUT', url.pathname, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const scope = `${date}/auto/s3/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n');
  const dateKey = hmac(`AWS4${secretAccessKey}`, date);
  const regionKey = hmac(dateKey, 'auto');
  const serviceKey = hmac(regionKey, 's3');
  const signingKey = hmac(serviceKey, 'aws4_request');
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      authorization,
      'content-type': type,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate
    },
    body: processed.body
  });
  if (!response.ok) {
    const detail = (await response.text()).replace(/\s+/g, ' ').slice(0, 500);
    throw new Error(`R2 upload failed for ${key}: HTTP ${response.status} ${detail}`);
  }
  return { bytes: processed.body.length, contentType: type, metadataStripped: processed.stripped };
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  console.log('Usage: upload-images.mjs [--env .env] [--prefix path | --key path] [--public-base url] [--keep-metadata] <image...>');
  process.exit(0);
}
if (options.files.length === 0) throw new Error('Provide at least one image file');
if (options.key && options.files.length !== 1) throw new Error('--key requires exactly one image file');

const fileEnv = existsSync(options.envFile) ? parseEnv(readFileSync(options.envFile, 'utf8')) : {};
const env = { ...fileEnv, ...process.env };
const accessKeyId = env.R2_ACCESS_KEY_ID || env.R2_ACCESS_ID;
const secretAccessKey = env.R2_SECRET_ACCESS_KEY || env.R2_ACCESS_KEY;
if (!env.R2_S3_API) throw new Error('R2_S3_API is missing');
if (!accessKeyId) throw new Error('R2_ACCESS_KEY_ID or R2_ACCESS_ID is missing');
if (!secretAccessKey) throw new Error('R2_SECRET_ACCESS_KEY or R2_ACCESS_KEY is missing');
const publicBase = (options.publicBase || env.R2_PUBLIC_BASE || '').replace(/\/$/, '');
if (!/^https:\/\//.test(publicBase)) throw new Error('R2_PUBLIC_BASE or --public-base must be an absolute HTTPS URL');

for (const file of options.files) {
  const key = (options.key || posix.join(options.prefix, basename(file))).replace(/^\/+/, '');
  if (!key || key.includes('..')) throw new Error(`Unsafe object key: ${key}`);
  const result = await putObject({
    endpoint: env.R2_S3_API,
    accessKeyId,
    secretAccessKey,
    file,
    key,
    keepMetadata: options.keepMetadata
  });
  console.log(JSON.stringify({ file, key, url: `${publicBase}/${key.split('/').map(encodeURIComponent).join('/')}`, ...result }));
}
