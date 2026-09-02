import type { Metadata } from "next";
import { NAME_WITH_YEAR, DATES_LONG, VENUE } from "@/lib/show";

export const metadata: Metadata = {
  title: "Show Map and Dock Assignments",
  description: `Find any dealer at ${VENUE}: the full show map with dock and slip assignments for the ${NAME_WITH_YEAR}, ${DATES_LONG}.`,
  alternates: { canonical: "/map" },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
