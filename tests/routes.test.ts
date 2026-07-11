import { describe, expect, it } from 'vitest';
import { match } from '../src/params/pagelet';

describe('Pagelet route matching', () => {
  it('accepts public page slugs', () => {
    expect(match('release-notes')).toBe(true);
    expect(match('pagelet-2')).toBe(true);
  });

  it('never captures discovery endpoints as pagelets', () => {
    expect(match('llms.txt')).toBe(false);
    expect(match('openapi.json')).toBe(false);
    expect(match('.well-known')).toBe(false);
  });
});
