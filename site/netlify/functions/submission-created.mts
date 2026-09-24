// Netlify runs this on every verified form submission (event-triggered by its file name).
// It sends the confirmation/notification emails, or logs them while Resend isn't set up.
import type { Context } from '@netlify/functions';
import { buildEmails, contactFor, deliver, emailConfigFromEnv } from '../../src/lib/email';

export default async (req: Request, _context: Context) => {
  const { payload } = (await req.json()) as { payload?: { form_name?: string; data?: Record<string, unknown> } };
  const form = String(payload?.form_name ?? '');
  const data: Record<string, string> = Object.fromEntries(
    Object.entries(payload?.data ?? {}).map(([k, v]) => [k, v == null ? '' : String(v)]),
  );
  const cfg = emailConfigFromEnv(Netlify.env.toObject());
  try {
    const result = await deliver(buildEmails(form, data, cfg), contactFor(form, data, cfg), cfg);
    console.log(`submission-created: form=${form} mode=${result.mode} emails=${result.count}`);
  } catch (err) {
    // The submission itself is already stored by Netlify Forms; log and move on.
    console.error(`submission-created: form=${form} email delivery failed`, err);
  }
  return new Response(null, { status: 200 });
};
