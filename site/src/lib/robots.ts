export const AI_CRAWLERS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'] as const;

export function robotsTxt({ indexable, sitemapUrl }: { indexable: boolean; sitemapUrl: string }): string {
  if (!indexable) return 'User-agent: *\nDisallow: /\n';
  const blocks = ['User-agent: *\nAllow: /', ...AI_CRAWLERS.map((bot) => `User-agent: ${bot}\nAllow: /`)];
  return `${blocks.join('\n\n')}\n\nSitemap: ${sitemapUrl}\n`;
}
