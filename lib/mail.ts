/**
 * Transactional email, server-side only.
 *
 * Talks to Resend over its REST API rather than pulling in an SDK, so there is
 * no dependency to keep current and nothing to bundle. Swapping providers means
 * rewriting send() alone.
 *
 * Required env (set in the Vercel project, never committed):
 *   RESEND_API_KEY    - provider key
 *   LEAD_FROM_EMAIL   - verified sender, e.g. customerinquiry@acvirtualboatshow.com
 *   LEAD_COPY_EMAIL   - inbox that receives a copy of every lead
 *
 * The sending domain needs SPF and DKIM records or these land in spam, which is
 * worse than not sending: everyone involved believes it worked.
 *
 * send() never throws. A lead failing to deliver must not 500 the request; the
 * caller decides what the boater sees, and the route falls back to telling them
 * to phone the dealer.
 */

const API = "https://api.resend.com/emails";

export const FROM = process.env.LEAD_FROM_EMAIL ?? "customerinquiry@acvirtualboatshow.com";
export const COPY_TO = process.env.LEAD_COPY_EMAIL ?? FROM;
export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY);

export type Mail = {
  to: string[];
  subject: string;
  text: string;
  /** Set so the dealer can reply straight to the boater. */
  replyTo?: string;
  bcc?: string[];
};

export async function send(mail: Mail): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "no RESEND_API_KEY" };
  if (!mail.to.length) return { ok: false, error: "no recipient" };

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Atlantic City In-Water Boat Show <${FROM}>`,
        to: mail.to,
        bcc: mail.bcc,
        reply_to: mail.replyTo,
        subject: mail.subject,
        text: mail.text,
      }),
    });
    if (!res.ok) return { ok: false, error: `resend ${res.status}: ${await res.text()}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
