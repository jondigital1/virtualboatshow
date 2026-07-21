"use client";

import Link from "next/link";
import { useState } from "react";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { AdSlot } from "@/components/VesselCard";
import { DISPLAY, MONO, fmt } from "@/components/ui";

/* ── Boat data (sample; a real feed would key off the [slug]) ─────────── */
const BOAT = {
  title: "2026 Nor-Tech 390 Sport Center Console",
  short: "2026 Nor-Tech 390 Sport",
  msrp: 1395000,
  price: 1312000,
  dealer: "South Jersey Yacht Sales",
  phone: "(609) 884-1600",
  location: "F Dock · Slip 3 · Atlantic City, NJ",
};
const phoneHref = "tel:" + BOAT.phone.replace(/[^0-9+]/g, "");

const SPEC_TILES: [string, string][] = [
  ["Engine", "Quad Mercury Racing 500R"],
  ["Total Power", "2,000 hp"],
  ["Length", "39 ft"],
  ["Beam", "10 ft"],
  ["Fuel", "285 gal"],
  ["Year", "2026"],
  ["Class", "Center Console"],
  ["Condition", "New"],
];

const HIGHLIGHTS = ["2nd-Row Seating", "Cabin A/C", "FLIR Thermal", "Radar", "SureShade", "Carbon T-Top", "Joystick Piloting"];
const THUMBS = ["Bow on plane", "Helm & dash", "Cockpit seating", "Cabin / berth", "Transom & quad 500R"];

/* Value signals — addresses buyer skepticism where the decision happens. */
const TRUST: [string, string][] = [
  ["Boat Show Price", "Locked Sept 10-13 only"],
  ["Dockside sea trial", "Run it before you buy"],
  ["Trade bid up", "Shopped to 20 dealers"],
  ["Financing on site", "Sign right at the slip"],
  ["Authorized dealer", "Factory-backed warranty"],
];

const SIMILAR = [
  ["2026 Nor-Tech 340 Sport", "34′ · Twin 450R", "$949,000", "repeating-linear-gradient(135deg,#ccd8dc 0 14px,#c3d0d5 14px 28px)"],
  ["2026 Nor-Tech 450 Sport", "45′ · Quad 500R", "$1,895,000", "repeating-linear-gradient(135deg,#d7ddd1 0 14px,#ced5c7 14px 28px)"],
  ["2024 Statement 350 Open", "35′ · Twin 450R", "$365,000", "repeating-linear-gradient(135deg,#d1dae0 0 14px,#c7d1d8 14px 28px)"],
];

const SPEC_GROUPS: [string, [string, string][]][] = [
  ["Dimensions", [["Length Overall", "39 ft"], ["Beam", "10 ft"], ["Fuel Capacity", "285 gal"]]],
  ["Propulsion", [["Engines", "4 × Mercury Racing 500R"], ["Power / Engine", "500 hp"], ["Drive", "Outboard · Gasoline"], ["Total Power", "2,000 hp"]]],
  ["Details", [["Class", "Center Console"], ["Year", "2026"], ["Condition", "New"], ["Hull", "Fiberglass"]]],
];

const TERMS: [number, string][] = [[120, "10 yr"], [180, "15 yr"], [240, "20 yr"]];

const tile: React.CSSProperties = { background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 14, padding: "15px 16px" };
const tileLabel: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: "#8595a0", textTransform: "uppercase" };
const chip: React.CSSProperties = { background: "#fff", border: "1px solid rgba(11,34,56,.14)", borderRadius: 999, padding: "8px 14px", fontSize: 13.5, color: "#33454f" };

