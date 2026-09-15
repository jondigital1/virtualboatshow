"use client";

import { track } from "@vercel/analytics";

/**
 * Call About This Boat: tap-to-call for phones (Jon, 2026-09-15). It dials the
 * dealer's store main line, the number in the boat data. Shown only on phones
 * by .call-cta in globals.css (narrow screens, and phones held sideways), so
 * tablets and desktops do not get a tel: button they cannot use. Boat pages
 * still show the number on the dealer card at every size.
 */
export function CallDealer({
  phone,
  dealer,
  boatTitle,
  boatSlug,
  source,
  compact = false,
  bar = false,
}: {
  phone: string;
  dealer: string;
  boatTitle: string;
  boatSlug: string;
  source: string;
  compact?: boolean;
  /** Half of the phone action bar on boat pages, label allowed to wrap. */
  bar?: boolean;
}) {
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return null;
  const size: React.CSSProperties = bar
    ? { fontSize: 11.5, padding: "10px 8px", flex: "1 1 0", minWidth: 0, minHeight: 48, whiteSpace: "normal", textAlign: "center", lineHeight: 1.2, letterSpacing: ".04em" }
    : compact
      ? { fontSize: 11.5, padding: "10px 14px", flex: "1 1 auto" }
      : { fontSize: 12, padding: "13px 18px", width: "100%" };
  return (
    <a
      href={`tel:${digits}`}
      className="call-cta h-brighten"
      // The visible label comes first so voice control can find the button by
      // what it says (WCAG 2.5.3); dealer and boat tell the card buttons apart.
      aria-label={`Call About This Boat: ${dealer}, ${boatTitle}`}
      onClick={() => track("call_clicked", { number: digits, name: dealer, boat: boatSlug, source, page: window.location.pathname })}
      style={{
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        background: "var(--gold)",
        color: "var(--navy)",
        fontWeight: 700,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        borderRadius: 8,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        ...size,
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1z" />
      </svg>
      Call About This Boat
    </a>
  );
}
