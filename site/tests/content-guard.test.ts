import { describe, it, expect } from 'vitest';
import { contentProblems, assertContentReady } from '../src/lib/content-guard';

const items = [
  { id: 'ok', verified: true },
  { id: 'stat-unverified', verified: false },
  { id: 'case-study', placeholder: true },
  { id: 'plain' },
];

describe('content guard', () => {
  it('lists unverified and placeholder ids only', () =>
    expect(contentProblems(items)).toEqual(['stat-unverified', 'case-study']));
  it('does not throw outside strict mode', () => expect(() => assertContentReady(items, false)).not.toThrow());
  it('throws in strict mode naming each problem', () =>
    expect(() => assertContentReady(items, true)).toThrow(/stat-unverified.*case-study/));
  it('passes in strict mode when clean', () =>
    expect(() => assertContentReady([{ id: 'ok', verified: true }], true)).not.toThrow());
});