const scrollToRequest = () => document.getElementById("request")?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function VDP() {
  const [saved, setSaved] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [price, setPrice] = useState(BOAT.price);
  const [downPct, setDownPct] = useState(10);
  const [apr, setApr] = useState(7.49);
  const [term, setTerm] = useState(240);

  const down = Math.round((price * downPct) / 100);
  const loan = Math.max(0, price - down);
  const r = apr / 1200;
  const monthly = r > 0 ? (loan * r) / (1 - Math.pow(1 + r, -term)) : loan / term;
  const showMonthly = "$" + fmt(monthly);

  return (
    <>
      <AnnouncementBar />
      <Nav active="/inventory" />

      {/* TITLE HEADER */}
      <section style={{ background: "#F4F1EA", padding: "clamp(20px,2.5vw,32px) clamp(18px,3vw,44px) 0" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: MONO, fontSize: 11.5, letterSpacing: ".1em", color: "#8595a0", flexWrap: "wrap" }}>
            <Link href="/" className="link-ink" style={{ color: "#8595a0" }}>HOME</Link><span>/</span>
            <Link href="/inventory" className="link-ink" style={{ color: "#8595a0" }}>INVENTORY</Link><span>/</span>
            <span>CENTER CONSOLE</span><span>/</span><span style={{ color: "#0A2138" }}>NOR-TECH</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 14 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".14em", color: "var(--accent)", textTransform: "uppercase" }}>New · At the show</div>
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(27px,3.4vw,46px)", lineHeight: 1.02, letterSpacing: "-.025em", margin: "8px 0 0" }}>{BOAT.title}</h1>
              <div style={{ display: "flex", gap: "8px 16px", flexWrap: "wrap", marginTop: 12, fontFamily: MONO, fontSize: 12.5, color: "#3d5260" }}>
                <span>39′ Center Console</span><span style={{ opacity: 0.4 }}>·</span>
                <span>Quad Mercury Racing 500R</span><span style={{ opacity: 0.4 }}>·</span>
                <span style={{ color: "#0A2138" }}>{BOAT.location}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: MONO, fontSize: 11.5, color: "#8595a0" }}>1,142 views · 10 saved</span>
              <button onClick={() => setSaved((s) => !s)} className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", border: "1px solid rgba(11,34,56,.16)", borderRadius: 999, padding: "9px 15px", cursor: "pointer", color: saved ? "var(--accent)" : "#3d5260", fontWeight: 600, fontSize: 13.5 }}>
                <span style={{ fontSize: 15 }}>{saved ? "♥" : "♡"}</span>{saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN */}
      <section style={{ background: "#F4F1EA", padding: "clamp(20px,2.5vw,30px) clamp(18px,3vw,44px) clamp(48px,6vw,80px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", gap: "clamp(20px,2.5vw,36px)", alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* LEFT */}
          <div style={{ flex: "1 1 580px", minWidth: 0 }}>
            {/* GALLERY */}
            <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", aspectRatio: "16/10", boxShadow: "0 24px 54px -30px rgba(10,33,56,.5)", background: "repeating-linear-gradient(135deg,#ccd8dc 0 16px,#c3d0d5 16px 32px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".16em", color: "rgba(10,33,56,.4)" }}>{THUMBS[activeThumb].toUpperCase()}</span>
              <span style={{ position: "absolute", top: 12, left: 12, fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", background: "var(--accent)", color: "#0A2138", fontWeight: 700, padding: "5px 10px", borderRadius: 6 }}>▶ VIDEO TOUR</span>
              <span style={{ position: "absolute", bottom: 12, right: 12, fontFamily: MONO, fontSize: 11, background: "rgba(8,24,41,.82)", color: "#fff", padding: "6px 11px", borderRadius: 8 }}>1 / 81 photos</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginTop: 10 }}>
              {THUMBS.map((label, i) => (
                <button key={label} onClick={() => setActiveThumb(i)} style={{ padding: 0, border: `2px solid ${activeThumb === i ? "var(--accent)" : "transparent"}`, borderRadius: 11, overflow: "hidden", aspectRatio: "4/3", cursor: "pointer", position: "relative", background: "repeating-linear-gradient(135deg,#d7ddd1 0 12px,#ced5c7 12px 24px)" }}>
                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 8, letterSpacing: ".05em", color: "rgba(10,33,56,.45)", textAlign: "center", padding: 4 }}>{label}</span>
                  {i === 4 && <span style={{ position: "absolute", inset: 0, background: "rgba(8,24,41,.62)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>+76</span>}
                </button>
              ))}
            </div>

            {/* TRUST / VALUE BAND */}
            <div style={{ marginTop: 20, background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 16, padding: "8px 6px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,150px),1fr))" }}>
              {TRUST.map(([t, sub]) => (
                <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px" }}>
                  <span style={{ flex: "0 0 auto", width: 20, height: 20, borderRadius: "50%", background: "rgba(23,138,90,.14)", color: "#178a5a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, marginTop: 1 }}>✓</span>
                  <div>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, letterSpacing: "-.01em", lineHeight: 1.15 }}>{t}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#7c8b96", marginTop: 3, lineHeight: 1.3 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* SPEC TILES */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,140px),1fr))", gap: 10, marginTop: 24 }}>
              {SPEC_TILES.map(([lab, val]) => (
                <div key={lab} style={tile}>
                  <div style={tileLabel}>{lab}</div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: lab === "Engine" || lab === "Class" ? 15 : 20, marginTop: 6, lineHeight: 1.15 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* HIGHLIGHTS */}
            <div style={{ marginTop: 32 }}>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".16em", color: "var(--accent)", textTransform: "uppercase" }}>Highlights</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                {HIGHLIGHTS.map((h) => <span key={h} style={chip}>{h}</span>)}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div style={{ marginTop: 32, background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 18, padding: "clamp(22px,2.5vw,30px)" }}>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, margin: "0 0 12px", letterSpacing: "-.01em" }}>About this boat</h2>
              <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "#42555f", margin: "0 0 14px" }}>A true showpiece 390, rigged with <strong style={{ color: "#0A2138" }}>quad Mercury Racing 500Rs</strong>: 2,000 horsepower of offshore performance with confident handling in any sea state. Nicely equipped with second-row seating, cabin air conditioning, FLIR, radar, and a SureShade to keep the cockpit cool.</p>
              <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "#42555f", margin: 0 }}>Presented at the Atlantic City In-Water Boat Show by {BOAT.dealer}, an authorized Nor-Tech dealer. Trades accepted; financing and worldwide delivery available. Book a dockside walkthrough to step aboard before the crowds.</p>
            </div>

            {/* FULL SPECS */}
            <div style={{ marginTop: 24, background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 18, padding: "clamp(22px,2.5vw,30px)" }}>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, margin: "0 0 18px", letterSpacing: "-.01em" }}>Full specifications</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "24px 40px" }}>
                {SPEC_GROUPS.map(([group, rows]) => (
                  <div key={group}>
                    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 6 }}>{group}</div>
                    {rows.map(([k, v], idx) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: idx < rows.length - 1 ? "1px solid rgba(11,34,56,.08)" : undefined, fontSize: 14.5 }}>
                        <span style={{ color: "#7c8b96" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* PAYMENT CALCULATOR */}
            <div id="calc" style={{ marginTop: 24, background: "#0A2138", color: "#fff", borderRadius: 18, padding: "clamp(24px,3vw,34px)", scrollMarginTop: 76 }}>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".16em", color: "var(--accent)", textTransform: "uppercase" }}>Boat loan calculator</div>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, margin: "10px 0 22px", color: "#fff", letterSpacing: "-.01em" }}>Estimate your monthly payment</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "26px 36px", alignItems: "center" }}>
                <div>
                  <Slider label="Purchase price" value={"$" + fmt(price)} min={200000} max={1600000} step={5000} v={price} onChange={setPrice} />
                  <Slider label={`Down payment · ${downPct}%`} value={"$" + fmt(down)} min={0} max={40} step={1} v={downPct} onChange={setDownPct} top />
                  <Slider label="Interest rate (APR)" value={apr + "%"} min={4} max={12} step={0.25} v={apr} onChange={setApr} top />
                  <div style={{ marginTop: 22, fontSize: 13.5, color: "rgba(255,255,255,.72)", marginBottom: 10 }}>Loan term</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {TERMS.map(([v, l]) => {
                      const on = term === v;
                      return <button key={v} onClick={() => setTerm(v)} style={{ fontFamily: MONO, fontSize: 12, padding: "9px 15px", borderRadius: 999, cursor: "pointer", background: on ? "var(--accent)" : "rgba(255,255,255,.06)", color: on ? "#0A2138" : "#fff", border: `1px solid ${on ? "var(--accent)" : "rgba(255,255,255,.3)"}` }}>{l}</button>;
                    })}
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 16, padding: 26, textAlign: "center" }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,.6)", textTransform: "uppercase" }}>Estimated payment</div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(38px,5vw,52px)", lineHeight: 1, margin: "10px 0 4px", color: "#fff" }}>{showMonthly}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,.6)" }}>per month</div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,.14)", margin: "20px 0 0", paddingTop: 16, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,.72)" }}><span>Amount financed</span><span style={{ color: "#fff", fontWeight: 700 }}>${fmt(loan)}</span></div>
                  <Link href="/#unlock" className="h-brighten" style={{ display: "block", marginTop: 18, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 14.5, padding: 13, borderRadius: 12, textAlign: "center" }}>Get pre-qualified →</Link>
                </div>
              </div>
              <p style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(255,255,255,.45)", margin: "18px 0 0", lineHeight: 1.5 }}>Estimate only. Actual terms depend on credit approval, taxes, and fees. Rates shown for illustration.</p>
            </div>

            {/* INLINE LEAD FORM */}
            <RequestForm monthly={showMonthly} />

            {/* SIMILAR */}
            <div style={{ marginTop: 32 }}>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, margin: "0 0 16px", letterSpacing: "-.01em" }}>More from {BOAT.dealer}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,210px),1fr))", gap: 14 }}>
                {SIMILAR.map(([name, spec, priceLabel, bg]) => (
                  <Link key={name} href="/inventory/nor-tech-340" className="card-lift" style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", color: "inherit" }}>
                    <div style={{ aspectRatio: "16/11", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 10, color: "rgba(10,33,56,.4)" }}>// PHOTO</div>
                    <div style={{ padding: "13px 14px" }}>
                      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15 }}>{name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 11, color: "#5a6c78", marginTop: 4 }}>{spec}</div>
                      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, marginTop: 8 }}>{priceLabel}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: BUY BOX */}
          <div style={{ flex: "0 1 366px", minWidth: 280, position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid rgba(11,34,56,.12)", borderRadius: 18, padding: 22, boxShadow: "0 20px 46px -30px rgba(10,33,56,.4)" }}>
              {/* price breakdown */}
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 12, color: "#7c8b96" }}>
                <span>MSRP</span><span style={{ textDecoration: "line-through" }}>${fmt(BOAT.msrp)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 12, color: "#178a5a", fontWeight: 700, marginTop: 6 }}>
                <span>Boat Show savings</span><span>− ${fmt(BOAT.msrp - BOAT.price)}</span>
              </div>
              <div style={{ borderTop: "1px solid rgba(11,34,56,.1)", margin: "12px 0", paddingTop: 12 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: "var(--accent)" }}>BOAT SHOW PRICE</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, color: "#0A2138", letterSpacing: "-.01em", lineHeight: 1, marginTop: 4 }}>${fmt(BOAT.price)}</div>
                <button onClick={() => document.getElementById("calc")?.scrollIntoView({ behavior: "smooth", block: "start" })} style={{ fontFamily: MONO, fontSize: 12, color: "#3d5260", marginTop: 8, background: "none", border: "none", cursor: "pointer", padding: 0, textDecorationLine: "underline", textUnderlineOffset: 2 }}>est. {showMonthly}/mo · calculate</button>
              </div>
              {/* urgency */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FBF1EC", border: "1px solid rgba(242,106,62,.3)", borderRadius: 10, padding: "9px 12px", marginBottom: 14 }}>
                <span>⏳</span><span style={{ fontFamily: MONO, fontSize: 11, color: "#b3521f", lineHeight: 1.4 }}>Boat Show pricing — Sept 10-13 only</span>
              </div>
              <button onClick={scrollToRequest} className="h-brighten" style={{ width: "100%", background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 15.5, padding: 15, borderRadius: 12, border: "none", cursor: "pointer" }}>Set Boat Show Appointment →</button>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <a href={phoneHref} className="btn-outline" style={{ flex: 1, textAlign: "center", background: "#fff", color: "#0A2138", fontWeight: 700, fontSize: 14, padding: "12px 8px", borderRadius: 12, border: "1px solid rgba(11,34,56,.18)" }}>Call dealer</a>
                <Link href="/sell" className="btn-outline" style={{ flex: 1, textAlign: "center", background: "#fff", color: "#0A2138", fontWeight: 700, fontSize: 14, padding: "12px 8px", borderRadius: 12, border: "1px solid rgba(11,34,56,.18)" }}>Value trade-in</Link>
              </div>
            </div>

            {/* DEALER CARD */}
            <div style={{ background: "#fff", border: "1px solid rgba(11,34,56,.12)", borderRadius: 18, padding: 20 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "#8595a0", textTransform: "uppercase" }}>Listed by</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                <div style={{ width: 46, height: 46, flex: "0 0 auto", borderRadius: 12, background: "#0A2138", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 17 }}>SJ</div>
                <div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16 }}>{BOAT.dealer}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: "#7c8b96", marginTop: 2 }}>{BOAT.location}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                {[["18", "ACTIVE", "#0A2138"], ["67", "SOLD", "#0A2138"], ["4.9", "RATING", "#178a5a"]].map(([n, l, col]) => (
                  <div key={l} style={{ flex: 1, background: "#F6F4EE", borderRadius: 10, padding: 11, textAlign: "center" }}>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, color: col }}>{n}</div>
                    <div style={{ fontFamily: MONO, fontSize: 9.5, color: "#8595a0", letterSpacing: ".05em" }}>{l}</div>
                  </div>
                ))}
              </div>
              <a href={phoneHref} className="link-ink" style={{ display: "block", fontFamily: MONO, fontSize: 12.5, color: "var(--accent)", marginTop: 14, fontWeight: 700 }}>{BOAT.phone} →</a>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "#8595a0", marginTop: 8 }}>✓ Authorized Nor-Tech dealer</div>
            </div>

            <AdSlot label="Sponsor / vendor ad" height={250} />
          </div>
        </div>
      </section>

      {/* MOBILE STICKY CTA BAR */}
      <div className="vdp-mobile-bar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".1em", color: "var(--accent)" }}>BOAT SHOW PRICE</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 19, color: "#fff", lineHeight: 1.1 }}>${fmt(BOAT.price)} <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,.6)" }}>· {showMonthly}/mo</span></div>
        </div>
        <a href={phoneHref} aria-label="Call dealer" style={{ flex: "0 0 auto", width: 46, height: 46, borderRadius: 12, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✆</a>
        <button onClick={scrollToRequest} className="h-brighten" style={{ flex: "0 0 auto", background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 14.5, padding: "13px 18px", borderRadius: 12, border: "none", cursor: "pointer" }}>Set Appointment</button>
      </div>
      <div className="vdp-mobile-spacer" />

      <Footer />
    </>
  );
}

