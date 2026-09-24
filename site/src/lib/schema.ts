// schema.org JSON-LD builders. Plain objects; the SEO component serializes them.
import { site, liveSocials } from '../config/site';

const ctx = { '@context': 'https://schema.org' } as const;
const abs = (siteUrl: string, path: string) => new URL(path, siteUrl).href;

function organizationRef(siteUrl: string) {
  return { '@type': 'Organization', name: site.name, url: abs(siteUrl, '/') };
}

export function organizationLd(siteUrl: string) {
  return {
    ...ctx,
    ...organizationRef(siteUrl),
    description: site.description,
    logo: abs(siteUrl, '/favicon.png'),
    founder: { '@type': 'Person', name: site.founder },
    areaServed: [site.serviceArea.inPerson, site.serviceArea.virtual],
    sameAs: liveSocials(),
  };
}

export function websiteLd(siteUrl: string) {
  return { ...ctx, '@type': 'WebSite', name: site.name, url: abs(siteUrl, '/') };
}

export function serviceLd(o: { name: string; description: string; url: string; areaServed: string[] }) {
  return {
    ...ctx,
    '@type': 'Service',
    name: o.name,
    description: o.description,
    url: o.url,
    areaServed: o.areaServed,
    provider: organizationRef(new URL(o.url).origin + '/'),
  };
}

export function personLd(siteUrl: string) {
  return {
    ...ctx,
    '@type': 'Person',
    name: site.founder,
    jobTitle: 'Founder & Head Coach',
    worksFor: organizationRef(siteUrl),
    url: abs(siteUrl, '/about/'),
    sameAs: liveSocials(),
    hasCredential: site.credentials.map((name) => ({ '@type': 'EducationalOccupationalCredential', name })),
  };
}

export function faqLd(items: { question: string; answer: string }[]) {
  return {
    ...ctx,
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.question, acceptedAnswer: { '@type': 'Answer', text: i.answer } })),
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    ...ctx,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((i, idx) => ({ '@type': 'ListItem', position: idx + 1, name: i.name, item: i.url })),
  };
}

export function blogPostingLd(p: { title: string; description: string; url: string; datePublished: Date; dateModified?: Date }) {
  return {
    ...ctx,
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.description,
    url: p.url,
    mainEntityOfPage: p.url,
    datePublished: p.datePublished.toISOString(),
    dateModified: (p.dateModified ?? p.datePublished).toISOString(),
    author: { '@type': 'Person', name: site.founder },
    publisher: organizationRef(new URL(p.url).origin + '/'),
  };
}
