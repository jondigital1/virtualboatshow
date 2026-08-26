/**
 * Campaign attribution, captured once per session.
 *
 * UTM parameters live on the landing URL and are gone by the time a shopper
 * reaches a boat page and opens the scheduler, so they are stashed on first
 * load and read back at submit. Session-scoped on purpose: this is attribution
 * for a single visit, not a durable identifier, so it expires with the tab and
 * nothing is written to a cookie or to localStorage.
 */

const KEY = "acvbs.attribution";

export type Attribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  /** Referrer of the FIRST page seen this session, not the current one. */
  landingReferrer?: string;
  /** Where the session started, path and query only. */
  landingPath?: string;
};

const FIELDS: [keyof Attribution, string][] = [
  ["utmSource", "utm_source"],
  ["utmMedium", "utm_medium"],
  ["utmCampaign", "utm_campaign"],
  ["utmTerm", "utm_term"],
  ["utmContent", "utm_content"],
];

/** Call once on mount. Safe to call repeatedly; only the first visit records. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const a: Attribution = {};
    for (const [key, param] of FIELDS) {
      const v = params.get(param);
      if (v) a[key] = v.slice(0, 200);
    }
    // Referrers from our own domain are navigation, not acquisition.
    const ref = document.referrer;
    if (ref && !ref.startsWith(window.location.origin)) a.landingReferrer = ref.slice(0, 500);
    a.landingPath = (window.location.pathname + window.location.search).slice(0, 500);
    sessionStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    // Private mode or storage disabled: attribution is best-effort, never fatal.
  }
}

export function readAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}") as Attribution;
  } catch {
    return {};
  }
}
