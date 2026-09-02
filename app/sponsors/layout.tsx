import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsors and Partners",
  description:
    "The host venue, media partners and show partners behind the 2026 Atlantic City In-Water Boat Show, September 10-13 at Farley State Marina.",
  alternates: { canonical: "/sponsors" },
};

export default function SponsorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
