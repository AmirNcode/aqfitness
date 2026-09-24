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
