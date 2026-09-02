import type { Metadata } from "next";
import { NAME_WITH_YEAR, DATES_LONG, VENUE } from "@/lib/show";

export const metadata: Metadata = {
  title: "Sponsors and Partners",
  description: `The host venue, media partners and show partners behind the ${NAME_WITH_YEAR}, ${DATES_LONG} at ${VENUE}.`,
  alternates: { canonical: "/sponsors" },
};

export default function SponsorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
