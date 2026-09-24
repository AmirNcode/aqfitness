import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Alejandro Rivas'),
    draft: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: file('src/content/testimonials.yaml'),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      firstName: z.string().nullable(),
      quote: z.string().nullable(),
      image: image(),
      videoUrl: z.url().nullable(),
      side: z.enum(['coaching', 'performance']),
      featured: z.boolean().default(false),
      placeholder: z.boolean().default(false),
    }),
});

const faqItem = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  confirm: z.boolean().default(false),
  order: z.number(),
});

const faqTeams = defineCollection({ loader: file('src/content/faq-teams.yaml'), schema: faqItem });
const faqCoaching = defineCollection({ loader: file('src/content/faq-coaching.yaml'), schema: faqItem });

const stats = defineCollection({
  loader: file('src/content/stats.yaml'),
  schema: z.object({
    id: z.string(),
    value: z.string(),
    label: z.string(),
    sourceTitle: z.string().nullable(),
    sourceUrl: z.url().nullable(),
    year: z.number().nullable(),
    verified: z.boolean(),
    order: z.number().default(99),
  }),
});

const research = defineCollection({
  loader: file('src/content/research.yaml'),
  schema: z.object({
    id: z.string(),
    source: z.string(),
    scope: z.string(),
    finding: z.string(),
    url: z.url().nullable(),
    verified: z.boolean(),
  }),
});

export const collections = { blog, testimonials, faqTeams, faqCoaching, stats, research };
