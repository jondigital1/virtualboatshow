/**
 * Central lead submission helper.
 *
 * Every form on the site funnels through submitLead(), which POSTs to
 * /api/leads. That route stores the lead first and sends any email second;
 * see app/api/leads/route.ts.
 */
/**
 * Only the types below are reachable from a form. "trade-in", "sell-boat",
 * "prequalify", "ticket-unlock", and "price-request" were removed with the
 * features that used them; leaving them here made the system look like it had
 * five silent forms when it had one. "ticket-intent" is the ticket funnel's
 * capture step (it grants no inventory access).
 *
 * After the show (Jon, 2026-09-15): "availability-request" is Check
 * Availability on boat pages and lineup cards, and "next-show-alert" is the
 * updates banner on the open lineup. "dockside-walkthrough" and
 * "inventory-access" (the show-day gate) are kept for the next show.
 */
export type LeadType =
  | "dockside-walkthrough"
  | "vendor-inquiry"
  | "ticket-intent"
  | "inventory-access"
  | "availability-request"
  | "next-show-alert";

export interface LeadPayload {
  type: LeadType;
  [key: string]: unknown;
}

/**
 * `delivered` and `toDealer` are passed through when the route reports them
 * (Check Availability does), so a form can say what actually happened to the
 * request instead of assuming the email reached the dealer.
 */
export async function submitLead(payload: LeadPayload): Promise<{ ok: boolean; delivered?: boolean; toDealer?: boolean }> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let body: { delivered?: unknown; toDealer?: unknown } = {};
    try { body = await res.json(); } catch { /* not JSON */ }
    return {
      ok: res.ok,
      delivered: typeof body.delivered === "boolean" ? body.delivered : undefined,
      toDealer: typeof body.toDealer === "boolean" ? body.toDealer : undefined,
    };
  } catch {
    return { ok: false };
  }
}
