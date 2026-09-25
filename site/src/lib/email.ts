// Turns verified Netlify Form submissions into emails (and newsletter contacts) via Resend.
// Without RESEND_API_KEY everything is logged instead of sent: the placeholder mode used until
// Alejandro's Resend account and domain are set up.

export type FormName = 'contact' | 'free-guide' | 'newsletter';

export interface EmailConfig {
  apiKey?: string;
  from?: string;
  owner?: string;
  segmentId?: string;
  guideUrl?: string;
  siteUrl: string;
}

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface ContactInput {
  email: string;
  firstName?: string;
  segmentId?: string;
}

const RESEND_API = 'https://api.resend.com';
const DEFAULT_FROM = 'Aquam Fitness <onboarding@resend.dev>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailConfigFromEnv(env: Record<string, string | undefined>): EmailConfig {
  return {
    apiKey: env.RESEND_API_KEY || undefined,
    from: env.EMAIL_FROM || undefined,
    owner: env.EMAIL_OWNER || undefined,
    segmentId: env.RESEND_SEGMENT_ID || undefined,
    guideUrl: env.GUIDE_URL || undefined,
    siteUrl: env.SITE_URL || 'https://aqfitness.ca/',
  };
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const validEmail = (v?: string): v is string => typeof v === 'string' && EMAIL_RE.test(v.trim());

function layout(title: string, body: string, siteUrl: string): string {
  return `<!doctype html><html><body style="margin:0;background:#F4F3EF;font-family:Arial,Helvetica,sans-serif;color:#0E0E0F">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#B8431D;margin:0 0 8px">Aquam Fitness</p>
<h1 style="font-size:24px;line-height:1.2;margin:0 0 16px">${title}</h1>
${body}
<p style="font-size:13px;color:#5E6F85;margin-top:32px">Aquam Fitness · <a href="${esc(siteUrl)}" style="color:#B8431D">${esc(siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a></p>
</div></body></html>`;
}

const p = (text: string) => `<p style="font-size:16px;line-height:1.55;margin:0 0 14px">${text}</p>`;
const hello = (name?: string) => (name ? `Hi ${esc(name.trim())},` : 'Hi there,');

function fieldsTable(data: Record<string, string>): string {
  const rows = Object.entries(data)
    .filter(([k, v]) => v && !['form-name', 'bot-field'].includes(k))
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#5E6F85;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('');
  return `<table style="font-size:15px;border-collapse:collapse">${rows}</table>`;
}

export function buildEmails(form: string, data: Record<string, string>, cfg: EmailConfig): OutgoingEmail[] {
  const email = data.email?.trim();
  if (!validEmail(email)) return [];
  const name = data.name || data.firstName;
  const book = new URL('/book/', cfg.siteUrl).href;

  switch (form as FormName) {
    case 'contact': {
      const teams = data.interest === 'teams';
      const confirmation: OutgoingEmail = {
        to: email,
        subject: teams ? 'Thanks for your interest in Habit Shift' : 'Thanks for reaching out to Aquam Fitness',
        html: layout(
          teams ? 'Let’s talk about your team' : 'We got your message',
          p(hello(name)) +
            p(teams
              ? 'Thanks for your interest in Habit Shift, our team fitness and nutrition program. We’ll get back to you within 2 business days.'
              : 'Thanks for reaching out. We’ll get back to you within 2 business days.') +
            p(`Want to skip the wait? <a href="${esc(book)}" style="color:#B8431D">Book a call</a> at a time that suits you.`),
          cfg.siteUrl,
        ),
      };
      if (!cfg.owner) return [confirmation];
      const notification: OutgoingEmail = {
        to: cfg.owner,
        replyTo: email,
        subject: `New ${teams ? 'Habit Shift inquiry' : 'website message'}${data.company ? ` from ${data.company}` : ''}`,
        html: layout('New contact form submission', fieldsTable(data), cfg.siteUrl),
      };
      return [confirmation, notification];
    }
    case 'free-guide':
      return [{
        to: email,
        subject: 'Your free meal-prep guide',
        html: layout(
          'Your meal-prep guide',
          p(hello(name)) +
            (cfg.guideUrl
              ? p(`Here it is: <a href="${esc(cfg.guideUrl)}" style="color:#B8431D">download your meal-prep guide</a>.`)
              : p('Thanks for signing up! The guide is coming soon, and we’ll email it to you the moment it’s ready.')) +
            p('You’ll also get occasional tips on training, nutrition and building habits that stick.'),
          cfg.siteUrl,
        ),
      }];
    case 'newsletter':
      return [{
        to: email,
        subject: 'Welcome to the Aquam Fitness newsletter',
        html: layout(
          'You’re in',
          p(hello(name)) + p('Thanks for subscribing. Expect practical tips on training, nutrition and recovery, no spam.'),
          cfg.siteUrl,
        ),
      }];
    default:
      return [];
  }
}

export function contactFor(form: string, data: Record<string, string>, cfg: EmailConfig): ContactInput | null {
  if (form !== 'newsletter' && form !== 'free-guide') return null;
  const email = data.email?.trim();
  if (!validEmail(email)) return null;
  return { email, firstName: data.firstName || undefined, segmentId: cfg.segmentId };
}

async function post(fetchImpl: typeof fetch, apiKey: string, path: string, body: unknown): Promise<void> {
  const res = await fetchImpl(`${RESEND_API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Resend ${path} failed: ${res.status} ${await res.text()}`);
}

export async function deliver(
  emails: OutgoingEmail[],
  contact: ContactInput | null,
  cfg: EmailConfig,
  fetchImpl: typeof fetch = fetch,
  log: (msg: string) => void = console.log,
): Promise<{ mode: 'log' | 'sent'; count: number }> {
  if (!cfg.apiKey) {
    for (const e of emails) log(`[email:placeholder] to=${e.to} subject="${e.subject}"`);
    if (contact) log(`[contact:placeholder] would add ${contact.email} to segment ${contact.segmentId ?? '(none)'}`);
    return { mode: 'log', count: emails.length };
  }
  const from = cfg.from ?? DEFAULT_FROM;
  for (const e of emails) {
    await post(fetchImpl, cfg.apiKey, '/emails', {
      from,
      to: [e.to],
      subject: e.subject,
      html: e.html,
      ...(e.replyTo ? { reply_to: e.replyTo } : {}),
    });
  }
  if (contact) {
    await post(fetchImpl, cfg.apiKey, '/contacts', {
      email: contact.email,
      first_name: contact.firstName,
      unsubscribed: false,
      ...(contact.segmentId ? { segments: [{ id: contact.segmentId }] } : {}),
    });
  }
  return { mode: 'sent', count: emails.length };
}
