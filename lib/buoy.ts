/**
 * Buoy live-inventory data layer for the VBS Next.js site.
 * Typed port of docs/vbs-vercel-kit/lib/buoy.js (tested against the live API).
 *
 * Rules that matter (per the show data contract):
 *   - Fetch CLIENT-SIDE only. Never per-request SSR: Vercel's shared egress
 *     IPs will trip the API's per-IP rate limiter. All consuming pages are
 *     already "use client".
 *   - Savings/MSRP come from the server. Never compute your own.
 *   - A missing field means "do not render that element", never "" or 0
 *     rendered as content. Sections with no matching boats collapse entirely.
 *
 * API base: same-origin via the vercel.json rewrite (/buoy-api/* ->
 * api.buoylist.com/*). Override with NEXT_PUBLIC_BUOY_API_BASE for local dev
 * outside Vercel (CORS allows the production show domains, not localhost).
 */

const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BUOY_API_BASE) ||
  "/buoy-api";

/* ── Types ──────────────────────────────────────────────────────────────── */

/** Raw listing as returned by the public marketplace API. Loosely typed:
 *  every field can be absent depending on what the seller filled in. */
export type Listing = {
  id: string;
  title?: string | null;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  vesselType?: string | null;
  vesselClass?: string | null;
  category?: string | null;
  condition?: string | null;
  lengthFt?: number | string | null;
  beamFt?: number | string | null;
  draftFt?: number | string | null;
  engine?: string | null;
  engineMake?: string | null;
  engineModel?: string | null;
  engineCount?: number | null;
  engineHp?: number | null;
  engineHours?: number | null;
  hours?: number | null;
  hullMaterial?: string | null;
  place?: string | null;
  zip?: string | null;
  photoCount?: number | null;
  photos?: { url: string }[] | null;
  coverPhotoUrl?: string | null;
  askingPriceCents?: number | null;
  msrpCents?: number | null;
  savingsCents?: number | null;
  priceOnRequest?: boolean | null;
  sellerName?: string | null;
  listedDaysAgo?: number | null;
  featured?: boolean | null;
  description?: string | null;
} & Record<string, unknown>;

export type ListingsParams = {
  sort?: "newest" | "price" | "price_desc";
  /** Max 100. */
  limit?: number;
  vesselType?: "power" | "sail" | "pwc" | "unpowered" | string;
  /** Pipe = OR, e.g. "center-console|dual-console". */
  vesselClass?: string;
  maxPriceCents?: number;
  condition?: "new" | "used" | string;
  /** Keyword search. */
  q?: string;
  /** From a previous page's nextCursor. */
  cursor?: string;
};

export type ListingsResponse = { listings: Listing[]; nextCursor?: string | null };

export type Facets = {
  total?: number;
  vesselTypes?: Record<string, number>;
  vesselClasses?: Record<string, number>;
  budgetBands?: Record<string, number>;
  activities?: Record<string, number>;
} & Record<string, unknown>;

/** The site-wide vessel view-model. Adapted from a live listing by toV().
 *  Numeric fields are 0 and strings "" when the server did not provide the
 *  value - callers hide those elements rather than rendering zeros. */
export type V = {
  /** id8: first 8 hex of the listing UUID. Detail route: /inventory/[id8]. */
  id: string;
  year: number;
  make: string;
  model: string;
  /** Raw listing title (fallback display name). */
  title: string;
  /** Humanized class label, e.g. "Center Console". */
  klass: string;
  len: number;
  /** e.g. "45'" or "45.5'"; "" when length unknown. */
  lenLabel: string;
  /** Title-cased, e.g. "New" / "Used"; "" when absent. */
  condition: string;
  hours: number;
  /** Seller location (l.place). LIVE data has no physical dock - anywhere
   *  the old "Dock" facet rendered, relabel it "Location". */
  dock: string;
  dealer: string;
  /** Dollars; 0 = no MSRP -> hide struck MSRP + SAVE. Server-derived only. */
  msrp: number;
  /** Dollars; 0 when priceOnRequest. */
  price: number;
  /** Server-computed savings in dollars; 0 = hide SAVE. */
  save: number;
  /** Price on request: render "Price on request" instead of a price. */
  por: boolean;
  photos: number;
  photoUrl: string | null;
  featured: boolean;
  engine: string;
  /** Canonical UTM-tagged deep link to the live Buoy listing. */
  buoyHref: string;
  /* Detail page extras */
  description: string;
  beam: number;
  draft: number;
};

/* ── Fetchers (client-side) ─────────────────────────────────────────────── */

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(API_BASE + path, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Buoy API ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

/** Browse listings. Returns { listings, nextCursor }. */
export function fetchListings(params: ListingsParams = {}): Promise<ListingsResponse> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const s = qs.toString();
  return getJSON<ListingsResponse>(`/public/marketplace${s ? `?${s}` : ""}`);
}

/** One listing by id8 (first 8 hex of its UUID). Throws on 404. */
export function fetchListing(id8: string): Promise<{ listing: Listing }> {
  return getJSON<{ listing: Listing }>(`/public/marketplace/${id8}`);
}

/** Live facets: { total, vesselTypes, vesselClasses, budgetBands, ... } */
export function fetchFacets(): Promise<Facets> {
  return getJSON<Facets>(`/marketplace/facets`);
}

/* ── Display semantics (ported 1:1 from the kit) ────────────────────────── */

