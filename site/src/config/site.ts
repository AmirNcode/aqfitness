// Business facts and links used across the site. `null` means "not set up yet": the UI
// shows a placeholder, and `STRICT_CONTENT=true` builds will flag it (see lib/content-guard).
export const site = {
  name: 'Aquam Fitness',
  programName: 'Habit Shift',
  tagline: 'Eat. Train. Live.',
  founder: 'Alejandro Rivas',
  description:
    'Aquam Fitness helps companies build high-performing teams with a 12-week fitness and nutrition program, and coaches busy women over 30 one-on-one online.',
  email: null as string | null,
  serviceArea: {
    inPerson: 'Greater Toronto Area',
    virtual: 'Canada',
  },
  social: {
    instagram: 'https://www.instagram.com/vangaless/',
    linkedin: null as string | null,
    googleBusiness: null as string | null,
  },
  calendly: {
    consult: null as string | null,
    discovery: null as string | null,
  },
  nav: [
    { label: 'For Teams', href: '/teams/' },
    { label: '1:1 Coaching', href: '/coaching/' },
    { label: 'Results', href: '/results/' },
    { label: 'About', href: '/about/' },
    { label: 'Blog', href: '/blog/' },
  ],
  credentials: [
    'Fitness & Health Promotion diploma',
    'Precision Nutrition Certified Nutrition Coach',
    'Precision Nutrition Sleep, Stress Management & Recovery certification',
    'Certified Personal Trainer (CanFitPro)',
    'First Aid & CPR',
  ],
  proof: {
    clients: '200+',
    clientsLabel: 'clients coached since 2020',
    classes: '5,000+',
    classesLabel: 'group fitness classes coached',
  },
} as const;

export type BookingKind = 'consult' | 'discovery';

/** Where a "book a call" button should go: the Calendly event once it exists, otherwise /book/. */
export function bookingHref(kind: BookingKind): string {
  return site.calendly[kind] ?? `/book/#${kind}`;
}

/** Social profiles that actually exist (placeholders are left out). */
export function liveSocials(): string[] {
  return Object.values(site.social).filter((url): url is string => Boolean(url));
}
