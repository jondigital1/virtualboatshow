"use client";

import Link from "next/link";
import { useState } from "react";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { AdSlot } from "@/components/VesselCard";
import { DISPLAY, MONO, Eyebrow } from "@/components/ui";

type Zone = { id: string; label: string; type: "vendor" | "food" | "amenity" | "dealer"; x: number; y: number; w: number; h: number; items: string[] };

const ZONES: Zone[] = [
  { id: "elec", label: "Sails & Canvas", type: "vendor", x: 6, y: 6, w: 27, h: 18, items: ["Gioia Sails", "Bulldog Canvas", "PM Winter Boat Covers"] },
  { id: "gear", label: "Gear & Apparel", type: "vendor", x: 36, y: 6, w: 27, h: 18, items: ["Harbor Outfitters", "Viking Eyewear", "Fish Skinz"] },
  { id: "water", label: "Docks & Lifts", type: "vendor", x: 66, y: 6, w: 28, h: 18, items: ["EZ Docks", "Snap Dock", "Softub Spas"] },
  { id: "fin", label: "Finance & Insurance", type: "vendor", x: 6, y: 27, w: 27, h: 14, items: ["Marks Marine Insurance", "Intercoastal Financial", "New York Life"] },
  { id: "food", label: "Food Court & Beer Garden", type: "food", x: 36, y: 27, w: 27, h: 14, items: ["Raw bar", "BBQ & grills", "Craft beer", "Coffee"] },
  { id: "stage", label: "Main Stage & Seminars", type: "amenity", x: 66, y: 27, w: 28, h: 14, items: ["Fishing seminars", "Boater's basics", "Live demos"] },
  { id: "ent", label: "Main Entrance & Will-Call", type: "amenity", x: 6, y: 44, w: 40, h: 6, items: ["Tickets & will-call", "Info booth", "Guest services"] },
  { id: "rest", label: "Restrooms & First Aid", type: "amenity", x: 50, y: 44, w: 44, h: 6, items: ["Restrooms", "First aid", "Lost & found"] },
  { id: "A", label: "A Dock", type: "dealer", x: 5, y: 54, w: 11, h: 40, items: ["South Jersey Yacht Sales", "Sandy Hook Yacht Sales"] },
  { id: "B", label: "B Dock", type: "dealer", x: 19, y: 54, w: 11, h: 40, items: ["Clarks Landing Yacht Sales", "Schrader Yacht Sales"] },
  { id: "C", label: "C Dock", type: "dealer", x: 33, y: 54, w: 11, h: 40, items: ["Comstock Yacht Sales", "Coastal Boat Sales"] },
  { id: "D", label: "D Dock", type: "dealer", x: 47, y: 54, w: 11, h: 40, items: ["D & R Boat World", "Coty Marine"] },
  { id: "E", label: "E Dock", type: "dealer", x: 61, y: 54, w: 11, h: 40, items: ["Causeway Marine", "Riverside Marina & Yacht Sales"] },
  { id: "F", label: "F Dock", type: "dealer", x: 75, y: 54, w: 18, h: 40, items: ["MarineMax", "Henriques Yachts", "Valhalla Boat Sales"] },
];

const TYPE_ACCENT: Record<string, string> = { vendor: "var(--accent)", food: "#E0431F", amenity: "#6b7d88" };
const TYPE_LABEL: Record<string, string> = { dealer: "Dealers & Docks", vendor: "Vendor Zone", food: "Food & Drink", amenity: "Amenities" };
const CATS: [string, string][] = [["all", "All"], ["dealer", "Dealers"], ["vendor", "Vendors"], ["food", "Food & Drink"], ["amenity", "Amenities"]];

