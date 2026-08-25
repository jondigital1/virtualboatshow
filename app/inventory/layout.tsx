/**
 * The ticket-holder password gate was removed 2026-08-25 per client review:
 * the virtual show is the public digital extension of the AC In-Water Boat
 * Show and must be openly browsable (and search-indexable). The gate
 * component is preserved at components/ShowGate.tsx if it's ever needed
 * again — wrap {children} with <ShowGate> to restore it.
 */
export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
