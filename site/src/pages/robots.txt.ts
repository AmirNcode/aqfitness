import type { APIRoute } from 'astro';
import { allowIndexing } from '../lib/env';
import { robotsTxt } from '../lib/robots';

export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt({ indexable: allowIndexing(), sitemapUrl: new URL('sitemap-index.xml', site).href }));
