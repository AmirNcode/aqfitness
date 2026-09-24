import { describe, it, expect } from 'vitest';
import { allowIndexing, strictContent } from '../src/lib/env';

describe('allowIndexing', () => {
  it('is false by default (demo)', () => expect(allowIndexing({})).toBe(false));
  it('is false on production context without the flag', () =>
    expect(allowIndexing({ CONTEXT: 'production' })).toBe(false));
  it('is false with the flag on a deploy preview', () =>
    expect(allowIndexing({ ALLOW_INDEXING: 'true', CONTEXT: 'deploy-preview' })).toBe(false));
  it('is true only with flag + production', () =>
    expect(allowIndexing({ ALLOW_INDEXING: 'true', CONTEXT: 'production' })).toBe(true));
});

describe('strictContent', () => {
  it('defaults to false', () => expect(strictContent({})).toBe(false));
  it('is true when STRICT_CONTENT=true', () => expect(strictContent({ STRICT_CONTENT: 'true' })).toBe(true));
});
