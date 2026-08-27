import { NextResponse } from "next/server";
import { contactHash, hasTicketKey } from "@/lib/leads-store";

/**
 * Inventory gate check for email keys.
 *
 * A shopper who came through the ticket funnel (or whose email arrived in a
 * purchaser import) can unlock the inventory on any device by entering the
 * same email at the gate. The email is hashed with the same server secret
 * used at capture and looked up by hash; only yes or no comes back, never a
 * stored row.
 *
 * This is knowingly an existence oracle for funnel emails. The stakes are a
 * boat lineup that opens to everyone at 10 AM on September 10 anyway, so the
 * tradeoff is accepted here. Do not copy this pattern anywhere the answer
 * matters.
 */
export async function POST(req: Request) {
  let email = "";
  try {
    const d = (await req.json()) as Record<string, unknown>;
    email = String(d.email ?? "").trim().slice(0, 200);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ ok: false });
  const hash = contactHash(email);
  if (!hash) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: await hasTicketKey(hash) });
}
