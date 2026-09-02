import type { Metadata } from "next";
import { ShowGate } from "@/components/ShowGate";

export const metadata: Metadata = {
  title: "Browse Boats at the Show",
  description:
    "Every boat coming to the 2026 Atlantic City In-Water Boat Show, Sept 10-13 at Farley State Marina, with the dock and slip where each one is tied up.",
  alternates: { canonical: "/inventory" },
};

/**
 * The inventory sits behind the access gate (components/ShowGate.tsx).
 *
 * History: gated at launch, opened 2026-08-25 per client review, gated again
 * 2026-08-27 per client direction. Boat detail pages stay open on purpose so
 * per-boat share links keep working; a shared boat shows at most three other
 * boats from the same dealer, never the full list.
 */
export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <ShowGate>{children}</ShowGate>;
}
