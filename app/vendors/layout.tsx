import type { Metadata } from "next";
import { NAME_WITH_YEAR } from "@/lib/show";

export const metadata: Metadata = {
  title: "Marine Marketplace",
  description: `Every dealer, builder and exhibitor at the ${NAME_WITH_YEAR}, with the brands they are bringing and how to reach them.`,
  alternates: { canonical: "/vendors" },
};

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
