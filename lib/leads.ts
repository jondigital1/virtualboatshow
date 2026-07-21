/**
 * Central lead submission helper.
 *
 * Every form on the site (Sell Your Boat, Vendor inquiry, ticket/unlock,
 * pre-qualify) funnels through submitLead(). Today it POSTs to the local
 * /api/leads route, which just logs and returns ok. When the CRM is chosen
 * (Apollo, HubSpot, etc.), wire it in ONE place: app/api/leads/route.ts.
 */
export type LeadType = "trade-in" | "sell-boat" | "vendor-inquiry" | "prequalify" | "ticket-unlock";

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
