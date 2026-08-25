/**
 * Marine Marketplace exhibitor directory: presenting dealers + vendors.
 * Single source shared by /vendors and the homepage exhibitor tiles.
 * Booth numbers, categories, and logos arrive from show staff later —
 * fields stay minimal until then (see design-specs/rebrand/GISELLE-LIST).
 */
export type Row = { n: string; c: string; s: string; p: string };

export const DEALERS: Row[] = [
  { n: "Causeway Marine", c: "Manahawkin", s: "NJ", p: "(609) 597-3488" },
  { n: "Clarks Landing Yacht Sales & Marina", c: "Point Pleasant", s: "NJ", p: "(732) 899-5559" },
  { n: "Coastal Boat Sales", c: "Brick", s: "NJ", p: "(732) 458-3540" },
  { n: "Comstock Yacht Sales & Marina", c: "Brick", s: "NJ", p: "(732) 899-2500" },
  { n: "Comstock Yacht Sales & Marina", c: "Sea Bright", s: "NJ", p: "(732) 704-3727" },
  { n: "Coty Marine", c: "Toms River", s: "NJ", p: "(732) 288-1000" },
  { n: "D & R Boat World", c: "Toms River", s: "NJ", p: "(732) 840-2020" },
  { n: "D & R Boat World", c: "Green Brook", s: "NJ", p: "(732) 968-2600" },
  { n: "EZ Dock Mid Atlantic", c: "Belford", s: "NJ", p: "(609) 624-0040" },
  { n: "Formula Boats", c: "Decatur", s: "IN", p: "(260) 724-9111" },
  { n: "G Winter's Sailing Center, Inc.", c: "Riverside", s: "NJ", p: "(856) 461-3555" },
  { n: "Henriques Yachts", c: "Bayville", s: "NJ", p: "(732) 269-1180" },
  { n: "MarineMax (Brick)", c: "Brick", s: "NJ", p: "" },
  { n: "MarineMax (Somers Point)", c: "Somers Point", s: "NJ", p: "" },
  { n: "MarineMax (Ocean View)", c: "Ocean View", s: "NJ", p: "" },
  { n: "New Jersey Outboards", c: "Bayville", s: "NJ", p: "(732) 505-3002" },
  { n: "Riverside Marina & Yacht Sales", c: "Riverside", s: "NJ", p: "(856) 461-1077" },
  { n: "Sandy Hook Yacht Sales", c: "Sea Bright", s: "NJ", p: "(732) 530-5500" },
  { n: "Schrader Yacht Sales", c: "Point Pleasant", s: "NJ", p: "(732) 899-8010" },
  { n: "Seaport Inlet Marina", c: "Belmar", s: "NJ", p: "(732) 681-3303" },
  { n: "Sheltered Cove Marina", c: "Tuckerton", s: "NJ", p: "(609) 296-9400" },
  { n: "Stone Harbor Marina", c: "Stone Harbor", s: "NJ", p: "(609) 368-1141" },
  { n: "South Jersey Yacht Sales", c: "Cape May", s: "NJ", p: "(609) 884-1600" },
  { n: "Valhalla Boat Sales", c: "New Gretna", s: "NJ", p: "(609) 296-2388" },
];

