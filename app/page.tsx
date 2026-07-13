"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { VesselCard, AdSlot, type Vessel } from "@/components/VesselCard";
import { useIframeModal } from "@/components/IframeModal";

const DISPLAY = "var(--font-bricolage), sans-serif";
const MONO = "var(--font-space-mono), monospace";

const fmt = (n: number) => n.toLocaleString("en-US");

const BGS = [
  "repeating-linear-gradient(135deg,#ccd8dc 0 14px,#c3d0d5 14px 28px)",
  "repeating-linear-gradient(135deg,#d7ddd1 0 14px,#ced5c7 14px 28px)",
  "repeating-linear-gradient(135deg,#d1dae0 0 14px,#c7d1d8 14px 28px)",
];

const RAW = [
  { year: 2024, name: "Grady-White Canyon 336", length: "33'6\"", engine: "Twin Yamaha 300", condition: "New", hours: 0, dockLabel: "AT SLIPS · F DOCK", msrp: 725000, show: 679900 },
  { year: 2023, name: "Boston Whaler 250 Outrage", length: "25'0\"", engine: "Twin Mercury 250", condition: "Used", hours: 46, dockLabel: "AT SLIPS · E DOCK", msrp: 289000, show: 264500 },
  { year: 2024, name: "Sea Ray SLX 260", length: "26'0\"", engine: "MerCruiser 350", condition: "New", hours: 0, dockLabel: "AT SLIPS · C DOCK", msrp: 214900, show: 199900 },
  { year: 2022, name: "Robalo R242 Explorer", length: "24'2\"", engine: "Single Yamaha 300", condition: "Used", hours: 120, dockLabel: "OFF-SITE LOT", msrp: 129500, show: 118900 },
  { year: 2024, name: "Cobia 320 CC", length: "32'0\"", engine: "Twin Yamaha 350", condition: "New", hours: 0, dockLabel: "AT SLIPS · F DOCK", msrp: 489000, show: 452000 },
  { year: 2023, name: "Regulator 28", length: "28'0\"", engine: "Twin Yamaha 300", condition: "Used", hours: 88, dockLabel: "AT SLIPS · E DOCK", msrp: 415000, show: 389500 },
  { year: 2024, name: "Scout 355 LXF", length: "35'6\"", engine: "Twin Yamaha 425", condition: "New", hours: 0, dockLabel: "AT SLIPS · F DOCK", msrp: 875000, show: 819000 },
  { year: 2024, name: "Pursuit DC 266", length: "26'6\"", engine: "Twin Yamaha 300", condition: "New", hours: 0, dockLabel: "AT SLIPS · D DOCK", msrp: 289900, show: 268000 },
];

const VESSELS: Vessel[] = RAW.map((v, i) => ({
  year: v.year,
  name: v.name,
  length: v.length,
  engine: v.engine,
  condition: v.condition,
  usage: v.condition === "New" ? "New" : v.hours + " hrs",
  dockLabel: v.dockLabel,
  msrpFmt: "$" + fmt(v.msrp),
  showFmt: "$" + fmt(v.show),
  saveFmt: "$" + fmt(v.msrp - v.show),
  bg: BGS[i % BGS.length],
  href: "/inventory",
}));

/* ---- small presentational helpers ---- */
function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)", ...style }}>
      {children}
    </div>
  );
}
function Check({ bg = "#178a5a", size = 24 }: { bg?: string; size?: number }) {
  return (
    <span style={{ width: size, height: size, flex: "0 0 auto", borderRadius: "50%", background: bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.58 }}>
      ✓
    </span>
  );
}

const SECTION_PAD = "clamp(70px,9vw,124px) clamp(18px,5vw,56px)";

