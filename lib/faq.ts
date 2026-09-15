/**
 * Questions and answers for every page, rendered by components/FaqSection.tsx
 * (Jon, 2026-09-15: the questions people ask search engines and AI assistants,
 * on every page).
 *
 * Written for the live site between the end of the 2026 show and its archive.
 * Every answer was drafted from this repo and then fact-checked against it,
 * item by item, before it went in. The rules each one holds to:
 *   - no prices and no price questions; no ticket questions; no walkthrough
 *   - no em or en dashes and no Oxford comma. Dates are written out
 *     ("September 10 to 13, 2026") because DATES_LONG and DATES_SHORT in
 *     lib/show.ts carry an en dash
 *   - no statistic without a source; counts are computed from the data
 *   - true on every day until the archive replaces these pages, and nothing
 *     a visitor can see on the page contradicts it
 *   - the street is 600 Huron Ave (verified); the Event schema's "Huron Blvd"
 *     in lib/show.ts is wrong
 *
 * Each set reads names from the file its own page renders, because the files
 * disagree in places: the lineup (lib/showboats.ts) has MarineMax as one
 * dealer, the directory (lib/exhibitors.ts) lists three locations, and the
 * dock plan (lib/docks.ts) uses short names such as "Irwin Marine". Phone
 * numbers also differ between the boat data and the directory for four
 * dealers, so only the boat page's own number is ever quoted, and only there.
 *
 * If the privacy policy text changes, update privacyFaq in the same commit.
 */
import { NAME, YEAR } from "@/lib/show";
import { showBoats, allBrands, allDealers, type ShowBoat } from "@/lib/showboats";
import { DEALERS, VENDORS } from "@/lib/exhibitors";
import { DOCKS, LAND, PLACEMENTS, placementFor } from "@/lib/docks";
import { HOST_VENUE, MEDIA_PARTNERS, SHOW_PARTNERS } from "@/lib/sponsors";

export type Faq = { q: string; a: string };

const SHOW = `${YEAR} ${NAME}`;
const WHEN = `September 10 to 13, ${YEAR}`;
const ADDRESS = "600 Huron Ave, Atlantic City, NJ 08401";