export const VENDORS: Row[] = [
  { n: "All Seasons Marina", c: "Marmora", s: "NJ", p: "(609) 390-1850" },
  { n: "Boatique USA", c: "Chester", s: "CT", p: "(860) 227-4291" },
  { n: "Bulldog Canvas Company, LLC", c: "Warminster", s: "PA", p: "(215) 792-2211" },
  { n: "Cast Off Yacht Sales", c: "Toms River", s: "NJ", p: "(609) 389-6324" },
  { n: "EZ Docks - Docks Unlimited Marine Construction", c: "Belford", s: "NJ", p: "(732) 787-3088" },
  { n: "Freedom Boat Club of Delaware", c: "Lewes", s: "DE", p: "(301) 943-9249" },
  { n: "Fish Skinz", c: "Titusville", s: "FL", p: "(321) 652-1692" },
  { n: "Flying Point on the Shore", c: "Atlantic City", s: "NJ", p: "(516) 524-4475" },
  { n: "Further Customs", c: "Laguna Niguel", s: "CA", p: "(888) 803-8784" },
  { n: "Garage Living", c: "Morganville", s: "NJ", p: "N/A" },
  { n: "Gioia Sails", c: "Lakewood", s: "NJ", p: "(732) 901-6770" },
  { n: "Golden Nugget - Farley State Marina", c: "Atlantic City", s: "NJ", p: "(609) 441-8482" },
  { n: "Harbor Outfitters", c: "Seaville", s: "NJ", p: "(609) 478-3451" },
  { n: "Intercoastal Financial Group", c: "Longport", s: "NJ", p: "(732) 245-9783" },
  { n: "Intricate Marine Services", c: "Galloway", s: "NJ", p: "N/A" },
  { n: "Jersey Cape Yacht Sales", c: "Lower Bank", s: "NJ", p: "(609) 965-8650" },
  { n: "JJ Boatworks", c: "Atlantic City", s: "NJ", p: "(609) 344-0749" },
  { n: "Leaf Guard", c: "Pennsauken", s: "NJ", p: "(856) 600-7908" },
  { n: "Lil Pee Wee's Water Ice", c: "Marlton", s: "NJ", p: "(856) 359-0438" },
  { n: "Marks Marine Insurance", c: "Deptford", s: "NJ", p: "(856) 384-8744" },
  { n: "Monmouth Marine Engines", c: "Brielle", s: "NJ", p: "(732) 528-9290" },
  { n: "Mr. Shrinkwrap of South Jersey", c: "Haddonfield", s: "NJ", p: "(856) 858-6610" },
  { n: "New York Life", c: "Wayne", s: "PA", p: "(267) 995-4560" },
  { n: "Next Level Marine Custom", c: "Somers Point", s: "NJ", p: "(609) 670-5205" },
  { n: "National Marine Manufacturers Association", c: "Chicago", s: "IL", p: "(312) 946-6200" },
  { n: "NRG Home", c: "Philadelphia", s: "PA", p: "(267) 521-8958" },
  { n: "PM Winter Boat Covers", c: "Cherry Hill", s: "NJ", p: "(856) 857-7475" },
  { n: "Salty Dog Publications", c: "Brick", s: "NJ", p: "(732) 714-8400" },
  { n: "Sandy Hook Boat Club", c: "N/A", s: "N/A", p: "(732) 977-6264" },
  { n: "Sea Tow Atlantic City", c: "Brigantine", s: "NJ", p: "(609) 266-1984" },
  { n: "Snap Dock", c: "Seaville", s: "NJ", p: "(609) 478-3451" },
  { n: "Softub By Innovative Spas", c: "Seaville", s: "NJ", p: "(609) 478-3451" },
  { n: "Soldier Solutions", c: "Wallingford", s: "CT", p: "(203) 265-9119" },
  { n: "TC Coatings LLC", c: "Blackwood", s: "NJ", p: "(856) 212-1250 ext. 115" },
  { n: "Tees By BO", c: "Miami", s: "FL", p: "(305) 970-7385" },
  { n: "Total Marine", c: "Little Egg Harbor", s: "NJ", p: "(609) 294-0480" },
  { n: "Tuckerton Marine", c: "Tuckerton", s: "NJ", p: "(609) 344-0749" },
  { n: "Viking Eyewear", c: "Oceanport", s: "NJ", p: "(732) 272-3524" },
];

/**
 * Dealer logos harvested from each dealer's own website (public/dealers/,
 * via scripts/fetch-dealer-logos.mjs). White/light originals carry a baked
 * navy backing so they read on white cards. Riverside Marina has no website
 * to harvest from — their card falls back to the monogram.
 */
export const DEALER_LOGOS: Record<string, string> = {
  "Causeway Marine": "/dealers/causeway-marine.png",
  "Clarks Landing Yacht Sales & Marina": "/dealers/clarks-landing.png",
  "Coastal Boat Sales": "/dealers/coastal-boat-sales.png",
  "Comstock Yacht Sales & Marina": "/dealers/comstock.png",
  "Coty Marine": "/dealers/coty-marine.png",
  "D & R Boat World": "/dealers/dr-boat-world.png",
  "EZ Dock Mid Atlantic": "/dealers/ez-dock.png",
  "Formula Boats": "/dealers/formula-boats.png",
  "G Winter's Sailing Center, Inc.": "/dealers/g-winters.png",
  "Henriques Yachts": "/dealers/henriques.png",
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
