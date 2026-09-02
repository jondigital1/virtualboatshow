import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan Your Visit",
  description:
    "Show hours, tickets, parking and directions for the 2026 Atlantic City In-Water Boat Show, plus where to stay, eat and what to do while you are in town.",
  alternates: { canonical: "/plan" },
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
