/**
 * Shared constants for the inventory gate, in a lib so the gate screen, the
 * ticket funnel, the iframe modal, and the API routes agree without importing
 * each other's components.
 */

export const GATE_STORAGE_KEY = "ac-show-access-2026";

// SHA-256 of the internal access code (staff and show use only, never
// distributed to shoppers). Changed via scripts/set-gate-password.mjs.
export const GATE_PASSWORD_HASH = "ef48cbbb34d2e019141accae5972292b7de037898c7c282ede77614badee82f3";

// The marker written to GATE_STORAGE_KEY when a visitor registers at the
// show-day gate (name and email, from 9 AM on opening day). Not a secret and
// not a hash: it only says "this device already registered", so the person
// is not asked twice. The code path still writes GATE_PASSWORD_HASH.
export const GATE_REGISTERED_MARK = "registered-2026";

export const TICKETS_URL = "https://secure.interactiveticketing.com/1.43/1f654c/#/select";

// The moment the show-day gate takes over. Before it, the only key is the
// internal code. From it, the passcode is gone: the gate asks for first name,
// last name and email and drops the visitor onto the inventory (Jon,
// 2026-09-07, replacing the earlier 10 AM lift). The opening-day email cron
// in vercel.json fires at the same moment; change both together.
export const SHOW_OPENS = Date.parse("2026-09-10T09:00:00-04:00");
export const SHOW_OPENS_LABEL = "9 AM on September 10";
