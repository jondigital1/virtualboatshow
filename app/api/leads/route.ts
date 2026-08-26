import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { send, mailConfigured, COPY_TO } from "@/lib/mail";

/**
 * Lead intake.
 *
 * "dockside-walkthrough" is delivered to the dealer by email, with reply-to
 * set to the shopper so the dealer answers by hitting reply. That sidesteps
 * per-dealer CRM integration entirely: it works the same whether they run
 * DealerSocket or a shared Gmail.
 *
 * A dealer with no address on file does NOT lose the lead. It goes to the show
 * inbox instead, flagged, so a human can forward it. Dropping a real shopper's
 * request because an address had not come back yet is the one outcome worth
 * engineering around.
 *
 * Not yet stored: Supabase is next (see design-specs/lead-routing-plan.md).
 * Until then the BCC to the show inbox is the only archive, which is why it is
 * on every send.
 *
 * NEVER log the whole payload. These forms carry names, emails, and phone
 * numbers, and Vercel retains function logs: logging the body turns them into
 * an unmanaged store of personal data nobody remembers to purge. The allowlist
 * below is an allowlist and not a denylist on purpose, so a field added to a
 * form later is excluded until someone decides otherwise.
 */

const EMAILS_FILE = join(process.cwd(), "data", "dealer-emails.json");

/** Field caps: this endpoint is public and triggers outbound email. */
const CAP = { name: 120, email: 200, phone: 40, text: 200 };
const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const validEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

/** Non-identifying fields that are safe to write to the log. */
const LOGGABLE = [
  "type", "boatId", "make", "model", "year", "dealerName", "showLocation",
  "day", "daypart", "source", "submittedAt",
  "utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent",
] as const;

function safeSummary(data: Record<string, unknown>, extra: Record<string, unknown> = {}) {
  const out: Record<string, unknown> = {};
  for (const k of LOGGABLE) {
    const v = data[k];
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  out.hasContact = Boolean(data.email || data.phone);
  return { ...out, ...extra };
}

function dealerEmails(dealer: string): string[] {
  try {
    const map = JSON.parse(readFileSync(EMAILS_FILE, "utf8")) as Record<string, unknown>;
    const hit = map[dealer];
    return Array.isArray(hit) ? hit.filter((e): e is string => typeof e === "string" && validEmail(e)) : [];
  } catch {
    return [];
  }
}

const DAYS: Record<string, string> = {
  "2026-09-10": "Thursday, Sept 10",
  "2026-09-11": "Friday, Sept 11",
  "2026-09-12": "Saturday, Sept 12",
  "2026-09-13": "Sunday, Sept 13",
};

async function walkthrough(d: Record<string, unknown>) {
  const firstName = clean(d.firstName, CAP.name);
  const lastName = clean(d.lastName, CAP.name);
  const email = clean(d.email, CAP.email);
  const phone = clean(d.phone, CAP.phone);
  const day = clean(d.day, CAP.text);
  const daypart = clean(d.daypart, CAP.text);
  const dealer = clean(d.dealerName, CAP.text);
  const boat = [d.year, d.make, d.model].map((x) => clean(x, CAP.text)).filter(Boolean).join(" ");
  const where = clean(d.showLocation, CAP.text);
  const pageUrl = clean(d.pageUrl, 500);

  if (!firstName || !lastName || !validEmail(email)) {
    return NextResponse.json({ ok: false, error: "name and a valid email are required" }, { status: 400 });
  }

  const dayLabel = DAYS[day] ?? day;
  const to = dealerEmails(dealer);
  const noAddress = to.length === 0;

  const body = [
    noAddress ? `NO DEALER ADDRESS ON FILE for ${dealer}. Please forward this.` : "",
    noAddress ? "" : "",
    `A shopper is planning to see this boat at the show.`,
    ``,
    `Boat:     ${boat || "(not given)"}`,
    `Dealer:   ${dealer}`,
    where ? `Location: ${where}` : "",
    ``,
    `Visiting: ${dayLabel}${daypart ? `, ${daypart.toLowerCase()}` : ""}`,
    ``,
    `Name:     ${firstName} ${lastName}`,
    `Email:    ${email}`,
    `Phone:    ${phone || "not given"}`,
    ``,
    `Reply to this email to reach them directly.`,
    ``,
    `No exact appointment time was requested. Show pricing is given at the dock.`,
    pageUrl ? `\n${pageUrl}` : "",
  ].filter((l) => l !== "").join("\n");

  if (!mailConfigured()) {
    console.log("[lead:walkthrough:unconfigured]", JSON.stringify(safeSummary(d)));
    return NextResponse.json({ ok: true, delivered: false });
  }

  const result = await send({
    to: noAddress ? [COPY_TO] : to,
    bcc: noAddress ? undefined : [COPY_TO],
    replyTo: email,
    subject: noAddress
      ? `[No dealer address] Dockside walkthrough — ${boat || dealer}`
      : `Dockside walkthrough — ${boat || dealer}`,
    text: body,
  });

  if (!result.ok) {
    console.log("[lead:walkthrough:failed]", result.error, JSON.stringify(safeSummary(d)));
    return NextResponse.json({ ok: true, delivered: false });
  }

  // Best-effort confirmation to the shopper; a failure here changes nothing,
  // because the lead has already reached its destination.
  await send({
    to: [email],
    subject: `Your dockside walkthrough — ${boat || "the show"}`,
    text: [
      `Thanks ${firstName},`,
      ``,
      `${dealer} knows you are coming to see the ${boat || "boat"}${where ? ` at ${where}` : ""}.`,
      dayLabel ? `You told us ${dayLabel}${daypart ? `, ${daypart.toLowerCase()}` : ""}.` : "",
      ``,
      `No exact appointment time is needed. Visit the dealer any time during`,
      `your selected part of the day.`,
      ``,
      `Special show pricing is available directly from the dealer at the dock.`,
      ``,
      `Atlantic City In-Water Boat Show`,
      `September 10-13, 2026 · Farley State Marina`,
      `acvirtualboatshow.com`,
    ].filter((l) => l !== "").join("\n"),
  });

  console.log("[lead:walkthrough:sent]", JSON.stringify(safeSummary(d, { toDealer: !noAddress })));
  return NextResponse.json({ ok: true, delivered: true });
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

  if (data.type === "dockside-walkthrough") return walkthrough(data);

  console.log("[lead]", JSON.stringify(safeSummary(data)));
  return NextResponse.json({ ok: true, delivered: false });
}
