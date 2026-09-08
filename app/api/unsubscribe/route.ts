import { NextResponse } from "next/server";
import { recordMarker, emailsForHash } from "@/lib/leads-store";
import { send, FROM, COPY_TO } from "@/lib/mail";

/**
 * One-click unsubscribe, promised beside the button on every form.
 *
 * Every unsubscribe is also reported to the show the same minute, by email
 * to SHOW_UNSUBSCRIBE_NOTIFY_TO (Jon, 2026-09-08). The policy promises that
 * one unsubscribe stops email from both the show and Buoy, and the show
 * keeps its own complete copy of the list in its own system, which our
 * exclusion list cannot reach. The notification is what keeps that promise
 * true; the show's job is to remove the address on receipt. The response to
 * the person never waits on it and never reveals whether it happened.
 *
 * The token is the recipient's contact fingerprint (64 hex chars), the same
 * HMAC stored with their lead. It is not personal data, it cannot be turned
 * back into an address, and knowing one grants nothing except the ability to
 * unsubscribe that person, which is a link only they were emailed.
 *
 * Unsubscribing appends a marker row rather than editing anything, and every
 * send excludes fingerprints with a marker. The response never reveals
 * whether the token matched a real recipient.
 *
 * GET renders a small confirmation page for humans who click the link.
 * POST satisfies RFC 8058 one-click, which Gmail and Yahoo require for the
 * List-Unsubscribe-Post header to work.
 */

const TOKEN_RE = /^[0-9a-f]{64}$/;

/** Where the show receives unsubscribe notices. Giselle runs the show's own
 *  sends, so her inbox is the default; override in Vercel without a deploy. */
const SHOW_NOTIFY_TO = process.env.SHOW_UNSUBSCRIBE_NOTIFY_TO ?? "giselle.acboatshow@gmail.com";

/**
 * Report the unsubscribe to the show so it can remove the address from its
 * own list. A test call goes to our own copy inbox instead, so the pipeline
 * can be exercised end to end without emailing the show.
 */
async function notifyShow(hash: string, isTest: boolean): Promise<void> {
  const emails = await emailsForHash(hash);
  if (!emails.length) return; // fingerprint only: nothing the show could hold
  const when = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" });
  const r = await send({
    to: [isTest ? COPY_TO : SHOW_NOTIFY_TO],
    bcc: isTest ? undefined : [COPY_TO],
    replyTo: FROM,
    subject: `${isTest ? "[Test] " : ""}Unsubscribe: remove ${emails[0]} from show email lists`,
    text: [
      `Someone unsubscribed from Atlantic City In-Water Boat Show email through acvirtualboatshow.com.`,
      ``,
      `Address${emails.length > 1 ? "es" : ""}: ${emails.join(", ")}`,
      `When: ${when} Eastern`,
      ``,
      `Our privacy policy promises that one unsubscribe stops email from both the show and Buoy.`,
      `It is already stopped on the site's side. Please remove this address from every show`,
      `list and system it appears in, so the show's own sends honor it too.`,
      ``,
      `This notice is automatic. Reply to this email with any questions.`,
    ].join("\n"),
  });
  if (!r.ok) console.error("[unsubscribe] show notice failed:", r.error);
}

async function unsubscribe(req: Request): Promise<boolean> {
  const url = new URL(req.url);
  const t = (url.searchParams.get("t") ?? "").toLowerCase();
  if (!TOKEN_RE.test(t)) return false;
  // Test calls tag themselves so cleanup stays the standing one-liner.
  const isTest = Boolean(url.searchParams.get("test"));
  const source = isTest ? "claude-test-cleanup" : "email-link";
  await recordMarker("unsubscribe", t, source);
  // Never let the notice stand between the person and their confirmation.
  await Promise.race([notifyShow(t, isTest), new Promise((r) => setTimeout(r, 4000))]);
  return true;
}

export async function POST(req: Request) {
  const ok = await unsubscribe(req);
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}

export async function GET(req: Request) {
  const ok = await unsubscribe(req);
  if (!ok) return new NextResponse("Invalid unsubscribe link.", { status: 400 });
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Unsubscribed</title></head>
<body style="margin:0;background:#F4F7F9;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#142E51">
<div style="max-width:520px;margin:12vh auto 0;background:#fff;border:1px solid rgba(20,46,81,.12);border-radius:16px;padding:36px 32px;text-align:center">
<div style="font-size:22px;font-weight:800">You are unsubscribed</div>
<p style="font-size:15px;line-height:1.6;color:#3d5260;margin:14px 0 0">No more email from the Atlantic City In-Water Boat Show will reach this address. If you change your mind, the crew at the show will be glad to see you either way.</p>
<p style="margin:22px 0 0"><a href="https://www.acvirtualboatshow.com" style="color:#2878B8;font-weight:600">acvirtualboatshow.com</a></p>
</div></body></html>`;
  return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
