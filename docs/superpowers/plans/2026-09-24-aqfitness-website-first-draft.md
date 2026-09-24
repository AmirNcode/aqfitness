# Aquam Fitness Website: First Draft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a first-draft demo of the new aqfitness.ca: an Astro 7 static site on Netlify with real Netlify Forms, and placeholders for Resend, Calendly and DNS.

**Architecture:** An Astro 7 static site in `site/` (repo root `netlify.toml` points `base` at it).
- Content (posts, testimonials, FAQs, stats) lives in Markdown/YAML collections, validated with zod.
- Logic lives in `site/src/lib/` as small pure modules with Vitest tests: indexing rules, the content guard, JSON-LD builders, and email building/delivery.
- UI is `.astro` components with plain CSS tokens and no framework runtime.
- One Netlify event function (`submission-created`) turns verified form submissions into Resend emails. When there's no API key, it logs them instead.

**Tech Stack:** Astro 7.3, `@astrojs/sitemap`, Astro `fonts` (Barlow / Barlow Condensed via Fontsource), TypeScript, Vitest, Playwright + `@axe-core/playwright` (a11y check), Netlify (Forms, Functions), and Resend via its REST API (no SDK).

**Spec:** `docs/superpowers/specs/2026-09-24-aqfitness-website-design.md`. Section numbers (§) below refer to it.

**Plan convention:** full code is given for logic, config and tests. For presentational components and pages, each task lists the exact files, the sections and copy sources (spec §5 and §6), and acceptance checks. The markup and CSS get written at execution time against those, since repeating hundreds of lines of CSS here would only add drift.

## Global Constraints
- Astro `^7.3`, Node 24 (`.nvmrc`), static output only, no UI-framework integrations.
- Our own client-side JS must total under 10 KB. Every interactive feature must also work with JS disabled (forms post natively).
- Colors come only from the tokens in spec §6.2. Orange text on light backgrounds uses `--accent-ink`. Primary buttons are `--accent` background with `--ink` text.
- No prices anywhere. Booking CTAs link to `/book/`, or to the Calendly URLs once they're set.
- Placeholders render a visible `[PH]` badge. `STRICT_CONTENT=true` fails the build if any placeholder or unverified stat remains.
- Indexing is allowed only when `ALLOW_INDEXING=true` and `CONTEXT=production`.
- Repo is public: never commit `material/`, `planning/`, `old-site/`, `.env*`, or client images the site doesn't ship.
- Copy migrated from the old site gets its typos fixed but keeps Alejandro's voice.

---

## File structure

```
.gitignore
netlify.toml                         # base=site, publish=dist, functions dir
site/
  package.json  astro.config.mjs  tsconfig.json  vitest.config.ts  .nvmrc
  netlify/functions/submission-created.mts
  scripts/postbuild.mjs              # writes dist/_headers
  scripts/check-links.mjs            # crawls dist for broken internal links + redirect targets
  scripts/a11y.mjs                   # axe via Playwright against `astro preview`
  public/_redirects  public/favicon.png  public/og/{default,performance,coaching}.png
  src/
    config/site.ts                   # business info, nav, calendly, socials
    content.config.ts                # collections + zod schemas
    content/blog/*.md  content/testimonials.yaml  content/faq-teams.yaml
    content/faq-coaching.yaml  content/stats.yaml  content/research.yaml
    lib/env.ts  lib/robots.ts  lib/content-guard.ts  lib/schema.ts  lib/email.ts
    styles/tokens.css  styles/global.css
    layouts/BaseLayout.astro         # <html>, SEO, header/footer, mood class
    components/  (one file per component in spec §6.4)
    pages/  index, teams, coaching, results, about, book, contact(+thanks),
            free-guide(+thanks), privacy, terms, disclaimer, 404,
            blog/index, blog/[slug], robots.txt.ts, llms.txt.ts
    assets/  logo/, photos/, results/, app/   # images processed by astro:assets
  tests/  env.test.ts robots.test.ts content-guard.test.ts schema.test.ts email.test.ts
```

---

### Task 1: Repo, gitignore, scaffold, Netlify config

