"use client";

import Link from "next/link";
import { useState } from "react";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { AdSlot } from "@/components/VesselCard";
import { DISPLAY, MONO, fmt } from "@/components/ui";

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

export default function VDP() {
  const [saved, setSaved] = useState(false);
  const [booked, setBooked] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [price, setPrice] = useState(1312000);
  const [downPct, setDownPct] = useState(10);
  const [apr, setApr] = useState(7.49);
  const [term, setTerm] = useState(240);

  const down = Math.round((price * downPct) / 100);
  const loan = Math.max(0, price - down);
  const r = apr / 1200;
  const monthly = r > 0 ? (loan * r) / (1 - Math.pow(1 + r, -term)) : loan / term;

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
            <span style={{ background: "#0A2138", color: "#fff", padding: "3px 8px", borderRadius: 5, letterSpacing: ".14em", marginLeft: 2 }}>VDP</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 14 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".14em", color: "var(--accent)", textTransform: "uppercase" }}>New · At the show</div>
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(27px,3.4vw,46px)", lineHeight: 1.02, letterSpacing: "-.025em", margin: "8px 0 0" }}>2026 Nor-Tech 390 Sport Center Console</h1>
              <div style={{ display: "flex", gap: "8px 16px", flexWrap: "wrap", marginTop: 12, fontFamily: MONO, fontSize: 12.5, color: "#3d5260" }}>
                <span>39′ Center Console</span><span style={{ opacity: 0.4 }}>·</span>
                <span>Quad Mercury Racing 500R</span><span style={{ opacity: 0.4 }}>·</span>
                <span style={{ color: "#0A2138" }}>F Dock · Slip 3 · Atlantic City, NJ</span>
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

            {/* SPEC TILES */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,140px),1fr))", gap: 10, marginTop: 26 }}>
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
              <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "#42555f", margin: 0 }}>Presented at the Atlantic City In-Water Boat Show by South Jersey Yacht Sales, an authorized Nor-Tech dealer. Trades accepted; financing and worldwide delivery available. Book a dockside walkthrough to step aboard before the crowds.</p>
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
            <div style={{ marginTop: 24, background: "#0A2138", color: "#fff", borderRadius: 18, padding: "clamp(24px,3vw,34px)" }}>
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
                  <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(38px,5vw,52px)", lineHeight: 1, margin: "10px 0 4px", color: "#fff" }}>${fmt(monthly)}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,.6)" }}>per month</div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,.14)", margin: "20px 0 0", paddingTop: 16, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,.72)" }}><span>Amount financed</span><span style={{ color: "#fff", fontWeight: 700 }}>${fmt(loan)}</span></div>
                  <Link href="/#unlock" className="h-brighten" style={{ display: "block", marginTop: 18, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 14.5, padding: 13, borderRadius: 12, textAlign: "center" }}>Get pre-qualified →</Link>
                </div>
              </div>
              <p style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(255,255,255,.45)", margin: "18px 0 0", lineHeight: 1.5 }}>Estimate only. Actual terms depend on credit approval, taxes, and fees. Rates shown for illustration.</p>
            </div>

            {/* SIMILAR */}
            <div style={{ marginTop: 32 }}>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, margin: "0 0 16px", letterSpacing: "-.01em" }}>More from South Jersey Yacht Sales</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,210px),1fr))", gap: 14 }}>
                {SIMILAR.map(([name, spec, priceLabel, bg]) => (
                  <Link key={name} href="/inventory" className="card-lift" style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", color: "inherit" }}>
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
              <div style={{ fontFamily: MONO, fontSize: 11, color: "#9aa7b0", textDecoration: "line-through" }}>MSRP $1,395,000</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: "#0A2138", letterSpacing: "-.01em" }}>$1,312,000</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: "#178a5a", fontWeight: 700 }}>SAVE $83,000</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: "var(--accent)", marginTop: 3 }}>BOAT SHOW PRICE</div>
              <div style={{ fontFamily: MONO, fontSize: 12, color: "#7c8b96", marginTop: 8 }}>est. ${fmt(monthly)}/mo</div>
              <button onClick={() => setBooked((s) => !s)} className="h-brighten" style={{ width: "100%", marginTop: 18, background: booked ? "#178a5a" : "var(--accent)", color: booked ? "#fff" : "#0A2138", fontWeight: 700, fontSize: 15.5, padding: 15, borderRadius: 12, border: "none", cursor: "pointer" }}>{booked ? "✓ Appointment requested" : "Set Appointment for Boat Show Deal"}</button>
              <Link href="/sell" className="btn-outline" style={{ display: "block", textAlign: "center", width: "100%", marginTop: 10, background: "#fff", color: "#0A2138", fontWeight: 700, fontSize: 15, padding: 14, borderRadius: 12, border: "1px solid rgba(11,34,56,.18)" }}>Value your trade-in</Link>
            </div>

            {/* DEALER CARD */}
            <div style={{ background: "#fff", border: "1px solid rgba(11,34,56,.12)", borderRadius: 18, padding: 20 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "#8595a0", textTransform: "uppercase" }}>Listed by</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                <div style={{ width: 46, height: 46, flex: "0 0 auto", borderRadius: 12, background: "#0A2138", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 17 }}>SJ</div>
                <div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16 }}>South Jersey Yacht Sales</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: "#7c8b96", marginTop: 2 }}>F Dock · Slip 3 · Atlantic City, NJ</div>
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
              <div style={{ fontFamily: MONO, fontSize: 11, color: "var(--accent)", marginTop: 14 }}>✓ Authorized Nor-Tech dealer</div>
            </div>

            <AdSlot label="Sponsor / vendor ad" height={250} />
          </div>
        </div>
      </section>

      <Footer />
    </>
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
