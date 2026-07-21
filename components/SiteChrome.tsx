"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment, useState } from "react";
import { useIframeModal } from "@/components/IframeModal";

const DISPLAY = "var(--font-bricolage), sans-serif";
const MONO = "var(--font-space-mono), monospace";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "View Inventory", href: "/inventory" },
  { label: "Sell Your Boat", href: "/sell" },
  { label: "Boat Show Map", href: "/map" },
  { label: "Exhibitors", href: "/vendors" },
];

/** "Research" nav dropdown: content/guide pages grouped under one trigger. */
const RESEARCH_TRIGGER = { label: "Research", href: "/research" };
const RESEARCH_GROUPS = [
  { section: "Buyer guides", items: [{ label: "Why the Show", href: "/why-the-show" }] },
  { section: "Local market guides", items: [{ label: "Point Pleasant, NJ", href: "/point-pleasant" }] },
];
const RESEARCH_HREFS = [RESEARCH_TRIGGER.href, ...RESEARCH_GROUPS.flatMap((g) => g.items.map((i) => i.href))];

export function AnnouncementBar() {
  return (
    <div
      style={{
        background: "#050F1A",
        color: "#fff",
        fontFamily: MONO,
        fontSize: "clamp(13px,1.5vw,15px)",
        fontWeight: 700,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        textAlign: "center",
        padding: "12px 16px",
      }}
    >
      Boat Show deals live on the docks <span style={{ color: "var(--accent)" }}>· Sept 10-13</span>
    </div>
  );
}

/** Sticky top nav. Full links on desktop; hamburger menu under 960px.
 *  `active` matches a NAV_LINKS href to bold it. */
