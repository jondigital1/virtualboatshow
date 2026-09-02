import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Show Map and Dock Assignments",
  description:
    "Find any dealer at Farley State Marina: the full show map with dock and slip assignments for the 2026 Atlantic City In-Water Boat Show, Sept 10-13.",
  alternates: { canonical: "/map" },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
