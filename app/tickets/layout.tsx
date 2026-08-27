import type { Metadata } from "next";

/**
 * /tickets is an ad landing page: it exists for paid campaigns, not for
 * search, so it is noindexed and stays out of the sitemap. Organic visitors
 * get the same capture through the gate and nav CTAs.
 */
export const metadata: Metadata = {
  title: "Get Show Tickets",
  description:
    "Tickets to the Atlantic City In-Water Boat Show, September 10-13, 2026 at Farley State Marina. 250+ boats in the water.",
  robots: { index: false, follow: false },
};

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