**Files:** Create `.gitignore`, `netlify.toml`, `site/package.json`, `site/astro.config.mjs`, `site/tsconfig.json`, `site/vitest.config.ts`, `site/.nvmrc`, `site/src/pages/index.astro` (temporary).

**Interfaces:** Produces the `npm run build | dev | preview | test | check` scripts that every later task uses.

- [ ] **Step 1: gitignore**, covering the client material and build output:
```gitignore
# client material: private, never commit (repo is public)
/material/
/planning/
/old-site/
# build / deps
node_modules/
site/dist/
site/.astro/
.netlify/
.env
.env.*
.DS_Store
```
- [ ] **Step 2: `git init -b main`**, add the remote `https://github.com/AmirNcode/aqfitness.git`, then check with `git status --porcelain` that no `material/`, `planning/` or `old-site/` path shows up.
- [ ] **Step 3: Scaffold** with `npm create astro@latest site -- --template minimal --no-install --no-git --skip-houston --yes` (or write the minimal files by hand if the CLI prompts). Install: `astro@^7.3 @astrojs/sitemap yaml` plus dev deps `vitest @axe-core/playwright playwright`.
- [ ] **Step 4: `site/package.json` scripts:**
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && node scripts/postbuild.mjs",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "links": "node scripts/check-links.mjs",
    "a11y": "node scripts/a11y.mjs"
  }
}
```
- [ ] **Step 5: `netlify.toml`** (repo root):
```toml
[build]
  base = "site"
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "24"
```
- [ ] **Step 6: `astro.config.mjs`** with `site: process.env.SITE_URL ?? 'https://aqfitness.ca'`, `trailingSlash: 'always'`, `integrations: [sitemap()]`, and `fonts` set up for Barlow (400/500/600) and Barlow Condensed (700/800) through `fontProviders.fontsource()`, Latin subset, CSS variables `--font-body` and `--font-display`.
- [ ] **Step 7: Verify.** `cd site && npm run build` should exit 0 and produce `dist/index.html`.
- [ ] **Step 8: Commit.** `git add .gitignore netlify.toml site docs && git commit -m "chore: scaffold Astro 7 site, Netlify config, docs"`

### Task 2: Environment rules and robots (TDD)

**Files:** Create `site/src/lib/env.ts`, `site/src/lib/robots.ts`, `site/src/pages/robots.txt.ts`, `site/scripts/postbuild.mjs`, `site/tests/env.test.ts`, `site/tests/robots.test.ts`.

**Interfaces (produces):**
```ts
// lib/env.ts
export type Env = Record<string, string | undefined>;
export function allowIndexing(env?: Env): boolean;  // ALLOW_INDEXING==='true' && CONTEXT==='production'
export function strictContent(env?: Env): boolean;  // STRICT_CONTENT==='true'
// lib/robots.ts
export const AI_CRAWLERS: readonly string[];         // GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended
export function robotsTxt(opts: { indexable: boolean; sitemapUrl: string }): string;
```
- [ ] **Step 1: Failing tests:**
```ts
// tests/env.test.ts
import { describe, it, expect } from 'vitest';
import { allowIndexing, strictContent } from '../src/lib/env';
describe('allowIndexing', () => {
  it('is false by default (demo)', () => expect(allowIndexing({})).toBe(false));
  it('is false on production context without the flag', () => expect(allowIndexing({ CONTEXT: 'production' })).toBe(false));
  it('is false with the flag on a deploy preview', () => expect(allowIndexing({ ALLOW_INDEXING: 'true', CONTEXT: 'deploy-preview' })).toBe(false));
  it('is true only with flag + production', () => expect(allowIndexing({ ALLOW_INDEXING: 'true', CONTEXT: 'production' })).toBe(true));
});
describe('strictContent', () => {
  it('defaults to false', () => expect(strictContent({})).toBe(false));
  it('is true when STRICT_CONTENT=true', () => expect(strictContent({ STRICT_CONTENT: 'true' })).toBe(true));
});
```
```ts
// tests/robots.test.ts
import { describe, it, expect } from 'vitest';
import { robotsTxt, AI_CRAWLERS } from '../src/lib/robots';
const sitemapUrl = 'https://aqfitness.ca/sitemap-index.xml';
describe('robotsTxt', () => {
  it('blocks everything when not indexable', () => {
    const txt = robotsTxt({ indexable: false, sitemapUrl });
    expect(txt).toContain('User-agent: *\nDisallow: /');
    expect(txt).not.toContain('Sitemap:');
  });
  it('allows all crawlers incl. AI bots and lists the sitemap when indexable', () => {
    const txt = robotsTxt({ indexable: true, sitemapUrl });
    expect(txt).toContain('User-agent: *\nAllow: /');
    for (const bot of AI_CRAWLERS) expect(txt).toContain(`User-agent: ${bot}\nAllow: /`);
    expect(txt).toContain(`Sitemap: ${sitemapUrl}`);
  });
});
```
- [ ] **Step 2:** Run `npx vitest run tests/env.test.ts tests/robots.test.ts`. Expected: FAIL (modules missing).
- [ ] **Step 3: Implement:**
```ts
// lib/env.ts
export type Env = Record<string, string | undefined>;
const read = (env?: Env): Env => env ?? (process.env as Env);
export function allowIndexing(env?: Env): boolean {
  const e = read(env);
  return e.ALLOW_INDEXING === 'true' && e.CONTEXT === 'production';
}
export function strictContent(env?: Env): boolean {
  return read(env).STRICT_CONTENT === 'true';
}
```
```ts
// lib/robots.ts
export const AI_CRAWLERS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'] as const;
export function robotsTxt({ indexable, sitemapUrl }: { indexable: boolean; sitemapUrl: string }): string {
  if (!indexable) return 'User-agent: *\nDisallow: /\n';
  const blocks = ['User-agent: *\nAllow: /', ...AI_CRAWLERS.map((b) => `User-agent: ${b}\nAllow: /`)];
  return `${blocks.join('\n\n')}\n\nSitemap: ${sitemapUrl}\n`;
}
```
```ts
// pages/robots.txt.ts
import type { APIRoute } from 'astro';
import { allowIndexing } from '../lib/env';
import { robotsTxt } from '../lib/robots';
export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt({ indexable: allowIndexing(), sitemapUrl: new URL('sitemap-index.xml', site).href }));
```
```js
// scripts/postbuild.mjs — X-Robots-Tag header unless indexable
import { writeFileSync } from 'node:fs';
const indexable = process.env.ALLOW_INDEXING === 'true' && process.env.CONTEXT === 'production';
const rules = ['/*', '  X-Content-Type-Options: nosniff', '  Referrer-Policy: strict-origin-when-cross-origin'];
if (!indexable) rules.push('  X-Robots-Tag: noindex, nofollow');
rules.push('', '/_astro/*', '  Cache-Control: public, max-age=31536000, immutable');
writeFileSync(new URL('../dist/_headers', import.meta.url), rules.join('\n') + '\n');
console.log(`postbuild: _headers written (indexable=${indexable})`);
```
- [ ] **Step 4:** Tests pass. `npm run build`, then `cat dist/robots.txt` shows `Disallow: /`, and `dist/_headers` contains `X-Robots-Tag`.
- [ ] **Step 5: Commit** `feat: indexing rules, robots.txt, security headers`.

### Task 3: Site config, content collections, content guard (TDD), content migration

**Files:** Create `site/src/config/site.ts`, `site/src/content.config.ts`, `site/src/lib/content-guard.ts`, `site/tests/content-guard.test.ts`, all of `site/src/content/*`, and `site/src/assets/results/testimonial-01..29.png` (copied from `old-site/images/testimonials/`).

**Interfaces (produces):**
```ts
// config/site.ts
export const site: {
  name: 'Aquam Fitness'; programName: 'Aquam Performance'; methodName: 'the Habit Shift';
  tagline: 'Eat. Train. Live.'; founder: 'Alejandro Rivas';
  email: string | null;                  // null = placeholder
  serviceArea: { inPerson: string; virtual: string };
  social: { instagram: string; linkedin: string | null; googleBusiness: string | null };
  calendly: { consult: string | null; discovery: string | null };
  nav: { label: string; href: string }[];
  credentials: string[]; stats: { clients: string; classes: string };
};
export function bookingHref(kind: 'consult' | 'discovery'): string; // calendly URL or '/book/#<kind>'
// lib/content-guard.ts
export interface Checkable { id: string; verified?: boolean; placeholder?: boolean }
export function contentProblems(items: Checkable[]): string[];            // ids that are unverified or placeholders
export function assertContentReady(items: Checkable[], strict: boolean): void; // throws in strict mode if problems exist
```
- [ ] **Step 1: Failing test** `tests/content-guard.test.ts`:
```ts
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
```
- [ ] **Step 2:** The test fails. **Step 3: Implement:**
```ts
export interface Checkable { id: string; verified?: boolean; placeholder?: boolean }
export function contentProblems(items: Checkable[]): string[] {
  return items.filter((i) => i.verified === false || i.placeholder === true).map((i) => i.id);
}
export function assertContentReady(items: Checkable[], strict: boolean): void {
  const problems = contentProblems(items);
  if (strict && problems.length) {
    throw new Error(`STRICT_CONTENT: unresolved placeholders/unverified content: ${problems.join(', ')}`);
  }
}
```
- [ ] **Step 4: `content.config.ts`**:
  - `blog` uses the `glob` loader. Schema: `title, description, pubDate: z.coerce.date(), updatedDate?, author (default 'Alejandro Rivas'), draft (default false)`.
  - `testimonials`, `faqTeams`, `faqCoaching`, `stats` and `research` use the `file` loader on the YAML files, with schemas carrying the fields in spec §7 plus `id`, `placeholder?` and `verified?`.
- [ ] **Step 5: Migrate content:**
  - **Blog:** 6 posts from `old-site/content/blog/*.md`. Keep the slugs and dates, fix typos, add a `description` (≤155 chars) taken from the excerpt.
  - **`testimonials.yaml`:** from `old-site/data/testimonials.json`. 29 items, each with `firstName: null` and `placeholder: true` on items that have quotes. Videos become `videoUrl`.
  - **`faq-coaching.yaml`:** the old site's 16 FAQs, cleaned up and trimmed to the ones about 1:1 coaching.
  - **`faq-teams.yaml`:** 7 HR questions (spec §5.2 item 13), with `confirm: true` where the deck doesn't answer.
  - **`stats.yaml`** and **`research.yaml`:** the deck figures, all `verified: false` until Task 10.
- [ ] **Step 6:** `npm run build` passes (the collections load). Commit `feat: site config, content collections, migrated content, content guard`.

### Task 4: JSON-LD builders (TDD)

**Files:** Create `site/src/lib/schema.ts` and `site/tests/schema.test.ts`.

**Interfaces (produces):**
```ts
export function organizationLd(siteUrl: string): object;   // @type Organization, name, url, logo, sameAs (non-null socials only)
export function websiteLd(siteUrl: string): object;
export function serviceLd(o: { name: string; description: string; url: string; areaServed: string[] }): object;
export function personLd(siteUrl: string): object;         // Alejandro, hasCredential from site.credentials
export function faqLd(items: { question: string; answer: string }[]): object; // FAQPage
export function breadcrumbLd(items: { name: string; url: string }[]): object;
export function blogPostingLd(p: { title: string; description: string; url: string; datePublished: Date; dateModified?: Date }): object;
```
- [ ] **Step 1: Failing tests:**
```ts
import { describe, it, expect } from 'vitest';
import { organizationLd, faqLd, breadcrumbLd, serviceLd } from '../src/lib/schema';
describe('schema builders', () => {
  it('organization omits placeholder socials from sameAs', () => {
    const o: any = organizationLd('https://aqfitness.ca/');
    expect(o['@type']).toBe('Organization');
    expect(o.sameAs.every((u: string) => u.startsWith('https://'))).toBe(true);
    expect(o.sameAs).not.toContain(null);
  });
  it('faqLd maps questions to Question/Answer', () => {
    const f: any = faqLd([{ question: 'Q?', answer: 'A.' }]);
    expect(f['@type']).toBe('FAQPage');
    expect(f.mainEntity[0]).toEqual({ '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A.' } });
  });
  it('breadcrumb positions start at 1', () => {
    const b: any = breadcrumbLd([{ name: 'Home', url: 'https://a/' }, { name: 'Teams', url: 'https://a/teams/' }]);
    expect(b.itemListElement.map((i: any) => i.position)).toEqual([1, 2]);
  });
  it('service carries provider and areaServed', () => {
    const s: any = serviceLd({ name: 'Aquam Performance', description: 'd', url: 'https://a/teams/', areaServed: ['Greater Toronto Area'] });
    expect(s.provider['@type']).toBe('Organization');
    expect(s.areaServed).toEqual(['Greater Toronto Area']);
  });
});
```
- [ ] **Step 2:** Tests fail. **Step 3:** Implement using `site` from `config/site.ts`, returning plain objects with `@context: 'https://schema.org'`. **Step 4:** Tests pass. **Step 5:** Commit `feat: JSON-LD builders`.

### Task 5: Email building and delivery (TDD) + Netlify function

**Files:** Create `site/src/lib/email.ts`, `site/tests/email.test.ts` and `site/netlify/functions/submission-created.mts`. Before writing the function, call the Netlify `get-netlify-coding-context` tool (serverless and forms).

**Interfaces (produces):**
```ts
export type FormName = 'contact' | 'free-guide' | 'newsletter';
export interface EmailConfig { apiKey?: string; from?: string; owner?: string; segmentId?: string; guideUrl?: string; siteUrl: string }
export interface OutgoingEmail { to: string; subject: string; html: string; replyTo?: string }
export interface ContactInput { email: string; firstName?: string; segmentId?: string }
export function emailConfigFromEnv(env: Record<string, string | undefined>): EmailConfig;
export function buildEmails(form: string, data: Record<string, string>, cfg: EmailConfig): OutgoingEmail[];
export function contactFor(form: string, data: Record<string, string>, cfg: EmailConfig): ContactInput | null;
export async function deliver(emails: OutgoingEmail[], contact: ContactInput | null, cfg: EmailConfig,
  fetchImpl?: typeof fetch, log?: (msg: string) => void): Promise<{ mode: 'log' | 'sent'; count: number }>;
```
Rules:
- **`contact`:** a confirmation to the sender, plus a notification to `owner` (skipped when `owner` is unset) with every field, `replyTo` set to the sender. The company-inquiry wording applies when `interest === 'teams'`.
- **`free-guide`:** a welcome email with a guide link (or "coming soon" text when `guideUrl` is unset), plus a contact.
- **`newsletter`:** a welcome email, plus a contact.
- **Unknown form or missing/invalid email:** no emails.
- **Delivery:** with no `apiKey`, log each email and contact and return `{mode:'log'}`. With a key, `POST https://api.resend.com/emails` per email, and `POST https://api.resend.com/contacts` with `{email, first_name, unsubscribed:false, segments:[{id}]}` (segments only when `segmentId` is set).
- **Escaping:** HTML-escape every user-provided value.

- [ ] **Step 1: Failing tests:**
```ts
import { describe, it, expect, vi } from 'vitest';
import { buildEmails, contactFor, deliver, type EmailConfig } from '../src/lib/email';
const cfg: EmailConfig = { siteUrl: 'https://aqfitness.ca/', owner: 'owner@example.com', from: 'Aquam <hi@example.com>' };
describe('buildEmails', () => {
  it('contact: confirmation + owner notification with reply-to', () => {
    const e = buildEmails('contact', { name: 'Sam', email: 'sam@example.com', message: 'Hi' }, cfg);
    expect(e.map((m) => m.to)).toEqual(['sam@example.com', 'owner@example.com']);
    expect(e[1].replyTo).toBe('sam@example.com');
  });
  it('skips owner notification when owner unset', () => {
    expect(buildEmails('contact', { email: 'sam@example.com' }, { siteUrl: cfg.siteUrl })).toHaveLength(1);
  });
  it('escapes HTML in user input', () => {
    const [, owner] = buildEmails('contact', { email: 'a@b.co', message: '<script>x</script>' }, cfg);
    expect(owner.html).not.toContain('<script>');
    expect(owner.html).toContain('&lt;script&gt;');
  });
  it('teams interest uses company wording', () => {
    const [conf] = buildEmails('contact', { email: 'a@b.co', interest: 'teams', company: 'Acme' }, cfg);
    expect(conf.subject).toMatch(/Aquam Performance/);
  });
  it('rejects unknown forms and invalid emails', () => {
    expect(buildEmails('spam', { email: 'a@b.co' }, cfg)).toEqual([]);
    expect(buildEmails('contact', { email: 'not-an-email' }, cfg)).toEqual([]);
  });
  it('free-guide says coming soon without guideUrl', () => {
    const [m] = buildEmails('free-guide', { email: 'a@b.co', firstName: 'Ana' }, cfg);
    expect(m.html).toMatch(/coming soon/i);
  });
});
describe('contactFor', () => {
  it('only newsletter and free-guide create contacts', () => {
    expect(contactFor('contact', { email: 'a@b.co' }, cfg)).toBeNull();
    expect(contactFor('newsletter', { email: 'a@b.co' }, { ...cfg, segmentId: 'seg_1' })).toEqual({ email: 'a@b.co', firstName: undefined, segmentId: 'seg_1' });
  });
});
describe('deliver', () => {
  it('logs instead of sending without an API key', async () => {
    const fetchImpl = vi.fn(); const log = vi.fn();
    const r = await deliver([{ to: 'a@b.co', subject: 's', html: 'h' }], null, cfg, fetchImpl as any, log);
    expect(r).toEqual({ mode: 'log', count: 1 });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalled();
  });
  it('posts to Resend emails + contacts with a key', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    const r = await deliver([{ to: 'a@b.co', subject: 's', html: 'h' }], { email: 'a@b.co', segmentId: 'seg_1' },
      { ...cfg, apiKey: 're_test' }, fetchImpl as any, () => {});
    expect(r).toEqual({ mode: 'sent', count: 1 });
    expect(fetchImpl.mock.calls.map((c: any) => c[0])).toEqual(['https://api.resend.com/emails', 'https://api.resend.com/contacts']);
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body).segments).toEqual([{ id: 'seg_1' }]);
  });
});
```
- [ ] **Step 2:** Tests fail. **Step 3:** Implement `email.ts` per the rules above. The function file:
```ts
// netlify/functions/submission-created.mts
import { buildEmails, contactFor, deliver, emailConfigFromEnv } from '../../src/lib/email';
export default async (req: Request) => {
  const { payload } = await req.json();
  const form = String(payload?.form_name ?? '');
  const data: Record<string, string> = Object.fromEntries(
    Object.entries(payload?.data ?? {}).map(([k, v]) => [k, String(v ?? '')]));
  const cfg = emailConfigFromEnv(process.env);
  const result = await deliver(buildEmails(form, data, cfg), contactFor(form, data, cfg), cfg);
  console.log(`submission-created: form=${form} mode=${result.mode} emails=${result.count}`);
  return new Response(null, { status: 200 });
};
```
- [ ] **Step 4:** Tests pass. **Step 5:** Commit `feat: form emails via Resend with log-only placeholder mode`.

### Task 6: Design tokens, layout, header/footer, core components

**Files:** Create:
- `styles/tokens.css`, `styles/global.css`
- `layouts/BaseLayout.astro`, `components/SEO.astro`
- `components/Header.astro` (with the mobile menu), `components/Footer.astro`, `components/NewsletterForm.astro`
- `components/Placeholder.astro`, `components/Button.astro`, `components/CTASection.astro`, `components/Marquee.astro`
- `pages/404.astro`
- the logo files under `assets/logo/`

**Interfaces:**
- `BaseLayout` props: `{ title: string; description: string; mood?: 'performance'|'coaching'|'neutral'; ogImage?: 'default'|'performance'|'coaching'; jsonLd?: object[]; breadcrumbs?: {name,url}[] }`. It sets `<body data-mood>`, which swaps the surface tokens: `--surface` is `--paper` for performance and `--sand` for coaching, and `--radius` is 0 for performance and 16px for coaching.
- `Placeholder` props `{ label: string }`. It renders an inline `[PH] label` badge and throws when `strictContent()` is true.
- `Button` props `{ href: string; variant?: 'primary'|'ghost'|'dark'; size?: 'md'|'lg' }`.

Requirements:
- **Tokens** are exactly spec §6.2. **Type scale** is spec §6.3 using `clamp()`.
- **Global CSS:** skip link, focus ring (`outline: 2px solid var(--accent); outline-offset: 2px`), reduced-motion guard.
- **SEO component:** outputs title, description, canonical, OG/Twitter, `<meta name="robots" content="noindex,nofollow">` unless `allowIndexing()`, and JSON-LD `<script type="application/ld+json">` for `organizationLd`, `websiteLd`, breadcrumbs, and any `jsonLd` passed in.
- **Header:** nav from `site.nav` plus a "Book a call" primary button. The mobile menu is a `<button aria-expanded>` toggling a `<nav>` (under 1 KB of JS), and without JS it falls back to a visible list.
- **Footer:** newsletter form (Netlify form `newsletter`: `email` + honeypot `bot-field`), free-guide link, contact info from `site`, social links (placeholders hidden), legal links, ©.
- **Logos:** the white and black AQ PNGs from the deck (`planning/pitch-deck/media/image2.png` trimmed, `image11.png`), processed with PIL, stored at `assets/logo/aq-white.png` and `aq-black.png`.
- [ ] Build passes. Open `dist/404.html` and check the header, footer, noindex meta and JSON-LD. Commit `feat: design tokens, base layout, header/footer`.

### Task 7: Section components

**Files:** Create in `components/`:
- `Hero.astro` (variants performance / coaching / simple)
- `StatRow.astro`, `PillarCards.astro`, `Timeline12Week.astro` (compact | full)
- `TwoColumnBenefits.astro`, `ReportMock.astro`, `ResearchTable.astro`, `CaseStudyCard.astro`
- `OptionCards.astro`, `Steps.astro`, `TransformationGallery.astro`, `TestimonialCard.astro`
- `FAQ.astro` (`<details>` + returns items for `faqLd`)
- `BookingCard.astro`

Requirements (spec §5–6):
- **StatRow** takes items from the `stats` collection. Each stat shows value, label and source link. An unverified stat gets a `Placeholder` badge "unverified".
- **Timeline12Week** is an `<ol>` with 12 week items grouped into the Foundation (1–4) and Habit Shift (5–12) phases, with markers for Kickoff (before week 1) and Team check-in (weeks 4, 8, 12).
- **ReportMock** is an HTML/CSS/SVG sample "Week 8 report" with team-level metrics (attendance %, workouts completed, avg daily steps, energy/focus score trend sparkline). It's labeled "Sample report, illustrative numbers" and notes that "Individual body composition stays private."
- **TransformationGallery** is a CSS scroll-snap row plus a grid mode, using `astro:assets` `<Image>` with widths [360, 720], lazy loading and meaningful alt text ("Client transformation, before and after").
- **FAQ** is a `<details>` per item with `id="faq"` on the section.
- [ ] Build passes. Commit `feat: section components`.

### Task 8: Pages

**Files:** Create in `pages/`:
- `index.astro`, `teams.astro`, `coaching.astro`, `results.astro`, `about.astro`, `book.astro`
- `contact.astro`, `contact/thanks.astro`, `free-guide.astro`, `free-guide/thanks.astro`
- `privacy.astro`, `terms.astro`, `disclaimer.astro`
- `blog/index.astro`, `blog/[slug].astro`, `llms.txt.ts`

Plus the photo assets in `assets/photos/` (the old-site home/about/faq images, deck `image34.png`) and `assets/app/` (the Trainerize screenshots, with `image32` masked using the slide's black boxes; see Step 1).

- [ ] **Step 1: Mask the leaderboard screenshot.** Scale the slide-18 box rectangles (EMU) from the picture frame onto the image's pixels and draw filled black rectangles with PIL. Save the result as `assets/app/leaderboard.png`, then visually confirm no names or faces are visible.
- [ ] **Step 2: Build each page** to its block list in spec §5.1–§5.10:
  - Every page passes `title` and `description`, plus its `jsonLd`: `serviceLd` + `faqLd` on teams/coaching, `personLd` on about, `blogPostingLd` on posts, breadcrumbs everywhere except home.
  - **Home** runs `assertContentReady` over the stats, research, testimonials and case study using `strictContent()`.
  - **Contact:** Netlify form `contact` with `data-netlify="true"`, `netlify-honeypot="bot-field"`, `action="/contact/thanks/"`, and the fields in spec §5.9. The company and team-size fields sit in a fieldset with the `hidden` attribute when JS is on and interest isn't "teams"; with JS off, they're always visible. The enhancement script submits via `fetch('/', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams(new FormData(form))})` and then navigates to the thanks page.
  - **Free guide:** Netlify form `free-guide` (`firstName`, `email`, honeypot), with `action` set to the thanks page.
  - **Book:** two `BookingCard`s using `bookingHref()`. With Calendly unset, each shows a "Booking opens soon" Placeholder and a link to `/contact/`.
  - **`llms.txt.ts`:** plain-text summary (spec §9.3) with absolute links to the key pages and all posts.
- [ ] **Step 3:** `npm run build && npm run check` passes. Commit `feat: all pages`.

### Task 9: Redirects, OG images, favicon

**Files:** Create `site/public/_redirects` (exactly spec §4.3, with a `301` status on each line), `site/public/og/*.png` (1200×630: ink background, logo, headline; 3 variants, generated with PIL from the logo and tokens), and `site/public/favicon.png` (AQ mark on ink, 512px).
- [ ] Build, then check that `dist/_redirects` has 15 rules. Commit `feat: redirects from old Shopify URLs, OG images, favicon`.

### Task 10: Verify research stats (content task)

**Files:** Modify `site/src/content/stats.yaml` and `site/src/content/research.yaml`.
- [ ] For each deck figure (spec §9.4), find the primary source (WebSearch/WebFetch).
  - If it's confirmed, set `verified: true` and fill in `sourceUrl`/`sourceTitle`/`year`, rewording the label to match what the source actually says.
  - If it can't be confirmed, delete the entry (no unverifiable claims ship).
  - Keep 3 or more verified problem stats for the home page. If fewer survive, the home StatRow shows what's left.
- [ ] Build. Commit `content: verify research stats against primary sources`.

### Task 11: Quality checks

**Files:** Create `site/scripts/check-links.mjs` and `site/scripts/a11y.mjs`.
- **`check-links.mjs`:** walk `dist/**/*.html`, collect `href`/`src` values starting with `/`, and resolve each against `dist` (the file, `index.html`, or `.html`). Also check that every `_redirects` target exists. Exit 1 with a list if anything is missing.
- **`a11y.mjs`:** start `astro preview` on port 4321, then use Playwright (Chromium) with `@axe-core/playwright` on `/`, `/teams/`, `/coaching/`, `/results/`, `/contact/` and the first blog post. Fail on `serious` or `critical` violations and print them.
- [ ] Run `npm test && npm run check && npm run build && npm run links && npm run a11y`, and fix issues until all pass.
- [ ] Run Lighthouse on mobile (`npx lighthouse <preview-url> --preset=perf --form-factor=mobile` against `astro preview`, with Playwright's Chromium as `CHROME_PATH`) on `/`, `/teams/`, `/coaching/` and one post. Target ≥ 95 in all 4 categories (spec §1). If the CLI can't run locally, run it against the Netlify deploy in Task 12.
- [ ] Take full-page screenshots (desktop 1440 and mobile 390) of the key pages, review them once, and fix visible defects.
- [ ] Commit `test: link + accessibility checks`.

### Task 12: Deploy the demo to Netlify

- [ ] Push `main` to GitHub (the remote from Task 1).
- [ ] Create the Netlify project `aqfitness-demo` using the Netlify connector (`create-new-project`), then deploy (`deploy-site`) following the tool's instructions.
- [ ] Enable forms (`update-forms: enabled`), so form detection is on.
- [ ] Redeploy so the forms get detected. Confirm that `contact`, `free-guide` and `newsletter` appear (`get-forms-for-project`).
- [ ] Submit a test on `/contact/` and check that the submission shows up and the function log reads `mode=log`.
- [ ] Confirm the deployed `/robots.txt` says `Disallow: /` and the response has `X-Robots-Tag: noindex`.
- [ ] Hand the demo URL to the user, together with the list of `[PH]` items still open.
