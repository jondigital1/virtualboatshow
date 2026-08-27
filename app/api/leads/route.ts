import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { send, mailConfigured, COPY_TO } from "@/lib/mail";
import { insertLead, markDelivered, contactHash } from "@/lib/leads-store";

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
 * The lead is written to Supabase BEFORE the email goes out, so a delivery
 * failure never loses it. Email is the notification; the row is the record.
 * Contact details are stored only with consent, and a database constraint
 * enforces that independently of this code.
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
/** Consent is opt-in: anything other than an explicit true is a no. */
const hasConsent = (d: Record<string, unknown>) => d.marketingOptIn === true;
const validEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

/**
 * buoyboating.com posts its crew-list signups here (buoyWaitlist below), so
 * its origins must be allowed to read the response. Same-origin traffic never
 * matches, so nothing changes for the show's own forms.
 */
const CROSS_ORIGINS = new Set([
  "https://www.buoyboating.com",
  "https://buoyboating.com",
  "http://localhost:3000", // buoyboating astro dev
]);
const corsHeaders = (req: Request): Record<string, string> | undefined => {
  const origin = req.headers.get("origin");
  return origin && CROSS_ORIGINS.has(origin)
    ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
    : undefined;
};

/** Where crew-list signups are announced. The lead row is the actual list. */
const WAITLIST_TO = process.env.BUOY_WAITLIST_EMAIL ?? "jon@buoyboating.com";

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

  const optIn = hasConsent(d);

  // Stored first: if the email fails the lead still exists and can be replayed.
  // Email is the notification, not the record.
  const leadId = await insertLead({
    type: "dockside-walkthrough",
    source: clean(d.source, CAP.text) || null,
    boat_slug: clean(d.boatId, CAP.text) || null,
    boat_year: Number(d.year) || null,
    boat_make: clean(d.make, CAP.text) || null,
    boat_model: clean(d.model, CAP.text) || null,
    dealer_name: dealer || null,
    show_location: where || null,
    show_day: /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null,
    daypart: daypart || null,
    page_url: pageUrl || null,
    referrer: clean(d.referrer, 500) || null,
    utm_source: clean(d.utmSource, CAP.text) || null,
    utm_medium: clean(d.utmMedium, CAP.text) || null,
    utm_campaign: clean(d.utmCampaign, CAP.text) || null,
    utm_term: clean(d.utmTerm, CAP.text) || null,
    utm_content: clean(d.utmContent, CAP.text) || null,
    contact_hash: contactHash(email),
    // Contact details only with consent. A database constraint enforces this
    // too, so a mistake here is rejected rather than quietly stored.
    marketing_opt_in: optIn,
    first_name: optIn ? firstName : null,
    last_name: optIn ? lastName : null,
    email: optIn ? email : null,
    phone: optIn ? phone || null : null,
  });

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

  if (leadId) await markDelivered(leadId, result.ok, result.ok ? undefined : result.error);

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

  console.log("[lead:walkthrough:sent]", JSON.stringify(safeSummary(d, { toDealer: !noAddress, stored: Boolean(leadId) })));
  return NextResponse.json({ ok: true, delivered: true });
}

/**
 * Partnership enquiries from /vendors. These go to the show inbox rather than
 * to a dealer: they are people asking to exhibit or sponsor, not shoppers.
 *
 * marketing_opt_in is true here without a checkbox, and deliberately so: the
 * entire purpose of the form is to ask us to get in touch, which is consent by
 * any reasonable reading. A shopper browsing boats is a different situation,
 * which is why that form asks explicitly.
 *
 * The message body is emailed but not stored. It is free text a human acts on,
 * and keeping it out of the database avoids holding correspondence we have no
 * process for.
 */
async function vendorInquiry(d: Record<string, unknown>) {
  const company = clean(d.company, CAP.text);
  const name = clean(d.name, CAP.name);
  const email = clean(d.email, CAP.email);
  const interest = clean(d.interest, CAP.text);
  const message = clean(d.message, 4000);

  if (!name || !validEmail(email)) {
    return NextResponse.json({ ok: false, error: "name and a valid email are required" }, { status: 400 });
  }

  const leadId = await insertLead({
    type: "vendor-inquiry",
    // Caller-supplied source wins so test submissions stay identifiable;
    // the form itself sends nothing, hence the default.
    source: clean(d.source, CAP.text) || "vendors-page",
    dealer_name: company || null,
    page_url: clean(d.pageUrl, 500) || null,
    referrer: clean(d.referrer, 500) || null,
    daypart: interest || null,
    contact_hash: contactHash(email),
    marketing_opt_in: true,
    first_name: name,
    last_name: null,
    email,
    phone: clean(d.phone, CAP.phone) || null,
  });

  if (!mailConfigured()) {
    console.log("[lead:vendor:unconfigured]", JSON.stringify(safeSummary(d, { stored: Boolean(leadId) })));
    return NextResponse.json({ ok: true, delivered: false });
  }

  const result = await send({
    to: [COPY_TO],
    replyTo: email,
    subject: `Partnership enquiry — ${company || name}`,
    text: [
      `New enquiry from the Marine Marketplace page.`,
      ``,
      `Interested in: ${interest || "not specified"}`,
      `Company:       ${company || "not given"}`,
      `Name:          ${name}`,
      `Email:         ${email}`,
      ``,
      message ? `Message:\n${message}` : `(no message)`,
      ``,
      `Reply to this email to reach them directly.`,
    ].join("\n"),
  });

  if (leadId) await markDelivered(leadId, result.ok, result.ok ? undefined : result.error);
  console.log("[lead:vendor]", JSON.stringify(safeSummary(d, { stored: Boolean(leadId), delivered: result.ok })));
  return NextResponse.json({ ok: true, delivered: result.ok });
}

