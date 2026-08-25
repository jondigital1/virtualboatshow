import { ShowGate } from "@/components/ShowGate";

/**
 * The inventory (and each boat detail page under it) sits behind the ticket-holder
 * gate. Every OTHER page stays public: the homepage, why-the-show, sell, vendors
 * and the local guides all sell the show, so walling them off would starve the
 * funnel the gate is meant to feed.
 *
 * The gate is a casual deterrent, matched to the audience and to the owners'
 * actual worry (pre-shoppers losing interest), not a hard lock. See ShowGate.tsx.
 */
export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <ShowGate>{children}</ShowGate>;
}
