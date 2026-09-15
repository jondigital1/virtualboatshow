import type { Metadata } from "next";
import { NAME_WITH_YEAR, DATES_SHORT, VENUE } from "@/lib/show";

export const metadata: Metadata = {
  title: "Browse Boats from the Show",
  description:
    `Every boat in the ${NAME_WITH_YEAR} lineup, ${DATES_SHORT} at ${VENUE}, with photos, the dealer that showed it and where it was docked.`,
  alternates: { canonical: "/inventory" },
};

/**
 * The lineup is open to everyone and server-rendered in full, so search
 * engines index every boat and follow a link to each boat page.
 *
 * History: gated at launch, opened 2026-08-25 per client review, gated again
 * 2026-08-27 per client direction, opened for good 2026-09-15 after the show
 * (Jon). The gate kept the boats out of the page Google indexes, because
 * Google's renderer never carries the "already registered" mark. A small
 * sign-up banner (components/NotifyBanner.tsx) replaced it.
 * components/ShowGate.tsx is kept for the next show.
 */
export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
