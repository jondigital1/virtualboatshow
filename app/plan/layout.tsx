import type { Metadata } from "next";
import { NAME_WITH_YEAR } from "@/lib/show";

export const metadata: Metadata = {
  title: "Plan Your Visit",
  description: `Directions and parking for Farley State Marina, home of the ${NAME_WITH_YEAR}, plus where to stay, eat and what to do in Atlantic City.`,
  alternates: { canonical: "/plan" },
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
