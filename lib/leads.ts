/**
 * Central lead submission helper.
 *
 * Every form on the site (Sell Your Boat, Vendor inquiry, ticket/unlock,
 * pre-qualify) funnels through submitLead(). Today it POSTs to the local
 * /api/leads route, which just logs and returns ok. When the CRM is chosen
 * (Apollo, HubSpot, etc.), wire it in ONE place: app/api/leads/route.ts.
 */
/**
 * Only the types below are reachable from a form. "trade-in", "sell-boat",
 * "prequalify", "ticket-unlock", and "price-request" were removed with the
 * features that used them; leaving them here made the system look like it had
 * five silent forms when it had one. "ticket-intent" is the ticket funnel's
 * capture step (it grants no inventory access). "inventory-access" is the
 * show-day gate form: from 9 AM on opening day, name and email open the
 * lineup, no code needed (Jon, 2026-09-07).
 */
export type LeadType = "dockside-walkthrough" | "vendor-inquiry" | "ticket-intent" | "inventory-access";

export interface LeadPayload {
  type: LeadType;
  [key: string]: unknown;
}

export async function submitLead(payload: LeadPayload): Promise<{ ok: boolean }> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
