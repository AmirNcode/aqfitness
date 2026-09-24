// Crawls dist/ for internal links and assets that don't resolve, plus _redirects targets.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const htmlFiles = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) htmlFiles.push(p);
  }
};
walk(dist);

const resolves = (url) => {
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  const candidates = path.endsWith('/') ? [join(dist, path, 'index.html')] : [join(dist, path), join(dist, path, 'index.html'), join(dist, `${path}.html`)];
  return candidates.some((c) => existsSync(c) && statSync(c).isFile());
};

const broken = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const urls = [
    ...[...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])),
  ];
  for (const url of urls) {
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    if (!resolves(url)) broken.push(`${relative(dist, file)} -> ${url}`);
  }
}

const redirects = readFileSync(join(dist, '_redirects'), 'utf8')
  .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
for (const line of redirects) {
  const target = line.split(/\s+/)[1];
  const concrete = target.replace(/:slug\/$/, '');
  if (!resolves(concrete)) broken.push(`_redirects -> ${target}`);
}

console.log(`checked ${htmlFiles.length} pages and ${redirects.length} redirects`);
if (broken.length) {
  console.error(`broken links (${broken.length}):\n  ${[...new Set(broken)].join('\n  ')}`);
  process.exit(1);
}
console.log('no broken internal links');
