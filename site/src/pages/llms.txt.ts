import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../config/site';

// A plain-language summary for AI assistants and answer engines (llmstxt.org format).
export const GET: APIRoute = async ({ site: origin }) => {
  const u = (path: string) => new URL(path, origin).href;
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
  const body = `# ${site.name}

> ${site.description}

${site.name} is run by ${site.founder}, a Precision Nutrition certified nutrition coach and certified personal trainer based in Toronto, Canada. He has coached ${site.proof.clients} clients since 2020 and ${site.proof.classes} group fitness classes. Coach Vicky also works one-on-one with women, helping them build a healthy relationship with food.

## Services

- [${site.programName}](${u('/teams/')}): a team fitness and nutrition program for companies, starting at 12 weeks. Teams of 8+ get 1:1 coaching, team challenges and a leaderboard, and the company receives a progress report every 4 weeks. Weeks 1–4 are the Foundation phase; weeks 5–12 build Momentum. Delivered virtually, with in-person sessions at offices in the ${site.serviceArea.inPerson}.
- [1:1 online coaching](${u('/coaching/')}): online training and nutrition coaching (or nutrition-only coaching) for busy women over 30, anywhere in ${site.serviceArea.virtual}. No restrictive diets; all foods fit.
- [Book a call](${u('/book/')}): free 30-minute discovery calls for companies and free consults for individuals. Pricing is shared on the call.

## About

- [Meet the coaches](${u('/about/')})
- [Client results](${u('/results/')})
- [Contact](${u('/contact/')})

## Blog

${posts.map((p) => `- [${p.data.title}](${u(`/blog/${p.id}/`)}): ${p.data.description}`).join('\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