export function Nav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const { open: openTickets } = useIframeModal();
  const researchActive = active ? RESEARCH_HREFS.includes(active) : false;

  const ticketBtn = (extra?: React.CSSProperties) => (
    <button
      onClick={() => { setOpen(false); openTickets(); }}
      className="h-brighten"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 13.5, padding: "11px 18px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", ...extra }}
    >
      Get Boat Show Tickets
    </button>
  );

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 60, background: "rgba(8,24,41,.92)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,.09)" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "13px clamp(18px,5vw,56px)", display: "flex", alignItems: "center", gap: 22 }}>
        <Link href="/" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 11, color: "#fff" }}>
          <Image src="/buoy-ring-logo.svg" alt="Buoy" width={30} height={30} style={{ display: "block", flex: "0 0 auto" }} priority />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.08 }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16.5, letterSpacing: "-.01em", whiteSpace: "nowrap" }}>AC In-Water Boat Show</span>
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".22em", color: "rgba(255,255,255,.5)", marginTop: 4 }}>POWERED BY BUOY</span>
          </span>
        </Link>

        {/* desktop links */}
        <div className="nav-desktop" style={{ marginLeft: "auto", alignItems: "center", gap: 26, justifyContent: "flex-end" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {NAV_LINKS.map((l) => {
              const isActive = active === l.href;
              return (
                <Link key={l.href} href={l.href} className={isActive ? undefined : "nav-link"} style={{ fontSize: 14.5, fontWeight: isActive ? 600 : 500, color: isActive ? "#fff" : undefined, whiteSpace: "nowrap" }}>
                  {l.label}
                </Link>
              );
            })}
            {/* Research dropdown */}
            <div className="nav-research" style={{ position: "relative", paddingBottom: 14, marginBottom: -14 }}>
              <Link href={RESEARCH_TRIGGER.href} className={researchActive ? undefined : "nav-link"} style={{ fontSize: 14.5, fontWeight: researchActive ? 600 : 500, color: researchActive ? "#fff" : undefined, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                Research <span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
              </Link>
              <div className="nav-dropdown" style={{ position: "absolute", top: "100%", right: 0, minWidth: 238, background: "#0A2138", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14, padding: 8, boxShadow: "0 26px 54px -22px rgba(0,0,0,.7)", display: "flex", flexDirection: "column", gap: 2 }}>
                {RESEARCH_GROUPS.map((g) => (
                  <Fragment key={g.section}>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.4)", padding: "6px 12px 3px" }}>{g.section}</div>
                    {g.items.map((it) => (
                      <Link key={it.href} href={it.href} className="nav-drop-item" style={{ display: "block", padding: "9px 12px", borderRadius: 9, color: "rgba(255,255,255,.82)", fontSize: 14, fontWeight: 500 }}>{it.label}</Link>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
          {ticketBtn()}
        </div>

        {/* mobile hamburger */}
        <button
          className="nav-hamburger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          style={{ marginLeft: "auto", width: 42, height: 42, borderRadius: 10, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)", color: "#fff", fontSize: 18, cursor: "pointer", alignItems: "center", justifyContent: "center" }}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* mobile dropdown panel */}
      {open && (
        <div className="nav-mobile-panel" style={{ flexDirection: "column", padding: "8px clamp(18px,5vw,56px) 20px", borderTop: "1px solid rgba(255,255,255,.09)", background: "rgba(8,24,41,.98)" }}>
          {NAV_LINKS.map((l) => {
            const isActive = active === l.href;
            return (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={isActive ? undefined : "nav-link"} style={{ display: "block", padding: "13px 2px", fontSize: 16, fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : undefined, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                {l.label}
              </Link>
            );
          })}
          {/* Research group */}
          <Link href={RESEARCH_TRIGGER.href} onClick={() => setOpen(false)} className={active === RESEARCH_TRIGGER.href ? undefined : "nav-link"} style={{ display: "block", padding: "13px 2px", fontSize: 16, fontWeight: active === RESEARCH_TRIGGER.href ? 700 : 500, color: active === RESEARCH_TRIGGER.href ? "#fff" : undefined, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            Research
          </Link>
          {RESEARCH_GROUPS.flatMap((g) => g.items).map((it) => {
            const isActive = active === it.href;
            return (
              <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className={isActive ? undefined : "nav-link"} style={{ display: "block", padding: "11px 2px 11px 18px", fontSize: 15, fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : undefined, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                {it.label}
              </Link>
            );
          })}
          {ticketBtn({ marginTop: 16, fontSize: 15, padding: "14px 18px", width: "100%" })}
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  const col = (title: string, items: React.ReactNode[]) => (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,.4)", textTransform: "uppercase" }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>{items}</div>
    </div>
  );
  const fl = (href: string, text: string) => (
    <Link key={text} href={href} className="link-muted" style={{ color: "rgba(255,255,255,.7)", fontSize: 14.5 }}>
      {text}
    </Link>
  );
  const fspan = (text: string) => (
    <span key={text} style={{ color: "rgba(255,255,255,.55)", fontSize: 14.5, fontFamily: MONO }}>
      {text}
    </span>
  );

  return (
    <footer style={{ background: "#050F1A", color: "rgba(255,255,255,.6)", padding: "clamp(52px,6vw,80px) clamp(18px,5vw,56px) 40px" }}>
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))",
          gap: 36,
        }}
      >
        <div style={{ maxWidth: 300 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, color: "#fff" }}>
            <Image src="/buoy-ring-logo.svg" alt="Buoy" width={28} height={28} style={{ display: "block", flex: "0 0 auto" }} />
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, lineHeight: 1.1, whiteSpace: "nowrap" }}>
              AC In-Water Boat Show
            </span>
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.55, margin: "16px 0 0", color: "rgba(255,255,255,.55)" }}>
            The official digital companion to the Atlantic City In-Water Boat Show, powered by Buoy.
          </p>
        </div>
        {col("Marketplace", [fl("/inventory", "Browse inventory"), fl("/inventory", "Browse by make"), fl("/#unlock", "Boat Show Pricing")])}
        {col("Sell & Trade", [fl("/sell", "Value my boat"), fl("/sell", "Trade-in bonus"), fl("/sell", "Dockside appraisal")])}
        {col("Show info", [fl("/#dealers", "For dealers"), fspan("Sept 10-13, 2026"), fspan("Golden Nugget Casino Hotel · Farley State Marina")])}
      </div>
      <div
        style={{
          maxWidth: 1240,
          margin: "44px auto 0",
          paddingTop: 22,
          borderTop: "1px solid rgba(255,255,255,.1)",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          fontFamily: MONO,
          fontSize: 11.5,
          letterSpacing: ".05em",
          color: "rgba(255,255,255,.4)",
        }}
      >
        <span>© 2026 Atlantic City In-Water Boat Show · Powered by Buoy</span>
        <span>Privacy · Terms · Dealer Agreement</span>
      </div>
    </footer>
  );
}
