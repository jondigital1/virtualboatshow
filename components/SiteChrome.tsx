"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useIframeModal } from "@/components/IframeModal";

const FONT = "var(--font-poppins), sans-serif";

/* Recommended visitor nav per the AC show review (design-specs/rebrand/BRIEF.md).
 * Sell/trade left the primary nav intentionally: those flows now live deeper
 * in the experience (VDP-level), keeping the main journey show-first. */
const NAV_LINKS = [
  { label: "Browse Boats", href: "/inventory" },
  { label: "Marine Marketplace", href: "/vendors" },
  { label: "Find Them at the Show", href: "/map" },
  { label: "Plan Your Visit", href: "/plan" },
];

/** Slim navy strip above the header: dates + campaign line. */
export function AnnouncementBar() {
  return (
    <div
      style={{
        background: "var(--navy)",
        color: "#fff",
        fontFamily: FONT,
        fontSize: "clamp(11px,1.3vw,12.5px)",
        fontWeight: 600,
        letterSpacing: ".14em",
        textTransform: "uppercase",
        textAlign: "center",
        padding: "9px 16px",
      }}
    >
      September 10–13, 2026 · Farley State Marina, Atlantic City{" "}
      <span style={{ color: "var(--gold)", whiteSpace: "nowrap" }}>· Let&rsquo;s Boat!</span>
    </div>
  );
}

/** Sticky top nav: AC show logo first, "Powered by Buoy" credit second,
 *  visitor links, then the Get Tickets CTA. White per the brand system. */
export function Nav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const { open: openTickets } = useIframeModal();

  const ticketBtn = (extra?: React.CSSProperties) => (
    <button
      onClick={() => { setOpen(false); openTickets(); }}
      className="h-brighten"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", padding: "12px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", ...extra }}
    >
      Get Tickets
    </button>
  );

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 60, background: "rgba(255,255,255,.96)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid rgba(20,46,81,.1)" }}>
      <div style={{ maxWidth: 1340, margin: "0 auto", padding: "10px clamp(16px,4vw,44px)", display: "flex", alignItems: "center", gap: 18 }}>
        <Link href="/" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <Image src="/ac-logo-horizontal.png" alt="Atlantic City In-Water Boat Show" width={196} height={54} priority style={{ display: "block", width: "clamp(150px,16vw,196px)", height: "auto" }} />
          <span aria-hidden style={{ width: 1, alignSelf: "stretch", background: "rgba(20,46,81,.16)", margin: "4px 0" }} />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1, gap: 3, flex: "0 0 auto" }}>
            <span style={{ fontFamily: FONT, fontSize: 8.5, fontWeight: 600, letterSpacing: ".2em", color: "rgba(20,46,81,.55)" }}>POWERED BY</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Image src="/buoy-ring-logo.svg" alt="" width={17} height={17} style={{ display: "block" }} />
              <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15, letterSpacing: ".04em", color: "var(--navy)" }}>BUOY</span>
            </span>
          </span>
        </Link>

        {/* desktop links */}
        <div className="nav-desktop" style={{ marginLeft: "auto", alignItems: "center", gap: 22, justifyContent: "flex-end" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {NAV_LINKS.map((l) => {
              const isActive = active === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{ fontSize: 12, fontWeight: isActive ? 700 : 600, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--navy)", whiteSpace: "nowrap", paddingBottom: 3, borderBottom: isActive ? "2.5px solid var(--lightblue)" : "2.5px solid transparent" }}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
          {ticketBtn()}
        </div>

        {/* mobile hamburger */}
        <button
          className="nav-hamburger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          style={{ marginLeft: "auto", width: 42, height: 42, borderRadius: 10, background: "rgba(20,46,81,.05)", border: "1px solid rgba(20,46,81,.16)", color: "var(--navy)", fontSize: 18, cursor: "pointer", alignItems: "center", justifyContent: "center" }}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* mobile dropdown panel */}
      {open && (
        <div className="nav-mobile-panel" style={{ flexDirection: "column", padding: "8px clamp(16px,4vw,44px) 20px", borderTop: "1px solid rgba(20,46,81,.1)", background: "rgba(255,255,255,.99)" }}>
          {NAV_LINKS.map((l) => {
            const isActive = active === l.href;
            return (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ display: "block", padding: "14px 2px", fontSize: 14, fontWeight: isActive ? 700 : 600, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--navy)", borderBottom: "1px solid rgba(20,46,81,.08)" }}>
                {l.label}
              </Link>
            );
          })}
          {ticketBtn({ marginTop: 16, fontSize: 14, padding: "15px 18px", width: "100%" })}
        </div>
      )}
    </nav>
  );
}

/** Navy footer bookend: reversed show logo, dates, and the understated
 *  "Official virtual companion · Powered by Buoy" credit. */
export function Footer() {
  return (
    <footer style={{ background: "var(--navy)", color: "rgba(255,255,255,.75)", padding: "clamp(44px,5vw,64px) clamp(18px,5vw,56px) 32px" }}>
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "clamp(24px,4vw,48px)",
          flexWrap: "wrap",
        }}
      >
        <Image src="/ac-logo-reversed.png" alt="Atlantic City In-Water Boat Show" width={280} height={77} style={{ display: "block", width: "clamp(220px,24vw,280px)", height: "auto" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(24px,4vw,48px)", flexWrap: "wrap" }}>
          <div style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.6 }}>
            <div style={{ color: "#fff", fontWeight: 600 }}>September 10–13, 2026</div>
            <div>Atlantic City, New Jersey</div>
          </div>
          <span aria-hidden style={{ width: 1, height: 44, background: "rgba(255,255,255,.2)" }} />
          <div style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.6 }}>
            <div>Official virtual companion</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--buoy-orange)", flex: "0 0 auto" }} />
              <span style={{ color: "#fff", fontWeight: 600 }}>Powered by Buoy</span>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1240,
          margin: "36px auto 0",
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,.14)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          fontFamily: FONT,
          fontSize: 12.5,
          color: "rgba(255,255,255,.55)",
        }}
      >
        <span>© 2026 Atlantic City In-Water Boat Show · Powered by Buoy</span>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <Link href="/inventory" className="link-muted" style={{ color: "rgba(255,255,255,.55)" }}>Browse Boats</Link>
          <Link href="/vendors" className="link-muted" style={{ color: "rgba(255,255,255,.55)" }}>Marine Marketplace</Link>
          <Link href="/map" className="link-muted" style={{ color: "rgba(255,255,255,.55)" }}>Find Them at the Show</Link>
          <Link href="/plan" className="link-muted" style={{ color: "rgba(255,255,255,.55)" }}>Plan Your Visit</Link>
          <Link href="/sponsors" className="link-muted" style={{ color: "rgba(255,255,255,.55)" }}>Sponsors</Link>
        </div>
      </div>
    </footer>
  );
}
