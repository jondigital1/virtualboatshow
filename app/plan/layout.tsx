import type { Metadata } from "next";
import { NAME_WITH_YEAR } from "@/lib/show";

export const metadata: Metadata = {
  title: "Plan Your Visit",
  description: `Show hours, tickets, parking and directions for the ${NAME_WITH_YEAR}, plus where to stay, eat and what to do while you are in town.`,
  alternates: { canonical: "/plan" },
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