/* ── Inline lead-capture: the primary conversion form ─────────────────── */
function RequestForm({ monthly }: { monthly: string }) {
  const [form, setForm] = useState({ firstName: "", email: "", phone: "", day: "Sat · Sept 12" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "vdp-appointment", boat: BOAT.short, price: BOAT.price, dealer: BOAT.dealer, ...form }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  const input: React.CSSProperties = { width: "100%", background: "#F8F6F1", border: "1px solid rgba(11,34,56,.16)", borderRadius: 11, padding: "13px 14px", fontSize: 15, color: "#0A2138", outline: "none" };
  const lab: React.CSSProperties = { display: "block", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", color: "#7c8b96", marginBottom: 6, textTransform: "uppercase" };

  return (
    <div id="request" style={{ marginTop: 24, background: "#fff", border: "2px solid var(--accent)", borderRadius: 18, padding: "clamp(22px,2.5vw,32px)", scrollMarginTop: 76 }}>
      {status === "done" ? (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(23,138,90,.12)", color: "#178a5a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>✓</div>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, margin: "0 0 10px", letterSpacing: "-.01em" }}>You&rsquo;re on the list.</h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#4c6270", margin: "0 auto", maxWidth: "42ch" }}>{BOAT.dealer} will confirm your dockside time and lock in your Boat Show Price. No spam, no phone tag — one dealer, one appointment.</p>
          <button onClick={() => setStatus("idle")} className="btn-outline" style={{ marginTop: 20, background: "none", border: "1px solid rgba(11,34,56,.18)", color: "#0A2138", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 999, cursor: "pointer" }}>Send another request</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)" }}>Lock in the Boat Show Price</div>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(22px,2.4vw,28px)", margin: "10px 0 6px", letterSpacing: "-.01em" }}>Book a dockside walkthrough of this boat</h2>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: "#5a6c78", margin: "0 0 20px", maxWidth: "52ch" }}>Reserve a private time to step aboard the {BOAT.short} at the show. We&rsquo;ll confirm your slot and hold your show price — est. {monthly}/mo.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 14 }}>
            <div><label style={lab}>First name</label><input style={input} value={form.firstName} onChange={set("firstName")} placeholder="Alex" required /></div>
            <div><label style={lab}>Email</label><input style={input} type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" required /></div>
            <div><label style={lab}>Phone</label><input style={input} type="tel" value={form.phone} onChange={set("phone")} placeholder="(555) 555-5555" required /></div>
            <div><label style={lab}>Preferred day</label>
              <select style={{ ...input, appearance: "none", WebkitAppearance: "none" }} value={form.day} onChange={set("day")}>
                <option>Thu · Sept 10</option><option>Fri · Sept 11</option><option>Sat · Sept 12</option><option>Sun · Sept 13</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={status === "sending"} className="h-brighten" style={{ width: "100%", marginTop: 18, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 16, padding: 16, borderRadius: 12, border: "none", cursor: status === "sending" ? "default" : "pointer", opacity: status === "sending" ? 0.7 : 1 }}>
            {status === "sending" ? "Sending…" : "Request my dockside appointment →"}
          </button>
          {status === "error" && <p style={{ fontSize: 13, color: "#b3261e", margin: "12px 0 0", textAlign: "center" }}>Something went wrong — please try again, or call {BOAT.phone}.</p>}
          <p style={{ fontFamily: MONO, fontSize: 10.5, color: "#9aa7b0", textAlign: "center", margin: "14px 0 0", lineHeight: 1.5 }}>Free & no obligation. We only use this to set your appointment.</p>
        </form>
      )}
    </div>
  );
}

function Slider({ label, value, min, max, step, v, onChange, top }: { label: string; value: string; min: number; max: number; step: number; v: number; onChange: (n: number) => void; top?: boolean }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: top ? "22px 0 9px" : "0 0 9px" }}>
        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,.72)" }}>{label}</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14 }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => onChange(+e.target.value)} style={{ width: "100%" }} />
    </>
  );
}
