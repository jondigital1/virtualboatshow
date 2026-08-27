import { NextResponse } from "next/server";
import { recordMarker } from "@/lib/leads-store";

/**
 * One-click unsubscribe, promised in the ticket funnel's required checkbox.
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

async function unsubscribe(req: Request): Promise<boolean> {
  const url = new URL(req.url);
  const t = (url.searchParams.get("t") ?? "").toLowerCase();
  if (!TOKEN_RE.test(t)) return false;
  // Test calls tag themselves so cleanup stays the standing one-liner.
  const source = url.searchParams.get("test") ? "claude-test-cleanup" : "email-link";
  await recordMarker("unsubscribe", t, source);
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
