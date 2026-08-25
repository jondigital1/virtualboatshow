/**
 * 2026 show sponsors, mirrored from the official site's sponsor wall
 * (acinwaterboatshow.com/#sponsors) with names and links added. Logos in
 * public/sponsors/. Grouped for the /sponsors page; the homepage strip
 * shows a subset.
 */
export type Sponsor = { name: string; slug: string; url: string };

export const HOST_VENUE: Sponsor = {
  name: "Golden Nugget Atlantic City",
  slug: "golden-nugget",
  url: "https://www.goldennugget.com/atlantic-city/",
};

export const MEDIA_PARTNERS: Sponsor[] = [
  { name: "Boating", slug: "boating", url: "https://www.boatingmag.com/" },
  { name: "Salt Water Sportsman", slug: "salt-water-sportsman", url: "https://www.saltwatersportsman.com/" },
  { name: "Yachting", slug: "yachting", url: "https://www.yachtingmagazine.com/" },
  { name: "Firecrown", slug: "firecrown", url: "https://firecrown.com/" },
  { name: "The Press of Atlantic City", slug: "press-of-atlantic-city", url: "https://pressofatlanticcity.com/" },
  { name: "WFAN Sports Radio", slug: "wfan", url: "https://www.audacy.com/stations/wfan" },
  { name: "94 WIP SportsRadio", slug: "94-wip", url: "https://www.audacy.com/stations/94wip" },
];

export const SHOW_PARTNERS: Sponsor[] = [
  { name: "Pursuit Boats", slug: "pursuit", url: "https://www.pursuitboats.com/" },
  { name: "Stone Harbor Marina", slug: "stone-harbor-marina", url: "https://www.stoneharbormarina.com/" },
  { name: "Vista Convention Services", slug: "vista", url: "https://www.vistacs.com/" },
];

export const ALL_SPONSORS: Sponsor[] = [HOST_VENUE, ...MEDIA_PARTNERS, ...SHOW_PARTNERS];
