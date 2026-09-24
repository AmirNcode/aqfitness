// Writes dist/_headers. Adds X-Robots-Tag: noindex unless this is the real production site.
import { writeFileSync } from 'node:fs';

const indexable = process.env.ALLOW_INDEXING === 'true' && process.env.CONTEXT === 'production';
const rules = [
  '/*',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
];
if (!indexable) rules.push('  X-Robots-Tag: noindex, nofollow');
rules.push('', '/_astro/*', '  Cache-Control: public, max-age=31536000, immutable');

writeFileSync(new URL('../dist/_headers', import.meta.url), rules.join('\n') + '\n');
console.log(`postbuild: _headers written (indexable=${indexable})`);