/**
 * Crew-list signups from buoyboating.com. Cross-origin on purpose: the
 * marketing site is static, and this project already has record-first lead
 * storage and mail, so the waitlist lives here instead of growing a second
 * backend.
 *
 * marketing_opt_in is true without a checkbox for the same reason as
 * vendorInquiry: the form's one purpose is "email me when buoy launches."
 * No confirmation email goes out. The page promises exactly one email ever
 * (the launch announcement), and the first thing a signup receives should
 * not be a second email, least of all from a boat show address.
 */
async function buoyWaitlist(d: Record<string, unknown>, cors?: Record<string, string>) {
  const name = clean(d.name, CAP.name);
  const email = clean(d.email, CAP.email);

  if (!name || !validEmail(email)) {
    return NextResponse.json({ ok: false, error: "name and a valid email are required" }, { status: 400, headers: cors });
  }

  const leadId = await insertLead({
    type: "buoy-waitlist",
    source: clean(d.source, CAP.text) || "buoyboating.com",
    page_url: clean(d.pageUrl, 500) || null,
    referrer: clean(d.referrer, 500) || null,
    contact_hash: contactHash(email),
    marketing_opt_in: true,
    first_name: name,
    last_name: null,
    email,
  });

  if (!mailConfigured()) {
    console.log("[lead:buoy-waitlist:unconfigured]", JSON.stringify(safeSummary(d, { stored: Boolean(leadId) })));
    return NextResponse.json({ ok: true, delivered: false }, { headers: cors });
  }

  const result = await send({
    to: [WAITLIST_TO],
    replyTo: email,
    subject: `Crew list — ${name}`,
    text: [
      `New crew-list signup from buoyboating.com.`,
      ``,
      `Name:  ${name}`,
      `Email: ${email}`,
      ``,
      `The signup is stored with the other leads (type buoy-waitlist).`,
    ].join("\n"),
  });

  if (leadId) await markDelivered(leadId, result.ok, result.ok ? undefined : result.error);
  console.log("[lead:buoy-waitlist]", JSON.stringify(safeSummary(d, { stored: Boolean(leadId), delivered: result.ok })));
  return NextResponse.json({ ok: true, delivered: result.ok }, { headers: cors });
}

/**
 * Ticket-funnel capture, step one of the two-step push to the ticket window.
 *
 * Runs BEFORE the shopper reaches Interactive Ticketing. Nobody on our side
 * controls that platform or sees its orders, so this handoff moment is the
 * only point we control. Proving which sales came through this site happens
 * by matching these rows against the purchaser export the show can pull from
 * the ticketing platform.
 *
 * Capture grants NO inventory access: the gate stays shut until 10 AM on
 * opening day for everyone but the internal code, per the owners.
 *
 * No email is sent. Contact details are stored only with the marketing
 * opt-in, enforced by the same database constraint as every other lead;
 * without it only the anonymous contact fingerprint is kept.
 */
async function ticketIntent(d: Record<string, unknown>) {
  const email = clean(d.email, CAP.email);
  if (!validEmail(email)) {
    return NextResponse.json({ ok: false, error: "a valid email is required" }, { status: 400 });
  }
  const optIn = hasConsent(d);
  const leadId = await insertLead({
    type: "ticket-intent",
    source: clean(d.source, CAP.text) || "ticket-funnel",
    page_url: clean(d.pageUrl, 500) || null,
    referrer: clean(d.referrer, 500) || null,
    utm_source: clean(d.utmSource, CAP.text) || null,
    utm_medium: clean(d.utmMedium, CAP.text) || null,
    utm_campaign: clean(d.utmCampaign, CAP.text) || null,
    utm_term: clean(d.utmTerm, CAP.text) || null,
    utm_content: clean(d.utmContent, CAP.text) || null,
    contact_hash: contactHash(email),
    marketing_opt_in: optIn,
    first_name: optIn ? clean(d.firstName, CAP.name) || null : null,
    last_name: null,
    email: optIn ? email : null,
  });
  console.log("[lead:ticket-intent]", JSON.stringify(safeSummary(d, { stored: Boolean(leadId) })));
  return NextResponse.json({ ok: true });
}

/** Preflight for the cross-origin waitlist posts; a bare 204 for everyone else. */
export async function OPTIONS(req: Request) {
  const cors = corsHeaders(req);
  return new Response(null, {
    status: 204,
    headers: cors
      ? {
          ...cors,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        }
      : undefined,
  });
}

export async function POST(req: Request) {
  const cors = corsHeaders(req);
  let data: Record<string, unknown>;
  try {
    data = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400, headers: cors });
  }

  // Honeypot: a real person never fills this, bots fill everything. Accept and
  // drop, so the bot sees success and does not retry with a different shape.
  if (typeof data.website === "string" && data.website.trim()) {
    return NextResponse.json({ ok: true, delivered: false }, { headers: cors });
  }

  if (data.type === "dockside-walkthrough") return walkthrough(data);
  if (data.type === "vendor-inquiry") return vendorInquiry(data);
  if (data.type === "buoy-waitlist") return buoyWaitlist(data, cors);
  if (data.type === "ticket-intent") return ticketIntent(data);

  console.log("[lead]", JSON.stringify(safeSummary(data)));
  return NextResponse.json({ ok: true, delivered: false }, { headers: cors });
}
