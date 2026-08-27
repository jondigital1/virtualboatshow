import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { send, FROM } from "@/lib/mail";
import { contactHash, listOpeningDayRecipients, listHashesByType, recordMarker } from "@/lib/leads-store";

/**
 * The opening-day send: the email every ticket-funnel signup was promised by
 * the required checkbox, "email me when show access goes live."
 *
 * Fired by Vercel cron at 14:00 UTC on September 10, 2026, which is 10:00 AM
 * Eastern, the exact moment the inventory gate lifts (lib/gate.ts SHOW_OPENS).
 * Vercel includes CRON_SECRET as a bearer token on cron invocations; the same
 * token triggers manual runs. With no CRON_SECRET configured the route
 * refuses everything, so it fails closed.
 *
 * Safe to invoke repeatedly: each delivery is recorded as an
 * "opening-day-sent" marker and already-sent fingerprints are skipped, so a
 * cron retry or a manual re-trigger resumes instead of double-sending. If the
 * unsubscribe or sent lists cannot be loaded, nothing sends at all.
 *
 * Sent FROM updates@, never customerinquiry@: a recipient who made no inquiry
 * reads that address as a mistake. Replies still go to the monitored inbox
 * via reply-to.
 *
 * Modes (all require the bearer token):
 *   ?dry=1        report who would get it and the exact body; send nothing
 *   ?test=EMAIL   send one real email, subject prefixed [Test], to EMAIL
 *   (no params)   the real run
 */

export const maxDuration = 60;

const UPDATES_FROM = "Atlantic City In-Water Boat Show <updates@acvirtualboatshow.com>";
const SITE = "https://www.acvirtualboatshow.com";
/** Resend allows 2 requests a second; stay under it. */
const DELAY_MS = 550;
/** Stop dispatching near the function limit; the next invocation resumes. */
const TIME_BUDGET_MS = 45_000;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET ?? "";
  if (!secret) return false;
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

function body(firstName: string | null, unsubUrl: string): string {
  return [
    `Hi ${firstName?.trim() || "there"},`,
    ``,
    `You asked us to tell you the moment show access goes live. It just did.`,
    ``,
    `Every feature boat is now open to browse: full photo galleries, the`,
    `exact dock and slip where each boat is tied up, and dockside walkthrough`,
    `booking with the dealer.`,
    ``,
    `Start here:`,
    `${SITE}/inventory`,
    ``,
    `September 10-13, 2026 · Farley State Marina, Atlantic City`,
    `Special show pricing is available directly from the dealer at the dock.`,
    ``,
    `See you at the docks,`,
    `Atlantic City In-Water Boat Show`,
    `acvirtualboatshow.com`,
    ``,
    `----`,
    `No more email from the show, ever: ${unsubUrl}`,
  ].join("\n");
}

function mailFor(firstName: string | null, email: string, hash: string | null, testMode: boolean) {
  const unsubUrl = hash ? `${SITE}/api/unsubscribe?t=${hash}` : `${SITE}/privacy`;
  return {
    from: UPDATES_FROM,
    replyTo: FROM,
    to: [email],
    subject: `${testMode ? "[Test] " : ""}Boat show access is live`,
    text: body(firstName, unsubUrl),
    headers: hash
      ? {
          "List-Unsubscribe": `<${unsubUrl}>, <mailto:${FROM}?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }
      : undefined,
  };
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: process.env.CRON_SECRET ? 401 : 503 });
  }
  const url = new URL(req.url);

  // One real email to one address, for eyeballing in a live inbox.
  const test = url.searchParams.get("test");
  if (test) {
    const result = await send(mailFor("Jon", test.trim(), contactHash(test.trim()), true));
    return NextResponse.json({ ok: result.ok, mode: "test", to: "1 address", error: result.error });
  }

  const recipients = await listOpeningDayRecipients();
  const unsubscribed = await listHashesByType("unsubscribe");
  const alreadySent = await listHashesByType("opening-day-sent");
  if (!recipients || !unsubscribed || !alreadySent) {
    // Without the exclusion lists a run could double-send or email someone
    // who unsubscribed. Refusing outright is the only safe behaviour.
    return NextResponse.json({ ok: false, error: "store unavailable, nothing sent" }, { status: 503 });
  }

  const queue = recipients.filter((r) => {
    const h = r.contact_hash;
    return !(h && (unsubscribed.has(h) || alreadySent.has(h)));
  });

  if (url.searchParams.get("dry")) {
    const preview = queue.slice(0, 50).map((r) => ({
      first: r.first_name ?? "(none)",
      email: r.email.replace(/^(..)[^@]*(@.*)$/, "$1***$2"),
    }));
    return NextResponse.json({
      ok: true,
      mode: "dry",
      totalOnList: recipients.length,
      unsubscribed: recipients.length - queue.length,
      wouldSend: queue.length,
      preview,
      sampleBody: body("Sample", `${SITE}/api/unsubscribe?t=TOKEN`),
    });
  }

  const started = Date.now();
  let sent = 0;
  const failures: string[] = [];
  for (const r of queue) {
    if (Date.now() - started > TIME_BUDGET_MS) break;
    const result = await send(mailFor(r.first_name, r.email, r.contact_hash, false));
    if (result.ok) {
      sent++;
      if (r.contact_hash) await recordMarker("opening-day-sent", r.contact_hash, "opening-day-send");
    } else {
      failures.push(result.error ?? "unknown");
    }
    await new Promise((res) => setTimeout(res, DELAY_MS));
  }

  const remaining = queue.length - sent - failures.length;
  console.log("[opening-day-send]", JSON.stringify({ sent, failed: failures.length, remaining }));
  return NextResponse.json({
    ok: failures.length === 0,
    sent,
    failed: failures.length,
    remaining,
    note: remaining > 0 ? "invoke again to continue, already-sent are skipped" : "list complete",
    errors: failures.slice(0, 3),
  });
}
