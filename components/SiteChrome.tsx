import Link from "next/link";
import Image from "next/image";

const DISPLAY = "var(--font-bricolage), sans-serif";
const MONO = "var(--font-space-mono), monospace";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/#how" },
  { label: "Sell Your Boat", href: "/sell" },
  { label: "Boat Show Map", href: "/map" },
  { label: "Dealers", href: "/#dealers" },
  { label: "Vendors", href: "/vendors" },
];

export function AnnouncementBar() {
  return (
    <div
      style={{
        background: "#050F1A",
        color: "rgba(255,255,255,.82)",
        fontFamily: MONO,
        fontSize: 12,
        letterSpacing: ".13em",
        textTransform: "uppercase",
        textAlign: "center",
        padding: "9px 16px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <span style={{ color: "var(--accent)", fontWeight: 700 }}>Sept 10-13, 2026</span>
      <span style={{ opacity: 0.35 }}>/</span>
      <span>Atlantic City In-Water Boat Show</span>
      <span style={{ opacity: 0.35 }}>/</span>
      <span style={{ opacity: 0.75 }}>Ticket holders unlock live pricing 5 days early</span>
    </div>
  );
}

/** Sticky top nav. `active` matches a NAV_LINKS href to bold it. */
export function Nav({ active }: { active?: string }) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        background: "rgba(8,24,41,.86)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,.09)",
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          padding: "13px clamp(18px,5vw,56px)",
          display: "flex",
          alignItems: "center",
          gap: 22,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, color: "#fff" }}>
          <Image src="/buoy-ring-logo.svg" alt="Buoy" width={30} height={30} style={{ display: "block", flex: "0 0 auto" }} priority />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.08 }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16.5, letterSpacing: "-.01em", whiteSpace: "nowrap" }}>
              AC In-Water Boat Show
            </span>
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".22em", color: "rgba(255,255,255,.5)", marginTop: 4 }}>
              POWERED BY BUOY
            </span>
          </span>
        </Link>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            {NAV_LINKS.map((l) => {
              const isActive = active === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={isActive ? undefined : "nav-link"}
                  style={{
                    fontSize: 14.5,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#fff" : undefined,
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
          <Link
            href="/#unlock"
            className="h-brighten"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "var(--accent)",
              color: "#0A2138",
              fontWeight: 700,
              fontSize: 13.5,
              padding: "11px 18px",
              borderRadius: 999,
            }}
          >
            Get Boat Show Tickets
          </Link>
        </div>
      </div>
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