export const fmtInt = (n: number): string => Number(n).toLocaleString("en-US");

/** 47000000 cents -> "$470,000" */
export const money = (cents: number): string => "$" + fmtInt(Math.round(cents / 100));

const titleCase = (s: string): string => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
const humanize = (slug: string): string =>
  titleCase(String(slug).replace(/[-_]+/g, " ").trim());

const CLASS_LABELS: Record<string, string> = {
  pwc: "Personal Watercraft (PWC)",
  "jet-ski": "Personal Watercraft (PWC)",
};
const TYPE_LABELS: Record<string, string> = {
  power: "Powerboat",
  sail: "Sailboat",
  pwc: "Personal Watercraft (PWC)",
};

export function typeLabel(l: Listing): string | null {
  if (l.vesselClass) return CLASS_LABELS[l.vesselClass] || humanize(l.vesselClass);
  if (l.vesselType) return TYPE_LABELS[l.vesselType] || humanize(l.vesselType);
  if (l.category) return humanize(l.category);
  return null;
}

/** "2 x Mercury 300 hp", falling back to the legacy free-text engine string. */
export function engineLabel(l: Listing): string | null {
  const parts: string[] = [];
  if (l.engineCount && l.engineCount > 1) parts.push(l.engineCount + " x");
  if (l.engineMake) parts.push(l.engineMake);
  else if (l.engineModel) parts.push(l.engineModel);
  if (l.engineHp) parts.push(fmtInt(l.engineHp) + " hp");
  if (parts.length) return parts.join(" ");
  return l.engine || null;
}

export function daysAgoLabel(d: number | null | undefined): string | null {
  if (d == null) return null;
  if (d <= 0) return "Listed today";
  if (d === 1) return "Listed 1 day ago";
  return `Listed ${fmtInt(d)} days ago`;
}

/** 45 -> "45 ft"; null when unknown. */
export function feet(n: number | string | null | undefined): string | null {
  if (n == null) return null;
  const v = Number(n);
  if (!isFinite(v) || v <= 0) return null;
  return (v % 1 === 0 ? String(v) : v.toFixed(1)) + " ft";
}

/** 45 -> "45'", 45.5 -> "45.5'"; "" when unknown. Card-style length label. */
export function feetLabel(n: number | string | null | undefined): string {
  if (n == null) return "";
  const v = Number(n);
  if (!isFinite(v) || v <= 0) return "";
  return (v % 1 === 0 ? String(v) : v.toFixed(1)) + "'";
}

export const id8 = (l: Listing): string =>
  String(l.id).replace(/-/g, "").slice(0, 8).toLowerCase();

function slugifyTitle(t: string | null | undefined): string {
  return (
    String(t || "listing")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/g, "") || "listing"
  );
}

function locSegment(l: Listing): string {
  if (l.zip && /^\d{5}$/.test(l.zip)) return l.zip;
  const last = l.place ? (l.place.split(",").pop() || "").trim() : "";
  return /^[A-Za-z]{2}$/.test(last) ? last.toLowerCase() : "us";
}

/** Canonical deep link to the live Buoy listing (only the id8 tail is
 *  load-bearing; the server 301s the rest to canonical). UTM-tagged. */
export function buoyListingUrl(l: Listing): string {
  const cat = l.category || "powerboat";
  return `https://buoylist.com/marketplace/${cat}/${locSegment(l)}/${slugifyTitle(l.title)}-${id8(l)}?utm_source=acvbs&utm_medium=referral`;
}

/* ── Adapter: live listing -> the site's V view-model ───────────────────── */

const num = (x: number | string | null | undefined): number => {
  const v = Number(x);
  return isFinite(v) && v > 0 ? v : 0;
};

/** Display name from the raw title when make/model are absent (public browse
 *  rows omit them): drop the "| 45ft" style suffix and the leading year so
 *  pages that render "{year} {make} {model}" never double the year. */
function nameFromTitle(l: Listing): string {
  let t = (l.title ?? "").trim().replace(/\s*\|.*$/, "");
  if (l.year && t.startsWith(String(l.year))) t = t.slice(String(l.year).length).trim();
  return t;
}

export function toV(l: Listing): V {
  return {
    id: id8(l),
    year: l.year ?? 0,
    make: l.make ?? "",
    model: l.model ?? nameFromTitle(l),
    title: l.title ?? "",
    klass: typeLabel(l) ?? "",
    len: num(l.lengthFt),
    lenLabel: feetLabel(l.lengthFt),
    condition: l.condition ? titleCase(String(l.condition)) : "",
    hours: l.engineHours ?? l.hours ?? 0,
    dock: l.place ?? "",
    dealer: l.sellerName ?? "Private seller",
    msrp: l.msrpCents ? Math.round(l.msrpCents / 100) : 0,
    price: l.priceOnRequest ? 0 : Math.round((l.askingPriceCents ?? 0) / 100),
    save: l.savingsCents && l.savingsCents > 0 ? Math.round(l.savingsCents / 100) : 0,
    por: !!l.priceOnRequest,
    photos: l.photoCount ?? 0,
    photoUrl: (l.photos && l.photos[0]?.url) || l.coverPhotoUrl || null,
    featured: !!l.featured,
    engine: engineLabel(l) ?? "",
    buoyHref: buoyListingUrl(l),
    description: l.description ?? "",
    beam: num(l.beamFt),
    draft: num(l.draftFt),
  };
}
