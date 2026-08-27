/**
 * Shared constants for the inventory gate, in a lib so the gate screen, the
 * ticket funnel, the iframe modal, and the API routes agree without importing
 * each other's components.
 */

export const GATE_STORAGE_KEY = "ac-show-access-2026";

// SHA-256 of the internal access code (staff and show use only, never
// distributed to shoppers). Changed via scripts/set-gate-password.mjs.
export const GATE_PASSWORD_HASH = "ef48cbbb34d2e019141accae5972292b7de037898c7c282ede77614badee82f3";

export const TICKETS_URL = "https://secure.interactiveticketing.com/1.43/1f654c/#/select";

// Virtual inventory access opens to the public at 10 AM Eastern on opening
// day, per the show owners. Change only this constant if that ever moves.
export const SHOW_OPENS = Date.parse("2026-09-10T10:00:00-04:00");
