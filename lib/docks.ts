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
 * F11-25 face each other across the walkway, as do Coastal E13-19 and
 * Sheltered Cove E14-20.
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
      { name: "EZ Dock", start: 34, end: 34, side: "even" },
      { name: "MarineMax", start: 11, end: 25, side: "odd" },
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
      { name: "Stone Harbor Marina", start: 1, end: 11, side: "odd" },
      { name: "Coastal Boat Sales", start: 13, end: 19, side: "odd" },
      { name: "Coty Marine", start: 21, end: 31, side: "odd" },
      { name: "Valhalla Boat Sales", start: 33, end: 37, side: "odd" },
      { name: "Schrader Yacht Sales", start: 39, end: 41, side: "odd" },
      { name: "G Winter's / Riverside Marina", start: 43, end: 45, side: "odd" },
    ],
  },
];

export type LandSpot = { name: string; where: string; size?: string };

export const LAND: LandSpot[] = [
  { name: "New Jersey Outboards", where: "Block A", size: "130 x 75 ft" },
  { name: "Clarks Landing Yacht Sales", where: "Block B", size: "50 x 55 ft" },
  { name: "Paradise Grills", where: "Block G" },
  { name: "Red Bank Marina", where: "Booths 255-261", size: "70 ft" },
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
