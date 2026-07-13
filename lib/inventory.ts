/**
 * Sample show inventory (MSRP vs. show price) used to derive the headline
 * savings stats on the "Why the Show" page. Same figures as the inventory
 * page; when a real feed is wired, point both at it.
 */
const PRICED: { msrp: number; price: number }[] = [
  { msrp: 725000, price: 679900 },
  { msrp: 289000, price: 264500 },
  { msrp: 214900, price: 199900 },
  { msrp: 129500, price: 118900 },
  { msrp: 489000, price: 452000 },
  { msrp: 415000, price: 389500 },
  { msrp: 289900, price: 271000 },
  { msrp: 234900, price: 219900 },
  { msrp: 895000, price: 839000 },
  { msrp: 175000, price: 162500 },
  { msrp: 62900, price: 57900 },
  { msrp: 1150000, price: 1079000 },
  { msrp: 189000, price: 177900 },
  { msrp: 469000, price: 439000 },
  { msrp: 189000, price: 174900 },
  { msrp: 465000, price: 432000 },
  { msrp: 119900, price: 111900 },
  { msrp: 149900, price: 139900 },
  { msrp: 795000, price: 742000 },
  { msrp: 985000, price: 929000 },
  { msrp: 219000, price: 203500 },
  { msrp: 169000, price: 158000 },
  { msrp: 725000, price: 679000 },
  { msrp: 69900, price: 64900 },
  { msrp: 1295000, price: 1219000 },
];

const savings = PRICED.map((v) => v.msrp - v.price);

export const SHOW_STATS = {
  /** Presenting dealers competing at the show (site-wide figure). */
  dealers: 20,
  /** Days the show-floor pricing lives (Sept 10-13). */
  days: 4,
  /** Average knocked off MSRP across the sample inventory. */
  avgSave: Math.round(savings.reduce((a, b) => a + b, 0) / savings.length),
  /** Biggest single save on the current list. */
  maxSave: Math.max(...savings),
};
