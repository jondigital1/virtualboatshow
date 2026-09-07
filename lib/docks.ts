/**
 * Dock, slip, and land assignments for the 2026 show.
 *
 * Source: show staff, provided 2026-08-25 (see
 * design-specs/dock-assignments-RAW-UNVERIFIED.md for the raw notes and the
 * open questions). The four E dock entries written with an F prefix in the
 * source notes were confirmed by Jon as E dock.
 *
 * Slips run even on one side of each dock and odd on the other, which is why
 * ranges that look like they overlap do not: Comstock F10-12 and MarineMax
 * F1-25 face each other across the walkway, as do Coastal E13-19 and
 * Sheltered Cove E14-20.
 *
 * Corrected 2026-09-06 against Giselle's final 2026 Directory: MarineMax
 * F1-25 (was 11-25), EZ Dock Mid Atlantic at F36 (was 34) plus Land Display
 * 255-261, Red Bank Marina removed (not at the show; 255-261 is EZ Dock),
 * Paradise Grills to Land Display E, New Jersey Outboards to Land Displays
 * A, C and D. This file feeds every boat page and the walkthrough form, not
 * just the dock list, so it has to be right even if that list goes away.
 *
 * The "Linear" frontage figures in the source notes are deliberately NOT
 * modelled here; what they represent is still unconfirmed.
 */

export type Berth = {
  /** Display name; matches lib/exhibitors.ts where the exhibitor has a card. */
  name: string;
  start: number;
  end: number;
  side: "even" | "odd";
};

export type Dock = {
  id: string;
  label: string;
  /** Inclusive slip range the whole dock spans; both sides share it so the
   *  two rows of the spine line up with each other. */
  span: [number, number];
  berths: Berth[];
};

export const DOCKS: Dock[] = [
  {
    id: "F",
    label: "F dock",
    span: [1, 46],
    berths: [
      { name: "South Jersey Yacht Sales", start: 2, end: 8, side: "even" },
      { name: "Comstock Yacht Sales", start: 10, end: 12, side: "even" },
      { name: "Seaport Inlet Marina", start: 14, end: 16, side: "even" },
      { name: "D & R Boat World", start: 18, end: 24, side: "even" },
      { name: "Sandy Hook Yacht Sales", start: 26, end: 32, side: "even" },
      { name: "EZ Dock Mid Atlantic", start: 36, end: 36, side: "even" },
      { name: "MarineMax", start: 1, end: 25, side: "odd" },
      { name: "Formula Boats", start: 27, end: 33, side: "odd" },
      { name: "Irwin Marine", start: 35, end: 41, side: "odd" },
      { name: "Riptide Marine", start: 43, end: 45, side: "odd" },
    ],
  },
  {
    id: "E",
    label: "E dock",
    span: [1, 46],
    berths: [
      { name: "Sheltered Cove Marina", start: 14, end: 20, side: "even" },
      { name: "Stone Harbor Yacht Sales & Marina", start: 1, end: 11, side: "odd" },
      { name: "Coastal Boat Sales", start: 13, end: 19, side: "odd" },
      { name: "Coty Marine", start: 21, end: 31, side: "odd" },
      { name: "Valhalla Yacht Sales", start: 33, end: 37, side: "odd" },
      { name: "Schrader Yacht Sales", start: 39, end: 41, side: "odd" },
      { name: "G Winter's / Riverside Marina", start: 43, end: 45, side: "odd" },
    ],
  },
];

export type LandSpot = { name: string; where: string; size?: string };

export const LAND: LandSpot[] = [
  { name: "New Jersey Outboards", where: "Land Displays A, C & D" },
  { name: "Clarks Landing Yacht Sales", where: "Block B", size: "50 x 55 ft" },
  { name: "Paradise Grills", where: "Land Display E" },
  { name: "EZ Dock Mid Atlantic", where: "Land Display 255-261" },
  { name: "Total Marine", where: "Booths 237-242", size: "60 ft" },
];

/** Flat A-Z index behind the search box. */
export type Placement = { name: string; dock: string; where: string };

export const PLACEMENTS: Placement[] = [
  ...DOCKS.flatMap((d) =>
    d.berths.map((b) => ({
      name: b.name,
      dock: d.label,
      where: b.start === b.end ? `Slip ${b.start}` : `Slips ${b.start}-${b.end}`,
    }))
  ),
  ...LAND.map((l) => ({ name: l.name, dock: "Land", where: l.where })),
].sort((a, b) => a.name.localeCompare(b.name));

export const pct = (dock: Dock, from: number, to: number) => {
  const total = dock.span[1] - dock.span[0] + 1;
  return {
    left: ((from - dock.span[0]) / total) * 100,
    width: ((to - from + 1) / total) * 100,
  };
};

/**
 * Boat records and the dock notes spell some dealers differently. Keep this an
 * explicit alias list rather than fuzzy matching, so an unlisted dealer shows
 * nothing instead of silently resolving to the wrong berth.
 */
const ALIASES: Record<string, string> = {
  "Clarks Landing Yacht Sales & Marina": "Clarks Landing Yacht Sales",
  "Comstock Yacht Sales & Marina": "Comstock Yacht Sales",
  "G Winter's Sailing Center": "G Winter's / Riverside Marina",
  // The berth list names Irwin by its short name; the directory and every boat
  // page use the full one. Without this the dock line on their boats would
  // silently fall back to "announced before the show".
  "Irwin Marine Center": "Irwin Marine",
  "Riverside Marina & Yacht Sales": "G Winter's / Riverside Marina",
};

export function placementFor(dealer: string): Placement | undefined {
  const key = ALIASES[dealer] ?? dealer;
  return PLACEMENTS.find((p) => p.name === key);
}