const VENDORS = [
  { name: "Gioia Sails", mark: "GIOIA SAILS", category: "Sails & Rigging", tagline: "Custom sails, cut and tuned for your hull.", tint: "#eaf1f2", ink: "#0A2138" },
  { name: "Bulldog Canvas", mark: "BULLDOG CANVAS", category: "Canvas & Covers", tagline: "Covers and enclosures built to last.", tint: "#f3efe6", ink: "#0A2138" },
  { name: "Marks Marine Insurance", mark: "MARKS MARINE", category: "Boat Insurance", tagline: "Coverage locked in before you leave the docks.", tint: "#e9eef7", ink: "#0b3f96" },
  { name: "Monmouth Marine Engines", mark: "MONMOUTH ENGINES", category: "Engines & Repower", tagline: "Repower, service, and keep her running strong.", tint: "#eaf1f2", ink: "#0A2138" },
  { name: "Sea Tow Atlantic City", mark: "SEA TOW", category: "On-Water Assistance", tagline: "Help on the water is one call away, 24/7.", tint: "#f3efe6", ink: "#0A2138" },
  { name: "Harbor Outfitters", mark: "HARBOR OUTFITTERS", category: "Gear & Apparel", tagline: "Outfit the whole crew for the season.", tint: "#eaf1f2", ink: "#0A2138" },
  { name: "Viking Eyewear", mark: "VIKING EYEWEAR", category: "Polarized Optics", tagline: "Cut the glare from bow to horizon.", tint: "#f3efe6", ink: "#0A2138" },
  { name: "Leaf Guard", mark: "LEAF GUARD", category: "Home Improvement", tagline: "One-piece, debris-shedding gutters, guaranteed.", tint: "#eaf1f2", ink: "#0A2138" },
];

const STORY = [
  ["Sails & Canvas", "Custom sails, covers, and enclosures made to fit your boat.", "Gioia Sails · Bulldog Canvas · PM Winter Covers"],
  ["Gear & Apparel", "Outfit the crew, from polarized eyewear to foul-weather gear.", "Harbor Outfitters · Viking Eyewear · Fish Skinz"],
  ["Finance & Insurance", "Get pre-qualified and insured before you leave the show.", "Marks Marine Insurance · Intercoastal Financial"],
  ["Engines & Service", "Repower, detailing, dock builds, and on-water rescue.", "Monmouth Marine Engines · Sea Tow · EZ Docks"],
];

const ADVERTISE = [
  ["01", "Banners & leaderboards", "Premium banner placements across the map, search results, and every boat detail page, seen by thousands of pre-show shoppers."],
  ["02", "Sponsored map pins", "Own a pin on the interactive show map, the very first thing buyers look for when they plan their visit."],
  ["03", "Booths & activations", "On-site booths, main-stage sponsorships, and product sampling in the highest-traffic aisles of the expo hall."],
];

