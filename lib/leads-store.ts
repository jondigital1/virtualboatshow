import { createHmac } from "node:crypto";

/**
 * Lead storage, server-side only.
 *
 * Talks to Supabase over PostgREST rather than pulling in the JS client: one
 * fetch, no dependency to keep current, nothing to bundle.
 *
 * Uses the SERVICE ROLE key, which bypasses RLS. That key must never reach the
 * browser — no NEXT_PUBLIC_ prefix, no client import of this module.
 *
 * Every write records the non-identifying dimensions. Contact details are
 * included ONLY when the shopper consented; a database constraint rejects the
 * row otherwise, so a mistake here fails loudly instead of quietly storing
 * details nobody agreed to give.
 */

const URL_BASE = process.env.SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const HASH_SECRET = process.env.LEAD_HASH_SECRET ?? "";

export const storeConfigured = () => Boolean(URL_BASE && KEY);

/**
 * One-way fingerprint of the email, so repeat submissions from one person can
 * be counted as one shopper without keeping the address. Returns null when no
 * secret is set rather than falling back to an unsalted hash, which would be
 * trivially reversible against a wordlist of common addresses.
 */
export function contactHash(email: string): string | null {
  if (!HASH_SECRET || !email) return null;
  return createHmac("sha256", HASH_SECRET).update(email.trim().toLowerCase()).digest("hex");
}

export type LeadRow = {
  type: string;
  source?: string | null;
  boat_slug?: string | null;
  boat_year?: number | null;
  boat_make?: string | null;
  boat_model?: string | null;
  dealer_name?: string | null;
  show_location?: string | null;
  show_day?: string | null;
  daypart?: string | null;
  page_url?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  contact_hash?: string | null;
  marketing_opt_in?: boolean;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

/** Returns the new row id, or null if storage is unconfigured or failed. */
export async function insertLead(row: LeadRow): Promise<string | null> {
  if (!storeConfigured()) return null;
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      console.log("[leads-store:insert-failed]", res.status, (await res.text()).slice(0, 300));
      return null;
    }
    const [created] = (await res.json()) as { id: string }[];
    return created?.id ?? null;
  } catch (e) {
    console.log("[leads-store:insert-error]", String(e).slice(0, 300));
    return null;
  }
}

export type Recipient = { first_name: string | null; email: string; contact_hash: string | null };

/**
 * Everyone the opening-day email goes to: ticket-funnel leads who ticked the
 * required box (which is what stored their email at all). Deduped by contact
 * fingerprint keeping the newest row, so a person who came through twice gets
 * one email. Returns null when the store is unreachable, which callers must
 * treat as "do not send", never as "nobody to send to".
 */
export async function listOpeningDayRecipients(): Promise<Recipient[] | null> {
  if (!storeConfigured()) return null;
  try {
    const res = await fetch(
      `${URL_BASE}/rest/v1/leads?type=eq.ticket-intent&marketing_opt_in=is.true&email=not.is.null&select=first_name,email,contact_hash&order=created_at.desc&limit=5000`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Recipient[];
    const seen = new Set<string>();
    const out: Recipient[] = [];
    for (const r of rows) {
      const k = r.contact_hash ?? r.email.trim().toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(r);
    }
    return out;
  } catch {
    return null;
  }
}

/**
 * All contact fingerprints recorded under a marker type ("unsubscribe",
 * "opening-day-sent"). Null on failure so callers fail safe: a send that
 * cannot load the unsubscribe list must not run.
 */
export async function listHashesByType(type: string): Promise<Set<string> | null> {
  if (!storeConfigured()) return null;
  try {
    const res = await fetch(
      `${URL_BASE}/rest/v1/leads?type=eq.${encodeURIComponent(type)}&select=contact_hash&limit=10000`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { contact_hash: string | null }[];
    return new Set(rows.map((r) => r.contact_hash).filter((h): h is string => Boolean(h)));
  } catch {
    return null;
  }
}

/** Appends a marker row (unsubscribe, opening-day-sent) carrying only the
 *  fingerprint: the consent constraint stays satisfied because no contact
 *  details are included. */
export async function recordMarker(type: string, contact_hash: string, source: string): Promise<boolean> {
  const id = await insertLead({ type, source, contact_hash, marketing_opt_in: false });
  return Boolean(id);
}

/** Records the outcome of the dealer notification against an existing row. */
export async function markDelivered(id: string, delivered: boolean, error?: string): Promise<void> {
  if (!storeConfigured() || !id) return;
  try {
    await fetch(`${URL_BASE}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ delivered, delivery_error: error?.slice(0, 500) ?? null }),
    });
  } catch {
    // The lead is already stored and already sent; a failed status update is
    // not worth failing the request over.
  }
}
