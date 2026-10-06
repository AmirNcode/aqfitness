import { getCollection } from 'astro:content';

/** Client results in display order: lower `order` first, then by id (the file loader sorts by id). */
export async function getResults() {
  return (await getCollection('testimonials'))
    .map((e) => e.data)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
