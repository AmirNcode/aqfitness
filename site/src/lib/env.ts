// Build-time switches. Both default to the safe "demo" behaviour.
export type Env = Record<string, string | undefined>;

const read = (env?: Env): Env => env ?? (process.env as Env);

/** Search engines may index the site only on the real production deploy with the flag set. */
export function allowIndexing(env?: Env): boolean {
  const e = read(env);
  return e.ALLOW_INDEXING === 'true' && e.CONTEXT === 'production';
}

/** At launch, fail the build on leftover placeholders or unverified claims. */
export function strictContent(env?: Env): boolean {
  return read(env).STRICT_CONTENT === 'true';
}
