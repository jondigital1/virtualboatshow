import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { listAllLeads, listHashesByType } from "@/lib/leads-store";

/**
 * The registration data as a CSV, for review and for the show's own copy.
 *
 * Bearer-authed with CRON_SECRET, the same secret and check as the
 * opening-day send, because this returns personal data and must never be
 * reachable by URL alone. It is pulled from a terminal with the secret and
 * the result goes into a Google Sheet Jon shares with show staff; nothing
 * about this endpoint is linked from the site.
 *
 * Marker rows (unsubscribe, opening-day-sent) are folded in as columns
 * rather than listed: every person's row says whether they have
 * unsubscribed, so a list handed to the show already honours the policy's
 * promise that one unsubscribe stops both parties. Phone is never present;
 * the API stopped storing it on 2026-09-08.
 *
 *   GET /api/leads-export            CSV, newest first
 *   GET /api/leads-export?format=json
 */

const COLUMNS = [
  "created_at", "type", "source", "first_name", "last_name", "email", "unsubscribed",
  "boat_year", "boat_make", "boat_model", "boat_slug", "dealer_name", "show_location", "show_day", "daypart",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "referrer", "page_url", "delivered",
] as const;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET ?? "";
  if (!secret) return false;
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

const csvCell = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  const s = typeof v === "boolean" ? (v ? "yes" : "no") : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const [rows, unsubscribed] = await Promise.all([listAllLeads(), listHashesByType("unsubscribe")]);
  if (!rows || !unsubscribed) return NextResponse.json({ ok: false, error: "store unavailable" }, { status: 503 });

  const people = rows
    .filter((r) => r.type !== "unsubscribe" && r.type !== "opening-day-sent")
    .map((r) => ({ ...r, unsubscribed: Boolean(r.contact_hash && unsubscribed.has(r.contact_hash)) }));

  const url = new URL(req.url);
  if (url.searchParams.get("format") === "json") {
    return NextResponse.json({ ok: true, count: people.length, rows: people });
  }
  const lines = [COLUMNS.join(",")];
  for (const p of people) lines.push(COLUMNS.map((c) => csvCell((p as Record<string, unknown>)[c])).join(","));
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(lines.join("\r\n") + "\r\n", {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vbs-registrations-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
