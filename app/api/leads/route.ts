import { NextResponse } from "next/server";

/**
 * Lead intake endpoint.
 *
 * TODO (see design-specs/lead-routing-plan.md): store the lead in Supabase,
 * then deliver it to the dealer via lib/mail.ts with reply-to set to the
 * shopper. Until that lands, submissions are acknowledged and counted but not
 * delivered anywhere.
 *
 * NEVER log the whole payload. These forms carry names, emails, and phone
 * numbers, and Vercel retains function logs: logging the body turns them into
 * an unmanaged store of personal data that nobody remembers to purge. The
 * allowlist below is deliberately an allowlist and not a denylist, so a field
 * added to a form later is excluded until someone decides otherwise.
 */

/** Non-identifying fields that are safe to write to the log. */
const LOGGABLE = [
  "type",
  "boatId",
  "boat",
  "make",
  "model",
  "year",
  "dealerName",
  "dealer",
  "showLocation",
  "day",
  "daypart",
  "source",
  "submittedAt",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmTerm",
  "utmContent",
] as const;

function safeSummary(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of LOGGABLE) {
    const v = data[k];
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  // Presence, never content: enough to debug an empty submission without
  // recording who sent it.
  out.hasContact = Boolean(data.email || data.phone);
  return out;
}

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  // Honeypot: a real person never fills this, bots fill everything. Accept and
  // drop, so the bot sees success and does not retry with a different shape.
  if (typeof data.website === "string" && data.website.trim()) {
    return NextResponse.json({ ok: true, delivered: false });
  }

  console.log("[lead]", JSON.stringify(safeSummary(data)));

  return NextResponse.json({ ok: true, delivered: false });
}