export default function ShowMap() {
  const [activeZone, setActiveZone] = useState("F");
  const [category, setCategory] = useState("all");
  const active = ZONES.find((z) => z.id === activeZone) || ZONES[0];
  const vendorTrack = [...VENDORS, ...VENDORS];

  return (
    <>
      <AnnouncementBar />
      <Nav active="/map" />

      {/* HEADER */}
      <section style={{ background: "#F4F1EA", padding: "clamp(24px,3vw,40px) clamp(18px,3vw,44px) 0" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".1em", color: "#8595a0" }}>
            <Link href="/" style={{ color: "#8595a0" }} className="link-ink">HOME</Link> / SHOW MAP
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 12 }}>
            <div>
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4vw,54px)", lineHeight: 1, letterSpacing: "-.025em", margin: 0 }}>Show Map</h1>
              <p style={{ fontSize: 15.5, color: "#4c6270", margin: "12px 0 0", maxWidth: "62ch" }}>Find every dock, dealer, and vendor before you arrive, plus where to eat, park, and catch a seminar. Tap any zone to see what’s there.</p>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#fff", border: "1px solid rgba(11,34,56,.12)", borderRadius: 999, padding: "9px 16px" }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: "#3d5260" }}>Sept 10-13 · 20 dealers · 38 exhibitors</span>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <AdSlot label="Presenting sponsor banner · 970×90" height={110} />
          </div>
        </div>
      </section>

      {/* MAP */}
      <section style={{ background: "#F4F1EA", padding: "clamp(20px,2.5vw,30px) clamp(18px,3vw,44px) clamp(40px,5vw,64px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {CATS.map(([v, l]) => {
              const on = category === v;
              return <button key={v} onClick={() => setCategory(v)} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".03em", padding: "9px 15px", borderRadius: 999, cursor: "pointer", background: on ? "#0A2138" : "#fff", color: on ? "#fff" : "#3d5260", border: `1px solid ${on ? "#0A2138" : "rgba(11,34,56,.16)"}` }}>{l}</button>;
            })}
          </div>

          <div style={{ display: "flex", gap: "clamp(16px,2vw,26px)", alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* MAP CANVAS */}
            <div style={{ flex: "3 1 560px", minWidth: 0 }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/10", minHeight: 400, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(11,34,56,.14)", background: "linear-gradient(180deg,#e7edee 0%,#e7edee 44%,#123a4c 51%,#0b2b3a 100%)" }}>
                <span style={{ position: "absolute", left: "3%", top: "2.5%", fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", color: "rgba(10,33,56,.4)" }}>EXPO HALL & VENDOR TENTS</span>
                <span style={{ position: "absolute", left: "3%", bottom: "2.5%", fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", color: "rgba(255,255,255,.45)" }}>THE MARINA · IN-WATER DISPLAY DOCKS</span>
                {ZONES.map((z) => {
                  const isActive = activeZone === z.id;
                  const dim = category !== "all" && z.type !== category;
                  const accent = TYPE_ACCENT[z.type];
                  const bg = z.type === "dealer" ? "linear-gradient(180deg,rgba(18,58,74,.96),rgba(10,43,58,.98))" : accent ? `linear-gradient(90deg,${accent} 0, ${accent} 3px, #fff 3px)` : "#fff";
                  const fg = z.type === "dealer" ? "#eaf1f2" : z.type === "amenity" ? "#33454f" : "#0A2138";
                  const border = isActive ? "2px solid var(--accent)" : z.type === "dealer" ? "1px solid rgba(255,255,255,.18)" : "1px solid rgba(11,34,56,.16)";
                  return (
                    <button key={z.id} onClick={() => setActiveZone(z.id)} style={{ position: "absolute", left: z.x + "%", top: z.y + "%", width: z.w + "%", height: z.h + "%", borderRadius: 8, cursor: "pointer", padding: "7px 9px", textAlign: "left", overflow: "hidden", opacity: dim ? 0.32 : 1, background: bg, color: fg, border, boxShadow: isActive ? "0 0 0 3px rgba(242,106,62,.28), 0 10px 22px -12px rgba(0,0,0,.5)" : "none" }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".03em", fontWeight: 700, display: "block", lineHeight: 1.15 }}>{z.label}</span>
                    </button>
                  );
                })}
                <div style={{ position: "absolute", left: "45%", top: "45%", zIndex: 6, display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
                  <div style={{ background: "#0b3f96", color: "#fff", border: "2px solid #fff", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 15, boxShadow: "0 5px 14px rgba(0,0,0,.45)" }}>P</div>
                  <span style={{ marginTop: 5, background: "#0b3f96", color: "#fff", fontFamily: MONO, fontSize: 8, letterSpacing: ".08em", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>PROGRESSIVE · AD</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px 22px", flexWrap: "wrap", marginTop: 14 }}>
                {[["Dealers & docks", "#0e3a4a"], ["Vendors", "var(--accent)"], ["Food & drink", "#E0431F"], ["Amenities", "#6b7d88"]].map(([lab, col], i) => (
                  <span key={lab} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 11, color: "#5a6c78" }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: i === 0 ? col : "#fff", borderLeft: i === 0 ? undefined : `3px solid ${col}`, borderTop: i === 0 ? undefined : "1px solid rgba(11,34,56,.2)", borderBottom: i === 0 ? undefined : "1px solid rgba(11,34,56,.2)", borderRight: i === 0 ? undefined : "1px solid rgba(11,34,56,.2)" }} />
                    {lab}
                  </span>
                ))}
              </div>
            </div>

            {/* DETAILS PANEL */}
            <div style={{ flex: "1 1 280px", minWidth: 260, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#fff", border: "1px solid rgba(11,34,56,.12)", borderRadius: 18, padding: 22, minHeight: 230 }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "var(--accent)", textTransform: "uppercase" }}>{TYPE_LABEL[active.type]}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, margin: "8px 0 14px", letterSpacing: "-.01em" }}>{active.label}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {active.items.map((it) => (
                    <div key={it} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, color: "#33454f" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: "var(--accent)", flex: "0 0 auto" }} />{it}
                    </div>
                  ))}
                </div>
                {active.type === "dealer" && (
                  <Link href="/inventory" className="btn-invert" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 18, background: "#0A2138", color: "#fff", fontWeight: 700, fontSize: 13.5, padding: "11px 16px", borderRadius: 999 }}>View this dock’s inventory →</Link>
                )}
              </div>
              <AdSlot label="Sponsor / vendor ad" height={250} />
            </div>
          </div>
        </div>
      </section>

      {/* VENDOR SPOTLIGHT CAROUSEL */}
      <section style={{ background: "#F4F1EA", padding: "clamp(40px,5vw,68px) 0 clamp(48px,6vw,80px)", borderTop: "1px solid rgba(11,34,56,.08)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 clamp(18px,3vw,44px)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <Eyebrow>In the spotlight</Eyebrow>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(24px,3vw,40px)", lineHeight: 1.05, letterSpacing: "-.02em", margin: "12px 0 0" }}>Exhibitor spotlight</h2>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: ".06em", color: "#7c8b96" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} />Auto-rotating · 8 exhibitors
            </div>
          </div>
        </div>
        <div style={{ marginTop: 26, overflow: "hidden", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)", maskImage: "linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)" }}>
          <div style={{ display: "flex", gap: 18, padding: "8px clamp(18px,3vw,44px)", width: "max-content", animation: "vmarquee 24s linear infinite" }}>
            {vendorTrack.map((v, i) => (
              <div key={i} style={{ flex: "0 0 264px", width: 264, background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 18, padding: 22, boxShadow: "0 14px 34px -24px rgba(10,33,56,.55)" }}>
                <div style={{ height: 66, borderRadius: 11, background: v.tint, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 17, letterSpacing: ".01em", color: v.ink }}>{v.mark}</div>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: "var(--accent)", textTransform: "uppercase", marginTop: 16 }}>{v.category}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 19, margin: "6px 0", letterSpacing: "-.01em" }}>{v.name}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "#5a6c78", margin: 0 }}>{v.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VENDOR STORY */}
      <section style={{ background: "#0A2138", color: "#fff", padding: "clamp(64px,8vw,116px) clamp(18px,3vw,44px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>Meet the exhibitors</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0", color: "#fff", maxWidth: "20ch" }}>It’s not just boats. It’s the whole boating life.</h2>
          <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "rgba(255,255,255,.75)", margin: "20px 0 44px", maxWidth: "64ch" }}>Beyond the docks, the show floor is packed with the marine businesses that keep you on the water: sails and canvas, engines and service, insurance and gear, all in one place. Our vendors aren’t just booths; they’re the crew that keeps you on the water all season.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,250px),1fr))", gap: 16 }}>
            {STORY.map(([h, body, names]) => (
              <div key={h} style={{ border: "1px solid rgba(255,255,255,.14)", borderRadius: 18, padding: 24 }}>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, margin: "0 0 8px" }}>{h}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,.66)", margin: "0 0 10px" }}>{body}</p>
                <div style={{ fontFamily: MONO, fontSize: 11, color: "var(--accent)" }}>{names}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 34 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", color: "rgba(255,255,255,.5)", textTransform: "uppercase", marginBottom: 14 }}>Official show sponsors</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 56, border: "1px dashed rgba(255,255,255,.22)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: "rgba(255,255,255,.4)" }}>SPONSOR LOGO</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ADVERTISE */}
      <section style={{ background: "#F4F1EA", padding: "clamp(64px,8vw,112px) clamp(18px,3vw,44px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>Advertising opportunities</Eyebrow>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 14 }}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,50px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: 0, maxWidth: "20ch" }}>Put your brand in front of every boater at the show.</h2>
            <Link href="/vendors#inquiry" className="btn-invert" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0A2138", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 22px", borderRadius: 999 }}>Reserve ad space →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 18, marginTop: 38 }}>
            {ADVERTISE.map(([n, h, body]) => (
              <div key={n} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 20, padding: "28px 26px" }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: "var(--accent)", lineHeight: 1 }}>{n}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, margin: "14px 0 10px", letterSpacing: "-.01em" }}>{h}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.55, color: "#5a6c78", margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
