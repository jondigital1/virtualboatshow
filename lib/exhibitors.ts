/**
 * Marine Marketplace exhibitor directory: presenting dealers + vendors.
 * Single source shared by /vendors and the homepage exhibitor tiles.
 * Booth numbers, categories, and logos arrive from show staff later,
 * so fields stay minimal until then (see design-specs/rebrand/GISELLE-LIST).
 *
 * Reconciled 2026-08-25 against Giselle's "2026 Show Directory Listings
 * Alphabetized.docx" (Drive), which supplied the MarineMax and Intricate
 * Marine phone numbers and 15 previously absent exhibitors. Both lists are
 * kept alphabetical.
 *
 * Reconciled again 2026-09-06 against her final 2026 Directory. Show staff
 * struck 21 entries that had been carried over from the original seed and
 * were never confirmed for 2026: two dealers (Causeway Marine, Henriques
 * Yachts) and nineteen vendors. Her instruction is that the final Directory
 * is definitive: a company not on it is not a 2026 exhibitor. EZ Dock Mid
 * Atlantic, EZ Docks - Docks Unlimited and New York Life were on her earlier
 * unconfirmed list and were NOT struck, so they stay.
 */
export type Row = { n: string; c: string; s: string; p: string };

export const DEALERS: Row[] = [
  { n: "Clarks Landing Yacht Sales & Marina", c: "Point Pleasant", s: "NJ", p: "(732) 899-5559" },
  { n: "Coastal Boat Sales", c: "Brick", s: "NJ", p: "(732) 458-3540" },
  { n: "Comstock Yacht Sales & Marina", c: "Brick", s: "NJ", p: "(732) 899-2500" },
  { n: "Comstock Yacht Sales & Marina", c: "Sea Bright", s: "NJ", p: "(732) 704-3727" },
  { n: "Coty Marine", c: "Toms River", s: "NJ", p: "(732) 288-1000" },
  { n: "D & R Boat World", c: "Green Brook", s: "NJ", p: "(732) 968-2600" },
  { n: "D & R Boat World", c: "Toms River", s: "NJ", p: "(732) 840-2020" },
  { n: "EZ Dock Mid Atlantic", c: "Belford", s: "NJ", p: "(609) 624-0040" },
  { n: "Formula Boats", c: "Decatur", s: "IN", p: "(260) 724-9111" },
  { n: "G Winter's Sailing Center, Inc.", c: "Riverside", s: "NJ", p: "(856) 461-3555" },
  { n: "Irwin Marine Center", c: "Red Bank", s: "NJ", p: "(732) 741-0003" },
  { n: "MarineMax (Brick)", c: "Brick", s: "NJ", p: "(732) 451-3995" },
  { n: "MarineMax (Ocean View)", c: "Ocean View", s: "NJ", p: "(732) 451-3995" },
  { n: "MarineMax (Somers Point)", c: "Somers Point", s: "NJ", p: "(732) 451-3995" },
  { n: "New Jersey Outboards", c: "Bayville", s: "NJ", p: "(732) 505-3002" },
  { n: "Riptide Marine Center", c: "Bayville", s: "NJ", p: "(732) 228-7202" },
  { n: "Riverside Marina & Yacht Sales", c: "Riverside", s: "NJ", p: "(856) 461-1077" },
  { n: "Sandy Hook Yacht Sales", c: "Sea Bright", s: "NJ", p: "(732) 530-5500" },
  { n: "Schrader Yacht Sales", c: "Point Pleasant", s: "NJ", p: "(732) 899-8010" },
  { n: "Seaport Inlet Marina", c: "Belmar", s: "NJ", p: "(732) 681-3303" },
  { n: "Sheltered Cove Marina", c: "Tuckerton", s: "NJ", p: "(609) 296-9400" },
  { n: "South Jersey Yacht Sales", c: "Cape May", s: "NJ", p: "(609) 884-1600" },
  { n: "Stone Harbor Marina", c: "Stone Harbor", s: "NJ", p: "(609) 368-1141" },
  { n: "Valhalla Boat Sales", c: "New Gretna", s: "NJ", p: "(609) 296-2388" },
];

