// Import ticket purchaser emails as inventory gate keys.
//   node scripts/import-ticket-keys.mjs emails.csv [https://www.acvirtualboatshow.com]
//
// For the purchaser export the show pulls from Interactive Ticketing. The show
// does not control the ticketing platform, so buyers who never touched our
// funnel (bought via a link on Facebook, the official site, and so on) are
// invisible to us until their emails arrive in an export. This script turns
// each of those emails into a gate key exactly as if the person had come
// through the on-site funnel.
//
// It posts to /api/leads so hashing happens server-side with the deployed
// secret; nothing sensitive needs to exist on this machine. Buying a ticket
// implies no marketing consent, so these rows carry the hash only and the
// address itself is never stored.
import fs from "fs";

const file = process.argv[2];
const base = (process.argv[3] ?? "https://www.acvirtualboatshow.com").replace(/\/$/, "");
if (!file) { console.error("usage: node scripts/import-ticket-keys.mjs emails.csv [site url]"); process.exit(1); }

const text = fs.readFileSync(file, "utf8");
const emails = [...new Set((text.match(/[^@\s,;"']+@[^@\s,;"']+\.[^@\s,;"']+/g) ?? []).map((e) => e.toLowerCase()))];
if (!emails.length) { console.error("no emails found in " + file); process.exit(1); }
console.log(`importing ${emails.length} unique emails as gate keys via ${base}`);

let ok = 0, failed = 0;
for (const email of emails) {
  try {
    const res = await fetch(`${base}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "ticket-intent", email, source: "ticket-import" }),
    });
    if (res.ok) ok++; else { failed++; console.error("failed:", email.replace(/^(..).*(@.*)$/, "$1***$2"), res.status); }
  } catch (e) {
    failed++; console.error("error:", String(e).slice(0, 120));
  }
  await new Promise((r) => setTimeout(r, 150));
}
console.log(`done: ${ok} imported, ${failed} failed`);
