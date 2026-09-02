import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marine Marketplace",
  description:
    "Every dealer, builder and exhibitor at the 2026 Atlantic City In-Water Boat Show, with the brands they are bringing and how to reach them.",
  alternates: { canonical: "/vendors" },
};

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
