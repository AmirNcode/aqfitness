import { describe, it, expect } from 'vitest';
import { organizationLd, faqLd, breadcrumbLd, serviceLd, personLd, blogPostingLd } from '../src/lib/schema';

describe('schema builders', () => {
  it('organization omits placeholder socials from sameAs', () => {
    const o: any = organizationLd('https://aqfitness.ca/');
    expect(o['@type']).toBe('Organization');
    expect(o.sameAs.length).toBeGreaterThan(0);
    expect(o.sameAs.every((u: string) => u.startsWith('https://'))).toBe(true);
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
    const s: any = serviceLd({ name: 'Habit Shift', description: 'd', url: 'https://a/teams/', areaServed: ['Greater Toronto Area'] });
    expect(s['@type']).toBe('Service');
    expect(s.provider['@type']).toBe('Organization');
    expect(s.areaServed).toEqual(['Greater Toronto Area']);
  });

  it('person lists credentials', () => {
    const p: any = personLd('https://aqfitness.ca/');
    expect(p['@type']).toBe('Person');
    expect(p.hasCredential.length).toBeGreaterThan(2);
  });

  it('blog posting uses ISO dates', () => {
    const b: any = blogPostingLd({ title: 't', description: 'd', url: 'https://a/blog/x/', datePublished: new Date('2025-02-26T19:44:12Z') });
    expect(b.datePublished).toBe('2025-02-26T19:44:12.000Z');
    expect(b.author.name).toBe('Alejandro Rivas');
  });
});
