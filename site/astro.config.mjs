// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL is the canonical origin. It defaults to the future production domain so
// canonicals never point at the temporary Netlify demo URL.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://aqfitness.ca',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !/\/(contact|free-guide)\/thanks\/$/.test(page),
    }),
  ],
  fonts: [
    {
      name: 'Barlow',
      cssVariable: '--font-body',
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      name: 'Barlow Condensed',
      cssVariable: '--font-display',
      provider: fontProviders.fontsource(),
      weights: [700, 800],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial Narrow', 'sans-serif'],
    },
  ],
});
