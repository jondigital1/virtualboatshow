import { NextResponse } from "next/server";

/**
 * Lead intake endpoint.
 *
 * TODO (forms step): forward `data` to the chosen CRM.
 *   - Apollo.io: the MCP/Apollo API is available to this workspace.
 *   - HubSpot: POST to the Forms API or create a contact.
 * For now we log server-side and acknowledge, so the front-end flow works
 * end-to-end without a destination wired yet.
 */
export async function POST(req: Request) {
  let data: unknown = null;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  // Replace this log with the CRM call once chosen.
  console.log("[lead]", JSON.stringify(data));

  return NextResponse.json({ ok: true });
}