export const VENDORS: Row[] = [
  { n: "Bajio Sunglasses", c: "New Smyrna Beach", s: "FL", p: "(907) 403-4187" },
  { n: "Captain Jack's Boating School", c: "South Bound Brook", s: "NJ", p: "(908) 285-4039" },
  { n: "Cast Off Yacht Sales", c: "Toms River", s: "NJ", p: "(732) 684-0710" },
  { n: "Escapes Marketing LLC", c: "Myrtle Beach", s: "SC", p: "(954) 292-4661" },
  { n: "EZ Docks - Docks Unlimited Marine Construction", c: "Belford", s: "NJ", p: "(732) 787-3088" },
  { n: "Fish Skinz", c: "Titusville", s: "FL", p: "(321) 652-1692" },
  { n: "Freedom Boat Club", c: "Lewes", s: "DE", p: "(941) 525-6455" },
  { n: "Fuel King Mobile", c: "Haddonfield", s: "NJ", p: "(908) 347-4667" },
  { n: "Gioia Sails", c: "Lakewood", s: "NJ", p: "(732) 901-6770" },
  { n: "Golden Nugget - Farley State Marina", c: "Atlantic City", s: "NJ", p: "(609) 441-8482" },
  { n: "Harbor Outfitters", c: "Seaville", s: "NJ", p: "(609) 478-3451" },
  { n: "Intricate Marine Services", c: "Galloway", s: "NJ", p: "(609) 742-2012" },
  { n: "Jersey Cape Yacht Sales", c: "Lower Bank", s: "NJ", p: "(609) 965-8650" },
  { n: "JJ Boatworks", c: "Tuckerton", s: "NJ", p: "(609) 344-0749" },
  { n: "Leaf Guard", c: "Pennsauken", s: "NJ", p: "(856) 600-7908" },
  { n: "Motorcycle Mall of Monmouth", c: "Middletown", s: "NJ", p: "(732) 615-0900" },
  { n: "Mr. Shrinkwrap of South Jersey", c: "Haddon Heights", s: "NJ", p: "(856) 858-6610" },
  { n: "New York Life", c: "Wayne", s: "PA", p: "(267) 995-4560" },
  { n: "Paradise Grills", c: "Ocoee", s: "FL", p: "(800) 604-2023" },
  { n: "Performance Marine Solutions LLC", c: "Waretown", s: "NJ", p: "(609) 815-0336" },
  { n: "PM Winter Boat Covers", c: "Cherry Hill", s: "NJ", p: "(856) 857-7475" },
  { n: "Salty Dog Publications", c: "Brick", s: "NJ", p: "(732) 714-8400" },
  { n: "Sea Tow Atlantic City", c: "Brigantine", s: "NJ", p: "(609) 266-1984" },
  { n: "SeaDek", c: "Leola", s: "PA", p: "(484) 645-4203" },
  { n: "Shore Agency", c: "Absecon", s: "NJ", p: "(609) 641-0625" },
  { n: "SML Footwear", c: "Millersville", s: "MD", p: "(443) 685-3779" },
  { n: "Snap Dock", c: "Seaville", s: "NJ", p: "(609) 478-3451" },
  { n: "Softub By Innovative Spas", c: "Seaville", s: "NJ", p: "(609) 478-3451" },
  { n: "Suntex Marinas LLC", c: "Dallas", s: "TX", p: "(732) 551-5485" },
  { n: "Tano Mechanical LLC", c: "Brick Township", s: "NJ", p: "(732) 948-1332" },
  { n: "Tees By BO", c: "Miami", s: "FL", p: "(305) 970-7385" },
  { n: "Total Marine", c: "Little Egg Harbor", s: "NJ", p: "(609) 294-0480" },
];

/**
 * Dealer logos harvested from each dealer's own website (public/dealers/,
 * via scripts/fetch-dealer-logos.mjs). White/light originals carry a baked
 * navy backing so they read on white cards. Riverside Marina has no website
 * to harvest from — their card falls back to the monogram.
 */
export const DEALER_LOGOS: Record<string, string> = {
  "Clarks Landing Yacht Sales & Marina": "/dealers/clarks-landing.png",
  "Coastal Boat Sales": "/dealers/coastal-boat-sales.png",
  "Comstock Yacht Sales & Marina": "/dealers/comstock.png",
  "Coty Marine": "/dealers/coty-marine.png",
  "D & R Boat World": "/dealers/dr-boat-world.png",
  "EZ Dock Mid Atlantic": "/dealers/ez-dock.png",
  "Formula Boats": "/dealers/formula-boats.png",
  "G Winter's Sailing Center, Inc.": "/dealers/g-winters.png",
  "Irwin Marine Center": "/dealers/irwin-marine-center.png",
  "MarineMax (Brick)": "/dealers/marinemax.png",
  "MarineMax (Somers Point)": "/dealers/marinemax.png",
  "MarineMax (Ocean View)": "/dealers/marinemax.png",
  "New Jersey Outboards": "/dealers/nj-outboards.png",
  "Sandy Hook Yacht Sales": "/dealers/sandy-hook.png",
  "Schrader Yacht Sales": "/dealers/schrader.png",
  "Seaport Inlet Marina": "/dealers/seaport-inlet.png",
  "Sheltered Cove Marina": "/dealers/sheltered-cove.png",
  "Stone Harbor Marina": "/dealers/stone-harbor.png",
  "South Jersey Yacht Sales": "/dealers/south-jersey.png",
  "Valhalla Boat Sales": "/dealers/valhalla.png",
};

/** "Marks Marine Insurance" -> "MM" (monogram for logo-less tiles). */
export function initials(name: string): string {
  const words = name.replace(/\([^)]*\)/g, " ").replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter((w) => w && !["llc", "inc"].includes(w.toLowerCase()));
  if (!words.length) return "?";
  return ((words[0][0] || "") + (words[1] ? words[1][0] : words[0][1] || "")).toUpperCase();
}

/** Random pick of n distinct vendors — client-side, reshuffles per load. */
export function pickExhibitors(n = 4): Row[] {
  const pool = [...VENDORS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

/**
 * Boat records credit MarineMax as one dealer; the exhibitor directory lists
 * their three locations separately, so DEALER_LOGOS has no plain "MarineMax"
 * key. Alias rather than fuzzy-match, so an unknown dealer falls back to the
 * monogram instead of borrowing someone else's logo.
 */
const LOGO_ALIASES: Record<string, string> = {
  MarineMax: "MarineMax (Brick)",
};

export function logoFor(dealer: string): string | undefined {
  return DEALER_LOGOS[dealer] ?? DEALER_LOGOS[LOGO_ALIASES[dealer] ?? ""];
}
