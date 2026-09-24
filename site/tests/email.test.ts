import { describe, it, expect, vi } from 'vitest';
import { buildEmails, contactFor, deliver, emailConfigFromEnv, type EmailConfig } from '../src/lib/email';

const cfg: EmailConfig = { siteUrl: 'https://aqfitness.ca/', owner: 'owner@example.com', from: 'Aquam <hi@example.com>' };

describe('emailConfigFromEnv', () => {
  it('maps env vars and defaults siteUrl', () => {
    const c = emailConfigFromEnv({ RESEND_API_KEY: 're_1', EMAIL_OWNER: 'o@x.co', RESEND_SEGMENT_ID: 'seg' });
    expect(c).toMatchObject({ apiKey: 're_1', owner: 'o@x.co', segmentId: 'seg', siteUrl: 'https://aqfitness.ca/' });
  });
});

describe('buildEmails', () => {
  it('contact: confirmation + owner notification with reply-to', () => {
    const e = buildEmails('contact', { name: 'Sam', email: 'sam@example.com', message: 'Hi' }, cfg);
    expect(e.map((m) => m.to)).toEqual(['sam@example.com', 'owner@example.com']);
    expect(e[1].replyTo).toBe('sam@example.com');
  });

  it('skips owner notification when owner unset', () => {
    expect(buildEmails('contact', { email: 'sam@example.com' }, { siteUrl: cfg.siteUrl })).toHaveLength(1);
  });

  it('escapes HTML in user input', () => {
    const [, owner] = buildEmails('contact', { email: 'a@b.co', message: '<script>x</script>' }, cfg);
    expect(owner.html).not.toContain('<script>');
    expect(owner.html).toContain('&lt;script&gt;');
  });

  it('teams interest uses company wording', () => {
    const [conf] = buildEmails('contact', { email: 'a@b.co', interest: 'teams', company: 'Acme' }, cfg);
    expect(conf.subject).toMatch(/Aquam Performance/);
  });

  it('rejects unknown forms and invalid emails', () => {
    expect(buildEmails('spam', { email: 'a@b.co' }, cfg)).toEqual([]);
    expect(buildEmails('contact', { email: 'not-an-email' }, cfg)).toEqual([]);
  });

  it('free-guide says coming soon without guideUrl, links it with one', () => {
    const [m] = buildEmails('free-guide', { email: 'a@b.co', firstName: 'Ana' }, cfg);
    expect(m.html).toMatch(/coming soon/i);
    const [m2] = buildEmails('free-guide', { email: 'a@b.co' }, { ...cfg, guideUrl: 'https://x.co/guide.pdf' });
    expect(m2.html).toContain('https://x.co/guide.pdf');
  });

  it('newsletter sends a welcome only', () => {
    const e = buildEmails('newsletter', { email: 'a@b.co' }, cfg);
    expect(e).toHaveLength(1);
    expect(e[0].to).toBe('a@b.co');
  });
});

describe('contactFor', () => {
  it('only newsletter and free-guide create contacts', () => {
    expect(contactFor('contact', { email: 'a@b.co' }, cfg)).toBeNull();
    expect(contactFor('newsletter', { email: 'a@b.co' }, { ...cfg, segmentId: 'seg_1' })).toEqual({
      email: 'a@b.co',
      firstName: undefined,
      segmentId: 'seg_1',
    });
    expect(contactFor('free-guide', { email: 'bad' }, cfg)).toBeNull();
  });
});

describe('deliver', () => {
  it('logs instead of sending without an API key', async () => {
    const fetchImpl = vi.fn();
    const log = vi.fn();
    const r = await deliver([{ to: 'a@b.co', subject: 's', html: 'h' }], null, cfg, fetchImpl as any, log);
    expect(r).toEqual({ mode: 'log', count: 1 });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalled();
  });

  it('posts to Resend emails + contacts with a key', async () => {
    const fetchImpl = vi.fn().mockImplementation(async () => new Response('{}', { status: 200 }));
    const r = await deliver(
      [{ to: 'a@b.co', subject: 's', html: 'h' }],
      { email: 'a@b.co', segmentId: 'seg_1' },
      { ...cfg, apiKey: 're_test' },
      fetchImpl as any,
      () => {},
    );
    expect(r).toEqual({ mode: 'sent', count: 1 });
    expect(fetchImpl.mock.calls.map((c: any) => c[0])).toEqual(['https://api.resend.com/emails', 'https://api.resend.com/contacts']);
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('Bearer re_test');
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body).segments).toEqual([{ id: 'seg_1' }]);
  });

  it('throws when Resend rejects an email', async () => {
    const fetchImpl = vi.fn().mockImplementation(async () => new Response('bad', { status: 422 }));
    await expect(
      deliver([{ to: 'a@b.co', subject: 's', html: 'h' }], null, { ...cfg, apiKey: 're_test' }, fetchImpl as any, () => {}),
    ).rejects.toThrow(/422/);
  });
});
