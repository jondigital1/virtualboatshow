// Change the show's access-gate password.
//   node scripts/set-gate-password.mjs "your new password"
// Stores only the SHA-256 hash in components/ShowGate.tsx (never the plaintext).
// Existing guests will be asked again, since the stored key no longer matches.
// Passwords are case-insensitive: lowercased here and in the gate before hashing.
import fs from "fs";
import crypto from "crypto";

const pw = process.argv[2];
if (!pw) { console.error('usage: node scripts/set-gate-password.mjs "new password"'); process.exit(1); }

const hash = crypto.createHash("sha256").update(pw.trim().toLowerCase()).digest("hex");
const file = "components/ShowGate.tsx";
let src = fs.readFileSync(file, "utf8");
const re = /const PASSWORD_HASH = "[0-9a-f]{64}";/;
if (!re.test(src)) { console.error("could not find PASSWORD_HASH in " + file); process.exit(1); }
src = src.replace(re, `const PASSWORD_HASH = "${hash}";`);
fs.writeFileSync(file, src);

console.log(`gate password set to: ${pw.trim().toLowerCase()}`);
console.log(`hash written: ${hash}`);
console.log("\nnext: npm run build, then commit and push (Vercel deploys on push)");