export default function Home() {
  const [ticket, setTicket] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [vesselCount, setVesselCount] = useState(3180);
  const { open: openModal } = useIframeModal();
  const openExhibit = () => openModal("https://acinwaterboatshow.com/exhibitors", "Exhibit at the Boat Show");

  useEffect(() => {
    const start = 3180, target = 3412, dur = 1100, t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVesselCount(Math.round(start + (target - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onUnlock = () => {
    if (ticket.trim().length >= 2) setUnlocked(true);
    else { setTicket("ACBS-4192"); setUnlocked(true); }
  };

  const revealed = unlocked; // prices gated by default

  return (
    <>
      <AnnouncementBar />
      <Nav active="/" />

      {/* HERO */}
      <section id="top" style={{ position: "relative", background: "#0A2138", color: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-25%", right: "-8%", width: "62%", height: "150%", background: "radial-gradient(circle at 68% 34%, rgba(242,106,62,.15), transparent 60%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1300, margin: "0 auto", padding: "clamp(48px,6vw,96px) clamp(18px,5vw,56px) clamp(52px,7vw,88px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: "clamp(28px,4vw,60px)", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <Eyebrow>Atlantic City In-Water Boat Show · Powered by Buoy</Eyebrow>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(40px,6vw,86px)", lineHeight: 0.95, letterSpacing: "-.03em", margin: "18px 0 0" }}>
              Every Dock.<br />Every Dealer.<br /><span style={{ color: "var(--accent)" }}>Every Deal.</span>
            </h1>
            <p style={{ maxWidth: 540, fontSize: "clamp(16px,1.3vw,19px)", lineHeight: 1.55, color: "rgba(255,255,255,.82)", margin: "24px 0 0" }}>
              Get a head start on the show. Browse live inventory from every presenting dealer, value your current vessel, and lock in exclusive{" "}
              <em style={{ fontStyle: "normal", color: "#fff", fontWeight: 600, borderBottom: "2px solid var(--accent)" }}>Boat Show Prices</em>, all before your feet ever touch the deck.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 13, marginTop: 32 }}>
              <button onClick={() => openModal()} className="h-lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 16, padding: "16px 26px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                Unlock Boat Show Pricing →
              </button>
              <Link href="#trade" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.07)", color: "#fff", fontWeight: 600, fontSize: 16, padding: "16px 26px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,.32)" }}>
                Value My Current Boat
              </Link>
            </div>
          </div>

          {/* plan-your-visit card */}
          <div style={{ minWidth: 0 }}>
            <div style={{ borderRadius: 24, border: "1px solid rgba(10,33,56,.08)", background: "linear-gradient(160deg,#FBFAF5,#EFEBE0)", boxShadow: "0 34px 70px -34px rgba(0,0,0,.55)", padding: "clamp(30px,3.2vw,46px)", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 380 }}>
              <Eyebrow style={{ fontSize: 11, letterSpacing: ".2em" }}>Plan your visit</Eyebrow>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, margin: "18px 0 0", flexWrap: "wrap" }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(42px,5vw,68px)", lineHeight: 0.9, letterSpacing: "-.03em", color: "#0A2138" }}>Sept 10-13</span>
                <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(22px,2.2vw,30px)", color: "rgba(10,33,56,.4)", letterSpacing: "-.01em" }}>2026</span>
              </div>
              <div style={{ height: 1, background: "rgba(10,33,56,.12)", margin: "26px 0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  ["Venue", "Golden Nugget Casino Hotel"],
                  ["In-water docks", "Farley State Marina, Atlantic City"],
                ].map(([k, val]) => (
                  <div key={k} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--accent)", marginTop: 6, flex: "0 0 auto" }} />
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(10,33,56,.5)" }}>{k}</div>
                      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, color: "#0A2138", marginTop: 3, letterSpacing: "-.01em" }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
                <button onClick={() => openModal()} className="h-brighten" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 15, padding: "14px 24px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Get Boat Show Tickets →</button>
                <button onClick={openExhibit} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(10,33,56,.05)", color: "#0A2138", fontWeight: 600, fontSize: 15, padding: "14px 22px", borderRadius: 999, border: "1px solid rgba(10,33,56,.2)", cursor: "pointer", fontFamily: "inherit" }}>Exhibit</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW / PROBLEM */}
      <section id="how" style={{ scrollMarginTop: 82, background: "#F4F1EA", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>The easiest way to do show day</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0", maxWidth: "20ch" }}>Start online. Make the most of every dock.</h2>
          <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "#4c6270", margin: "20px 0 0", maxWidth: "64ch" }}>
            You&rsquo;ve got your ticket. Now get a head start. Preview the whole show online and you&rsquo;ll arrive with a plan: every presenting dealer&rsquo;s lineup in one place, exclusive Boat Show Pricing in hand, and your dockside appointments already booked.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,270px),1fr))", gap: 18, marginTop: 44 }}>
            {[
              ["01 · CONVENIENCE", "Every dealer, one place", "Browse the full lineup from every presenting dealer side by side: makes, models, and specs gathered into one easy, searchable index."],
              ["02 · TRANSPARENCY", "Show pricing, up front", "Unlock exclusive Boat Show Pricing and value your trade before you arrive, so the numbers are clear from the very first handshake."],
              ["03 · A BETTER VISIT", "Arrive with a plan", "Shortlist your favorites and book dockside walkthroughs in advance, then spend the weekend enjoying the boats instead of hunting for them."],
            ].map(([tag, h, body]) => (
              <div key={tag} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 18, padding: "26px 24px" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "var(--accent)" }}>{tag}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 21, margin: "14px 0 8px", letterSpacing: "-.01em" }}>{h}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.55, color: "#5a6c78", margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STAT / DIGITAL FOOTPRINT */}
      <section style={{ background: "#0A2138", color: "#fff", padding: "clamp(66px,8vw,116px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
          <div>
            <Eyebrow>See more, walk less</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,3.8vw,48px)", lineHeight: 1.04, letterSpacing: "-.02em", margin: "14px 0 0", color: "#fff" }}>
              A few hundred boats fit the docks.<br />You can browse thousands.
            </h2>
            <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "rgba(255,255,255,.75)", margin: "20px 0 0", maxWidth: "52ch" }}>
              There&rsquo;s only so much room at the slips. Online, you explore every presenting dealer&rsquo;s full lineup, on-site and off, weighing thousands of options from your couch, then spending show day only on the boats worth boarding.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(22px,4vw,48px)", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(44px,6vw,72px)", lineHeight: 1, color: "rgba(255,255,255,.42)" }}>~200</div>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".06em", color: "rgba(255,255,255,.5)", marginTop: 8, maxWidth: "16ch" }}>boats you can walk in a weekend</div>
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,.3)", paddingBottom: 18 }}>→</div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(64px,9vw,116px)", lineHeight: 1, color: "var(--accent)" }}>3,400<span style={{ fontSize: ".5em" }}>+</span></div>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".06em", color: "#fff", marginTop: 8, maxWidth: "18ch" }}>vessels to browse before you go</div>
            </div>
          </div>
        </div>
      </section>

      {/* GUIDE / PILLARS */}
      <section style={{ background: "#F4F1EA", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>Your guide on the water</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0", maxWidth: "20ch" }}>The whole show, in one clean dashboard.</h2>
          <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "#4c6270", margin: "20px 0 0", maxWidth: "62ch" }}>
            Buoy brings the In-Water Boat Show online, gathering every dock, dealer, and off-site lot into a single, searchable index, so you can compare every boat at the show in one place, long before you set foot on the dock.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 18, marginTop: 44 }}>
            {[
              ["01", "Feet on the Deck", "The best call you’ll make is standing on the boat, so do your homework online, then step aboard only the ones worth your time. No pressure, no hard sell, just your shortlist waiting at the slip."],
              ["02", "Always-live availability", "Every listing updates live and hourly, so what you see online is exactly what’s floating at the dock, with no calling around, no stale listings, no wasted trips."],
              ["03", "More than fits the docks", "Can’t find your exact layout at the slips? You’re instantly matched with the same boat at the dealer’s other locations, so your choices are never capped by dock space."],
            ].map(([n, h, body]) => (
              <div key={n} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 20, padding: "30px 26px" }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: "var(--accent)", lineHeight: 1 }}>{n}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, margin: "16px 0 10px", letterSpacing: "-.01em" }}>{h}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.58, color: "#5a6c78", margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 STEPS */}
      <section id="plan" style={{ scrollMarginTop: 82, background: "#E9EEEE", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>Your game plan</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.6vw,56px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: "14px 0 0", maxWidth: "16ch" }}>4 steps to boat show success.</h2>
          <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "#4c6270", margin: "18px 0 42px", maxWidth: "56ch" }}>From ticket to trade to the deck. Here&rsquo;s exactly how to win the weekend before it even starts.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 18 }}>
            {[
              ["01", "Pre-purchase your tickets", "Grab your in-water show tickets right now and unlock a 48-hour sneak peek at every vessel headed to the docks.", "Get tickets →", "#unlock"],
              ["02", "Value your current boat", "Submit your boat to our valuation engine and get quotes from every show dealer. Trade it or sell it. We want them all.", "Value my boat →", "/sell"],
              ["03", "Book your Boat Show Only Deal", "Set your appointment and lock in pricing you’ll only find at the show. The best deals happen here, so don’t be the one who missed out.", "Book my appointment →", "#unlock"],
            ].map(([n, h, body, cta, href]) => (
              <div key={n} className="card-lift" style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 20, padding: "28px 26px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, lineHeight: 1, color: "var(--accent)" }}>{n}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, margin: "16px 0 10px", letterSpacing: "-.01em" }}>{h}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.55, color: "#5a6c78", margin: "0 0 18px" }}>{body}</p>
                <Link href={href} className="link-ink" style={{ marginTop: "auto", fontFamily: MONO, fontSize: 12, letterSpacing: ".06em", color: "var(--accent)" }}>{cta}</Link>
              </div>
            ))}
            <div style={{ background: "#0A2138", color: "#fff", borderRadius: 20, padding: "28px 26px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,106,62,.25), transparent 70%)", pointerEvents: "none" }} />
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, lineHeight: 1, color: "var(--accent)" }}>04</div>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, margin: "16px 0 10px", letterSpacing: "-.01em", color: "#fff" }}>Show up &amp; set sail</h3>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: "rgba(255,255,255,.75)", margin: "0 0 18px" }}>Arrive for your appointment and experience the seamless service the Atlantic City In-Water Boat Show and Virtual Boat Show give every boater.</p>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 12, letterSpacing: ".06em", color: "var(--accent)" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--accent)", color: "#0A2138", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</span>Boat show success
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INVENTORY */}
      <section id="docks" style={{ scrollMarginTop: 82, background: "#F4F1EA", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div>
              <Eyebrow>Boat show inventory</Eyebrow>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0", maxWidth: "18ch" }}>Every hull at the show, in one index.</h2>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#fff", border: "1px solid rgba(11,34,56,.12)", borderRadius: 999, padding: "9px 16px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34C778", animation: "livePulse 2.4s infinite" }} />
              <span style={{ fontFamily: MONO, fontSize: 12, color: "#3d5260" }}>{fmt(vesselCount)} synced · updates hourly</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", margin: "28px 0 30px" }}>
            {["All docks", "F Dock", "E Dock", "Center consoles", "Under $300k", "Off-site lot"].map((c, i) => (
              <span key={c} style={{ background: i === 0 ? "#0A2138" : "#fff", color: i === 0 ? "#fff" : "#3d5260", border: i === 0 ? "none" : "1px solid rgba(11,34,56,.14)", fontFamily: MONO, fontSize: 12, letterSpacing: ".05em", padding: "8px 15px", borderRadius: 999 }}>{c}</span>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <AdSlot label="Presenting sponsor banner · 970×90" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,250px),1fr))", gap: 18 }}>
            {VESSELS.slice(0, 4).map((v) => (
              <VesselCard key={v.name} v={v} revealed={revealed} />
            ))}
            <div style={{ gridColumn: "1 / -1" }}>
              <AdSlot label="Sponsor / vendor in-feed banner" tag="SPONSORED · IN-FEED" height={120} accent />
            </div>
            {VESSELS.slice(4).map((v) => (
              <VesselCard key={v.name} v={v} revealed={revealed} />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginTop: 30 }}>
            <p style={{ fontFamily: MONO, fontSize: 12, color: "#7c8b96", margin: 0, maxWidth: "52ch", lineHeight: 1.5 }}>
              Pricing is gated until you verify your show ticket. Off-site units are dynamically paired from each dealer&rsquo;s brick-and-mortar showroom.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/inventory" className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#0A2138", fontWeight: 700, fontSize: 15, padding: "14px 22px", borderRadius: 999, border: "1px solid rgba(11,34,56,.16)" }}>Browse full inventory →</Link>
              <button onClick={() => openModal()} className="btn-invert" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0A2138", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 22px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Unlock all Boat Show Prices →</button>
            </div>
          </div>
        </div>
      </section>

      {/* TRADE-IN */}
      <section id="trade" style={{ scrollMarginTop: 82, background: "#0A2138", color: "#fff", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: "clamp(32px,5vw,64px)", alignItems: "start" }}>
          <div>
            <Eyebrow>Sell / Trade · WeBuyAnyBoat</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,50px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0", color: "#fff", maxWidth: "16ch" }}>Know your boat&rsquo;s worth before you walk the docks.</h2>
            <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "rgba(255,255,255,.75)", margin: "20px 0 34px", maxWidth: "52ch" }}>Our low-friction trade path takes three quick steps, then hands you a real market range and a dockside appraisal slot with the local brand expert.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                ["01", "Tell us the basics", "Year, make, model & length."],
                ["02", "Add the details", "Condition, features, and the engine hours that move the needle most."],
                ["03", "Lock your value", "Get a market range plus a Boat Show Trade-In Bonus and appraisal time slot."],
              ].map(([n, h, body], i) => (
                <div key={n} style={{ display: "flex", gap: 16, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,.14)", borderBottom: i === 2 ? "1px solid rgba(255,255,255,.14)" : undefined }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, color: "var(--accent)", fontWeight: 700, flex: "0 0 auto" }}>{n}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{h}</div>
                    <div style={{ fontSize: 14.5, color: "rgba(255,255,255,.62)", marginTop: 3 }}>{body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", color: "#0A2138", borderRadius: 22, padding: "clamp(24px,3vw,34px)", boxShadow: "0 30px 70px -30px rgba(0,0,0,.5)" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 19, letterSpacing: "-.01em", lineHeight: 1.1 }}>Dealers Compete For Your Boat</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              {[["YEAR / MAKE / MODEL", "2019 Sea Ray SLX 250"], ["ENGINE HOURS", "210"]].map(([lab, val]) => (
                <label key={lab} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: "#7c8b96" }}>{lab}</span>
                  <input defaultValue={val} style={{ border: "1px solid rgba(11,34,56,.18)", borderRadius: 10, padding: "11px 12px", fontSize: 14, color: "#0A2138", background: "#F8F6F1" }} />
                </label>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              {[["LENGTH", "25 ft"], ["CONDITION", "Excellent"]].map(([lab, val]) => (
                <label key={lab} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: "#7c8b96" }}>{lab}</span>
                  <input defaultValue={val} style={{ border: "1px solid rgba(11,34,56,.18)", borderRadius: 10, padding: "11px 12px", fontSize: 14, color: "#0A2138", background: "#F8F6F1" }} />
                </label>
              ))}
            </div>
            <div style={{ marginTop: 16, background: "#EDF6F0", border: "1px solid rgba(23,138,90,.3)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: "#178a5a" }}>ESTIMATED SHOW VALUE</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: "#0A2138", marginTop: 4 }}>$58,400-$64,900</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <Check size={20} />
                <span style={{ fontFamily: MONO, fontSize: 11, color: "#3d5260" }}>Boat Show Trade-In Bonus active · dockside appraisal ready</span>
              </div>
            </div>
            <Link href="/sell" className="h-brighten" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 12 }}>Value My Current Boat →</Link>
          </div>
        </div>
      </section>

      {/* SUCCESS / PAYOFF */}
      <section style={{ background: "#F4F1EA", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: "clamp(32px,5vw,64px)", alignItems: "center" }}>
          <div>
            <Eyebrow>SB7 · The payoff</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0", maxWidth: "15ch" }}>Walk past the lines. Straight to the deck.</h2>
            <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "#4c6270", margin: "20px 0 28px", maxWidth: "52ch" }}>This is show day, handled: your trade-in is already appraised, your pricing incentives are unlocked, and a dedicated captain is waiting at the slip for your private walkthrough.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Skip the ticket-line chaos", "Trade-in value locked in advance", "Exclusive Boat Show Pricing revealed", "VIP dockside walkthrough booked"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Check /><span style={{ fontSize: 16.5, fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* dock pass card */}
          <div style={{ position: "relative", background: "#0A2138", color: "#fff", borderRadius: 22, padding: "clamp(26px,3vw,38px)", boxShadow: "0 30px 70px -34px rgba(10,33,56,.7)", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,106,62,.28), transparent 70%)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".22em", color: "rgba(255,255,255,.6)" }}>BUOY · SHOW PASS</div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", background: "var(--accent)", color: "#0A2138", padding: "4px 10px", borderRadius: 999, fontWeight: 700 }}>UNLOCKED</div>
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(38px,5vw,56px)", lineHeight: 1, marginTop: 26, letterSpacing: "-.02em" }}>F DOCK</div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 8 }}>SLIP 12 · 10:30 AM WALKTHROUGH</div>
            <div style={{ borderTop: "1.5px dashed rgba(255,255,255,.22)", margin: "26px 0", position: "relative" }}>
              <span style={{ position: "absolute", left: -38, top: -11, width: 22, height: 22, borderRadius: "50%", background: "#F4F1EA" }} />
              <span style={{ position: "absolute", right: -38, top: -11, width: 22, height: 22, borderRadius: "50%", background: "#F4F1EA" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              {[
                ["YOUR CAPTAIN", "Capt. Marco Reyes", "#fff"],
                ["TRADE-IN", "Appraised ✓", "var(--accent)"],
                ["INCENTIVES", "Applied ✓", "var(--accent)"],
              ].map(([lab, val, col]) => (
                <div key={lab}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".12em", color: "rgba(255,255,255,.5)" }}>{lab}</div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginTop: 5, color: col }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA / TICKET GATE */}
      <section id="unlock" style={{ scrollMarginTop: 82, background: "#050F1A", color: "#fff", padding: "clamp(74px,10vw,132px) clamp(18px,5vw,56px)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,106,62,.16), transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>Unlock the show</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(32px,5vw,64px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: "16px 0 0", color: "#fff" }}>Enter your ticket.<br />Unlock every price.</h2>
          <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "rgba(255,255,255,.75)", margin: "20px auto 32px", maxWidth: "52ch" }}>Ticket holders get live Boat Show Pricing and appointment booking 5-7 days before doors open. Drop in your confirmation number to light up the docks.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: 540, margin: "0 auto" }}>
            <input
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onUnlock(); }}
              placeholder="Ticket confirmation #  ·  e.g. ACBS-4192"
              style={{ flex: "1 1 260px", minWidth: 0, background: "rgba(255,255,255,.08)", border: "1.5px solid rgba(255,255,255,.24)", borderRadius: 999, padding: "16px 22px", fontSize: 15, color: "#fff", outline: "none" }}
            />
            <button onClick={onUnlock} className="h-lift" style={{ flex: "0 0 auto", background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 15.5, padding: "16px 28px", borderRadius: 999, border: "none", cursor: "pointer" }}>Unlock Boat Show Pricing</button>
          </div>
          {unlocked ? (
            <div style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(52,199,120,.14)", border: "1px solid rgba(52,199,120,.4)", borderRadius: 999, padding: "10px 18px" }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#34C778", color: "#0A2138", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</span>
              <span style={{ fontSize: 14.5, color: "#fff" }}>Access unlocked. Live pricing is now visible across every dock. Scroll up to browse.</span>
            </div>
          ) : (
            <div style={{ marginTop: 20, fontFamily: MONO, fontSize: 12, letterSpacing: ".05em", color: "rgba(255,255,255,.55)" }}>No ticket yet? Grab one at the box office, and access opens automatically.</div>
          )}
        </div>
      </section>

      {/* DEALERS */}
      <section id="dealers" style={{ scrollMarginTop: 82, background: "#F4F1EA", padding: "clamp(64px,8vw,112px) clamp(18px,5vw,56px)", borderTop: "1px solid rgba(11,34,56,.1)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>The whole network, on your side</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.6vw,44px)", lineHeight: 1.06, letterSpacing: "-.02em", margin: "14px auto 0", maxWidth: "22ch" }}>Every dealer at the show, competing for your business.</h2>
          <p style={{ fontSize: "clamp(16px,1.2vw,18px)", lineHeight: 1.6, color: "#4c6270", margin: "18px auto 28px", maxWidth: "60ch" }}>One marketplace brings all 20 presenting dealers together, with full lineups on-site and off, so you compare freely and the best offer comes to you. No driving lot to lot, no haggling in the dark. Just the whole show working in your favor.</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
            <Link href="#docks" className="btn-invert" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0A2138", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 24px", borderRadius: 999 }}>Browse the marketplace →</Link>
            <Link href="/vendors" className="link-ink" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".05em", color: "#7c8b96" }}>Run a dealership? Join the lineup →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginTop: 44 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 60, border: "1px dashed rgba(11,34,56,.22)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: "rgba(11,34,56,.4)" }}>DEALER LOGO</div>
            ))}
          </div>
        </div>
      </section>

      {/* VENDORS & SERVICES */}
      <section id="vendors" style={{ scrollMarginTop: 82, background: "#E9EEEE", padding: "clamp(70px,9vw,120px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>More than boats</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0", maxWidth: "20ch" }}>Everything else your boat needs, in one place.</h2>
          <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "#4c6270", margin: "20px 0 44px", maxWidth: "62ch" }}>The show isn&rsquo;t just dealers. Browse trusted vendors for financing, insurance, electronics, storage, gear, and service, all in the same marketplace, so you can outfit and protect your boat without ever leaving the docks.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 16 }}>
            {[
              ["Financing & Lending", "Get pre-qualified and compare rates before you ever sign."],
              ["Insurance", "Quote and bind the right coverage the moment you buy."],
              ["Electronics & Nav", "Radar, GPS, and sound systems, spec’d and installed by the show."],
              ["Docking & Storage", "Line up a slip or winter storage near your home water."],
              ["Gear & Apparel", "Safety kit, watersports gear, and crew apparel for launch day."],
              ["Service & Maintenance", "Book winterization, detailing, and repowers with local pros."],
            ].map(([h, body]) => (
              <div key={h} className="card-lift-sm" style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--accent)" }} />
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, margin: "2px 0 0", letterSpacing: "-.01em" }}>{h}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "#5a6c78", margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 30 }}>
            <Link href="/vendors" className="link-ink" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".05em", color: "#7c8b96" }}>Are you a vendor? Get a free listing →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