/** "A", "A and B", "A, B and C". Not Intl.ListFormat, which adds an Oxford comma. */
function list(items: string[]): string {
  if (items.length <= 2) return items.join(" and ");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Dock plan wording in prose: "Slips 1-25" to "slips 1 to 25", "A, C & D" to "A, C and D". */
function spell(where: string, lowerFirst: boolean): string {
  const s = where.replace(/(\d)-(\d)/g, "$1 to $2").replace(/ & /g, " and ");
  return lowerFirst ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

/**
 * The show always runs Thursday to Sunday after Labor Day weekend (Jon,
 * 2026-09-15). Labor Day is the first Monday in September, so the show opens
 * three days later. 2026: Labor Day September 7, show September 10 to 13.
 */
function showDays(year: number): { start: number; end: number } {
  const sept1 = new Date(Date.UTC(year, 8, 1)).getUTCDay(); // 0 Sunday to 6 Saturday
  const laborDay = 1 + ((8 - sept1) % 7);
  return { start: laborDay + 3, end: laborDay + 6 };
}

/* ---------------------------------------------------------------- home */

export function homeFaq(): Faq[] {
  const next = YEAR + 1;
  const nextDays = showDays(next);
  return [
    {
      q: "What is the Atlantic City In-Water Virtual Boat Show?",
      a: `The Atlantic City In-Water Virtual Boat Show, at acvirtualboatshow.com, is the official virtual companion to the ${NAME}. It brings the ${YEAR} show online with feature boats from participating dealers, the Marine Marketplace exhibitor directory and the official show map. The site is powered by Buoy.`,
    },
    {
      q: `When was the ${SHOW}?`,
      a: `The ${SHOW} ran from Thursday, September 10 to Sunday, September 13, ${YEAR}, at Farley State Marina in Atlantic City, New Jersey.`,
    },
    {
      q: `Where is the ${NAME} held?`,
      a: `The ${SHOW} was held at Senator Frank S. Farley State Marina (Farley State Marina), ${ADDRESS}, next to the Golden Nugget.`,
    },
    {
      q: "What is an in-water boat show?",
      a: `An in-water boat show displays boats tied up in marina slips, so visitors walk the docks and see the boats in the water. At the ${SHOW}, dealers displayed boats in the slips of E dock and F dock at Farley State Marina, alongside land displays and Marine Marketplace exhibitor booths.`,
    },
    {
      q: `When is the next ${NAME}?`,
      a: `The ${NAME} runs Thursday to Sunday after Labor Day weekend, so the ${next} show falls on Thursday, September ${nextDays.start} to Sunday, September ${nextDays.end}, ${next}. The ${YEAR} show ran ${WHEN}, at Farley State Marina in Atlantic City. For show details, check the official show site, acinwaterboatshow.com.`,
    },
    {
      q: `Can I see the boats from the ${NAME} online?`,
      a: `Yes. The Browse Boats page on acvirtualboatshow.com lists ${count(showBoats.length, "boat", "boats")} from ${count(allDealers().length, "dealer", "dealers")} at the ${SHOW}, and you enter your first name, last name and email to open the full lineup. Each boat has its own page naming the presenting dealer, with photos and the dealer's dock or land display location where available.`,
    },
  ];
}

/* ------------------------------------------------ inventory (gate + lineup) */

/** Heading copy shared by the locked gate and the unlocked lineup, which show the same set. */
export const LINEUP_FAQ_COPY = {
  eyebrow: "Before you buy",
  title: "Boat-buying questions, answered.",
  intro: `About the ${YEAR} lineup, and what smart buyers sort out before they step aboard.`,
};

export function lineupFaq(): Faq[] {
  const brands = allBrands();
  const dealers = allDealers();
  return [
    {
      q: `How many boats are in the ${SHOW} lineup?`,
      a: `The online lineup for the ${SHOW} has ${count(showBoats.length, "feature boat", "feature boats")} from ${count(brands.length, "boat brand", "boat brands")}, presented by ${count(dealers.length, "dealer", "dealers")}. The show ran ${WHEN}, at Farley State Marina in Atlantic City, New Jersey.`,
    },
    {
      q: `How do I see the full list of boats from the ${SHOW}?`,
      a: `Enter your first name, last name and email on the Browse Boats page at www.acvirtualboatshow.com/inventory, then select "Take me to the boats!" to open the full ${YEAR} lineup. The sign-up is remembered on that device, so you are usually not asked again. By continuing, you agree that the ${NAME} and Buoy may email you, and you can unsubscribe any time with one click.`,
    },
    {
      q: `Can I search the ${SHOW} lineup by brand or dealer?`,
      a: `Yes. After you open the ${SHOW} lineup, you can search by boat, brand, model or dealer name, or use the Brand and Dealer filters to narrow the list. Results can also be sorted by brand, newest year or longest length.`,
    },
    {
      q: `Which boat dealers are in the ${SHOW} lineup?`,
      a: `The dealers with boats in the online ${SHOW} lineup are ${list(dealers)}.`,
    },
    {
      q: `Which boat brands are in the ${SHOW} lineup?`,
      a: `The online ${SHOW} lineup includes ${count(brands.length, "boat brand", "boat brands")}: ${list(brands)}.`,
    },
    {
      q: `Are the boats from the ${SHOW} still for sale?`,
      a: `Boats in the ${SHOW} lineup may have sold since the show, because the lineup shows the boats dealers selected for the show and does not track sales. Each boat page names the presenting dealer with its location and phone number, so call that dealer to confirm availability or ask about a similar boat.`,
    },
    {
      q: "Should I buy a new or used boat?",
      a: "A new boat brings a full factory warranty and the latest technology, while a used boat stretches your budget and holds its value when it has been well kept. Compare both and ask the dealer about the warranty and service history of each before you decide.",
    },
    {
      q: "Can I take a boat out on the water before I buy it?",
      a: "Many boat dealers will arrange a sea trial where available, so ask the dealer before you commit. Nothing replaces time on the water for feeling how a boat handles.",
    },
    {
      q: "Can I trade in my current boat when I buy from a dealer?",
      a: "Usually, yes. Talk to the dealer for the boat you are interested in and start the trade-in conversation early, so your current boat is ready to discuss when you are ready to buy.",
    },
    {
      q: "Does a boat come with a trailer, electronics and a warranty?",
      a: "What comes with a boat varies from boat to boat, so confirm exactly what is included, such as the trailer, the electronics package and any remaining factory or extended warranty. Get every inclusion in writing before you buy.",
    },
  ];
}

/* ---------------------------------------------------------- boat pages */

/** The boat's name without a doubled brand: "2026 Marex 360", not "2026 Marex Marex 360". */
function faqTitle(b: ShowBoat): string {
  const base = b.brand.replace(/\s+(Yachts|Boats|Pontoons|Dayboats|Deck|Craft)$/i, "");
  const doubled = b.model.toLowerCase().startsWith(base.toLowerCase() + " ");
  return [b.year ?? "", doubled ? "" : b.brand, b.model].filter(Boolean).join(" ");
}

/**
 * Only questions this boat's own record can answer. A boat with other than
 * exactly one dealer gets none (no such boat exists; no wording is guessed for
 * one). Length is deliberately not asked: the length tile comes from the model
 * number, and on several boats the dealer's own description gives a longer
 * figure on the same page.
 */
export function boatFaq(b: ShowBoat): Faq[] {
  if (b.dealers.length !== 1) return [];
  const d = b.dealers[0];
  const title = faqTitle(b);
  const loc = d.loc ? ` (${d.loc})` : "";
  const out: Faq[] = [
    {
      q: `Which dealer presented the ${title} at the ${SHOW}?`,
      a: `${d.name}${loc} presented the ${title} as one of its feature boats for the ${SHOW}. The show ran ${WHEN}, at Farley State Marina in Atlantic City, NJ.`,
    },
  ];

  // Every placement for the dealer, not just the first: Seaport Inlet Marina
  // had F dock slips and land displays. A dealer the dock plan cannot match
  // (placementFor returns nothing) gets no "where" question at all.
  const first = placementFor(d.name);
  if (first) {
    const all = PLACEMENTS.filter((p) => p.name === first.name);
    const docks = all.filter((p) => p.dock !== "Land").map((p) => `${p.dock}, ${spell(p.where, true)}`);
    const land = all.filter((p) => p.dock === "Land").map((p) => spell(p.where, false));
    out.push({
      q: `Where was the ${title} at the ${SHOW}?`,
      a: `The ${title} was presented by ${d.name}, whose assigned space at the ${SHOW} was ${[...docks, ...land].join(", plus ")}. The show was held at Farley State Marina, ${ADDRESS}. This site's show map lists every dealer's dock, slip and land display assignment.`,
    });
  }

  if (/\d/.test(d.phone ?? "")) {
    out.push({
      q: `How do I contact the dealer about the ${title}?`,
      a: `Call ${d.name}${loc} at ${d.phone} to ask about the ${title}. Details can change, so confirm them directly with ${d.name}.`,
    });
  }
  return out;
}

/* ------------------------------------------------ vendors (Marine Marketplace) */

export function vendorsFaq(): Faq[] {
  // "MarineMax (Brick)" to "MarineMax", "G Winter's Sailing Center, Inc." to
  // "G Winter's Sailing Center"; one name per company, in directory order.
  const companies = Array.from(new Set(DEALERS.map((r) => r.n.replace(/\s*\([^)]*\)\s*$/, "").replace(/,\s*Inc\.?$/, ""))));
  const locations = DEALERS.length > companies.length ? ` (listed at ${DEALERS.length} locations)` : "";
  return [
    {
      q: `What is the Marine Marketplace at the ${NAME}?`,
      a: `The Marine Marketplace was the exhibitor area of the ${SHOW}, held ${WHEN}, at Farley State Marina next to the Golden Nugget in Atlantic City, New Jersey. Most exhibitors had a numbered booth or a land display at the marina. The Marine Marketplace page at acvirtualboatshow.com/vendors lists the exhibitors and presenting dealers from the ${YEAR} show.`,
    },
    {
      q: `Who exhibited at the ${SHOW}?`,
      a: `The Marine Marketplace directory on acvirtualboatshow.com lists ${count(VENDORS.length, "exhibitor", "exhibitors")} and ${count(companies.length, "presenting dealer", "presenting dealers")}${locations} from the ${SHOW}, based on the show's final ${YEAR} directory listings. Exhibitors included businesses offering sails, canvas and cushions, docks, shrink wrap, boat covers, towing, mobile fuel, marine services, yacht sales, sunglasses, footwear, grills and spas, along with a boat club and a boating school.`,
    },
    {
      q: `Which boat dealers were at the ${SHOW}?`,
      a: `The presenting dealers at the ${SHOW} were ${list(companies)}. Each one is listed on the Marine Marketplace page at acvirtualboatshow.com/vendors with its town and phone number.`,
    },
    {
      q: `How do I contact an exhibitor or dealer from the ${NAME}?`,
      a: `To contact an exhibitor or dealer from the ${NAME}, find the business in the Marine Marketplace directory at acvirtualboatshow.com/vendors, where every listing shows its town, state and phone number. You can search the directory by business name or town, and on a phone you can tap the number to call. Most listings in the exhibitor section also show the booth or display location the business had at the ${YEAR} show.`,
    },
    {
      q: `How can my business exhibit at the ${NAME}?`,
      a: `Businesses interested in exhibiting at the ${NAME} can send an inquiry through the form on the Marine Marketplace page at acvirtualboatshow.com/vendors: choose Presenting dealer or Vendor booth, then add your company, name, email and a note about what you would like to showcase. You can also email customerinquiry@acvirtualboatshow.com. For news about the next ${NAME}, visit the official show site, acinwaterboatshow.com.`,
    },
    {
      q: `How do I sponsor or advertise with the ${NAME}?`,
      a: `Businesses interested in sponsoring or advertising with the ${NAME} can use the inquiry form on the Marine Marketplace page at acvirtualboatshow.com/vendors: choose Sponsorship or Advertising, then add your company, name, email and a note about what you have in mind. The Become a Sponsor button on the site's Sponsors page and the Reserve ad space button on the show map page both lead to that form.`,
    },
  ];
}

/* ----------------------------------------------------------------- map */

export function mapFaq(): Faq[] {
  const f = DOCKS.find((d) => d.id === "F")?.berths.length ?? 0;
  const e = DOCKS.find((d) => d.id === "E")?.berths.length ?? 0;
  const dockNames = new Set(DOCKS.flatMap((d) => d.berths.map((b) => b.name)));
  const landList = list(LAND.map((l) => `${l.name} (${spell(l.where, false)})`));
  const alsoOnDocks = LAND.filter((l) => dockNames.has(l.name)).map((l) => l.name);
  const alsoSentence = alsoOnDocks.length
    ? ` ${list(alsoOnDocks)} also ${alsoOnDocks.length === 1 ? "appears" : "appear"} in the dock lists.`
    : "";
  return [
    {
      q: `Where were the dealers at the ${SHOW}?`,
      a: `Boat dealers at the ${SHOW} displayed on E dock and F dock at Farley State Marina and in land displays. The dock and slip assignments list on the show map page gives slips for ${count(f, "company", "companies")} on F dock and ${e} on E dock, plus ${count(LAND.length, "land display assignment", "land display assignments")}. The Marine Marketplace page on acvirtualboatshow.com lists exhibitor booth numbers.`,
    },
    {
      q: `How do slip numbers work on the ${NAME} map?`,
      a: `On the ${SHOW} map, each slip is labeled with its dock letter and slip number, such as E-1 or F-2. Each dock has even-numbered slips on one side and odd-numbered slips on the other, which is why slip ranges that look like they overlap do not: MarineMax held F dock slips 1 to 25 on the odd side, while Comstock Yacht Sales held F dock slips 10 to 12 on the even side.`,
    },
    {
      q: `Which companies had land displays at the ${SHOW}?`,
      a: `The dock and slip assignments list for the ${SHOW} names ${count(LAND.length, "company", "companies")} in the land displays: ${landList}.${alsoSentence}`,
    },
    {
      q: `Is there an official map of the ${NAME}?`,
      a: `Yes. The show map page on acvirtualboatshow.com carries the official ${SHOW} map approved by show staff, in a landscape version for larger screens and a tall version for phones. The map marks slip numbers, land display letters, Marine Marketplace booth numbers and amenities such as restrooms, first aid and food, but not company names, so the dock and slip assignments list below it gives each company's dock and slips or land display.`,
    },
    {
      q: `How do I find which dock a boat was on at the ${NAME}?`,
      a: `Each boat page on acvirtualboatshow.com names the presenting dealer for that boat at the ${SHOW}. Look up that dealer in the dock and slip assignments list on the show map page to see its dock and slips or land display; the list uses shorter names for a few dealers, such as Irwin Marine for Irwin Marine Center.`,
    },
  ];
}

/* ---------------------------------------------------------------- plan */

export function planFaq(): Faq[] {
  return [
    {
      q: "What is the address of Farley State Marina in Atlantic City?",
      a: `Farley State Marina, officially Senator Frank S. Farley State Marina, is at ${ADDRESS}, beside the Golden Nugget. It was the site of the ${SHOW}. The Get Directions link on the Plan Your Visit page opens a Google Maps search for Farley State Marina.`,
    },
    {
      q: "What restaurants are near Farley State Marina and the Golden Nugget?",
      a: "The Plan Your Visit page lists two restaurants at the Golden Nugget, next to Farley State Marina. Vic & Anthony's Steakhouse is a classic steakhouse with waterfront views, (609) 441-8355. Chart House serves seafood with a view, (609) 340-5030.",
    },
    {
      q: "Where can I find hotels in Atlantic City?",
      a: "The Hotels & Stays tile on the Plan Your Visit page searches places to stay in Atlantic City. Pick your check-in and check-out dates, then choose Browse Hotels to see what is open for those dates without leaving the site.",
    },
    {
      q: "What is there to do near Farley State Marina in Atlantic City?",
      a: "The Atlantic City boardwalk and beaches start a few minutes from Farley State Marina. Atlantic City also has shopping with tax-free clothing, casinos, live music, comedy and nightlife, plus the aquarium, golf and family attractions. Each has a tile in the Explore Atlantic City section of the Plan Your Visit page.",
    },
  ];
}

/* ------------------------------------------------------------ sponsors */

export function sponsorsFaq(): Faq[] {
  const group = (label: string, names: string[]) =>
    names.length ? ` ${label} ${names.length === 1 ? "was" : "were"} ${list(names)}.` : "";
  return [
    {
      q: `Who sponsored the ${SHOW}?`,
      a: `The host venue sponsor of the ${SHOW} was ${HOST_VENUE.name}.${group("The show's media partners", MEDIA_PARTNERS.map((s) => s.name))}${group("The show partners", SHOW_PARTNERS.map((s) => s.name))}`,
    },
    {
      q: `Is the ${NAME} held at the Golden Nugget?`,
      a: `The ${SHOW} was held ${WHEN}, at Farley State Marina (Senator Frank S. Farley State Marina), ${ADDRESS}, beside the Golden Nugget. Golden Nugget Atlantic City is listed as the show's host venue sponsor. For future shows, see the official show site, acinwaterboatshow.com.`,
    },
    {
      q: `How can my company sponsor the ${NAME}?`,
      a: `Companies interested in sponsoring the ${NAME} can use the Become a Sponsor button on the acvirtualboatshow.com Sponsors page, which opens the Sponsorship inquiry form on the Marine Marketplace page. Choose Sponsorship, enter your company, name and email, then add an optional message about what you have in mind and send the inquiry. You can also write to customerinquiry@acvirtualboatshow.com.`,
    },
  ];
}

/* ------------------------------------------------------------- privacy */

export function privacyFaq(): Faq[] {
  return [
    {
      q: "Does acvirtualboatshow.com sell my personal information?",
      a: "No. The acvirtualboatshow.com privacy policy says the site does not sell your personal information and does not pass your name, email address or phone number to dealers you did not choose. The site does carry the Meta pixel, which tells Meta which pages you looked at, but it does not send Meta your name, email address or phone number; California residents can opt out of that sharing by writing to customerinquiry@acvirtualboatshow.com or by blocking the cookies in their browser.",
    },
    {
      q: "Who receives my name and email address when I register on acvirtualboatshow.com?",
      a: `The acvirtualboatshow.com privacy policy says everything you enter on the site except a phone number goes to both the ${NAME} and Buoy, the boating app that runs the site for the show. The show keeps its own complete copy for its show communications and marketing, this year and in future years, while Buoy uses its copy to contact you about the Buoy launch and product news. Neither the show nor Buoy keeps your phone number or will call or text you; dealers you did not choose do not receive your details.`,
    },
    {
      q: `How do I unsubscribe from ${NAME} emails?`,
      a: `Use the one-click unsubscribe link in an email from the ${NAME} or Buoy. The acvirtualboatshow.com privacy policy says one unsubscribe stops email from both: the site stops at once and notifies the show the same minute so the show's own records match. Unsubscribing does not affect a dealer you have already asked to contact you.`,
    },
    {
      q: "How do I get my personal data deleted from acvirtualboatshow.com?",
      a: "Email customerinquiry@acvirtualboatshow.com to find out what acvirtualboatshow.com holds about you or to have it corrected or deleted; you do not need to give a reason. Requests under laws such as the California Consumer Privacy Act or the GDPR go to the same address. If a dealer already has your inquiry, contact that dealer directly about its copy.",
    },
  ];
}
