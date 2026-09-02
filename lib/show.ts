/**
 * The show itself: one place that knows which year this site is for.
 *
 * ROLLING OVER TO NEXT YEAR. Change the values in this file and every title,
 * canonical, announcement bar, footer, hero, structured-data block and
 * walkthrough day follows. Before this existed the year was hardcoded in
 * dozens of places, and the risk was never the big obvious ones, it was the
 * single stray "2026" that survives into the next season.
 *
 * What this file deliberately does NOT own, because none of it is a display
 * of the show's identity:
 *   - data/*.json and the inventory workbook (a season's boats, replaced
 *     wholesale each year)
 *   - lib/docks.ts and lib/showmap.ts (that year's dock plan and map image)
 *   - lib/exhibitors.ts and lib/sponsors.ts (that year's exhibitor list)
 *   - dated comments recording when a decision was made, which are history
 *     and must not be rewritten
 *
 * So the rollover is: edit this file, then replace that season's data.
 */

export const YEAR = 2026;

/** Legal name of the show. Confirmed by Jon 2026-09-01: no "Power". */
export const NAME = "Atlantic City In-Water Boat Show";
/** For titles and tight spaces, where the city is already understood. */
export const SHORT_NAME = "AC In-Water Boat Show";

export const VENUE = "Farley State Marina";
export const CITY = "Atlantic City";

/** Opening and closing days, ISO, in the show's own timezone (Eastern). */
export const START_DATE = `${YEAR}-09-10`;
export const END_DATE = `${YEAR}-09-13`;
/** Doors open, used for the show-day gate lift and the Event schema. */
export const START_TIME = "10:00:00-04:00";

/** "September 10-13" and "Sept 10-13". An en dash is correct in a date range;
 *  the no-em-dash house rule does not apply to these. */
export const DATES_LONG = "September 10–13";
export const DATES_SHORT = "Sept 10–13";

/** "2026 Atlantic City In-Water Boat Show" */
export const NAME_WITH_YEAR = `${YEAR} ${NAME}`;
/** "September 10-13, 2026 - Farley State Marina, Atlantic City" */
export const WHEN_AND_WHERE = `${DATES_LONG}, ${YEAR} · ${VENUE}, ${CITY}`;

/** The four show days, for anything asking a visitor which day they are coming. */
export const SHOW_DAYS: { value: string; label: string }[] = [
  { value: `${YEAR}-09-10`, label: "Thursday, Sept 10" },
  { value: `${YEAR}-09-11`, label: "Friday, Sept 11" },
  { value: `${YEAR}-09-12`, label: "Saturday, Sept 12" },
  { value: `${YEAR}-09-13`, label: "Sunday, Sept 13" },
];

/**
 * Schema.org Event, rendered as JSON-LD on the homepage. This is what lets a
 * search result carry the show's dates and venue instead of a plain blue link.
 */
export function eventJsonLd(ticketsUrl: string, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: NAME_WITH_YEAR,
    startDate: `${START_DATE}T${START_TIME}`,
    endDate: `${END_DATE}T17:00:00-04:00`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: VENUE,
      address: {
        "@type": "PostalAddress",
        streetAddress: "600 Huron Blvd",
        addressLocality: CITY,
        addressRegion: "NJ",
        postalCode: "08401",
        addressCountry: "US",
      },
    },
    image: [`${siteUrl}/og-show.jpg`],
    description:
      `The ${NAME_WITH_YEAR} brings hundreds of boats to the water at ${VENUE} in ${CITY}, ` +
      `${DATES_LONG}, ${YEAR}. Browse the boats, find the dealers, and plan your visit.`,
    offers: {
      "@type": "Offer",
      url: ticketsUrl,
      availability: "https://schema.org/InStock",
    },
    organizer: {
      "@type": "Organization",
      name: NAME,
      url: siteUrl,
    },
  };
}
