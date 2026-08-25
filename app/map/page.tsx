"use client";

import Link from "next/link";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { ShowMap as OfficialShowMap } from "@/components/ShowMap";
import { DISPLAY, MONO, Eyebrow } from "@/components/ui";

const FONT = "var(--font-poppins), sans-serif";

const VENDORS = [
  { name: "Gioia Sails", mark: "GIOIA SAILS", category: "Sails & Rigging", tagline: "Custom sails, cut and tuned for your hull.", tint: "#eef4f8", ink: "#142E51" },
  { name: "Bulldog Canvas", mark: "BULLDOG CANVAS", category: "Canvas & Covers", tagline: "Covers and enclosures built to last.", tint: "#f6f2e7", ink: "#142E51" },
  { name: "Marks Marine Insurance", mark: "MARKS MARINE", category: "Boat Insurance", tagline: "Boat insurance coverage you can count on.", tint: "#e9eef7", ink: "#0b3f96" },
  { name: "Monmouth Marine Engines", mark: "MONMOUTH ENGINES", category: "Engines & Repower", tagline: "Repower, service, and keep her running strong.", tint: "#eef4f8", ink: "#142E51" },
  { name: "Sea Tow Atlantic City", mark: "SEA TOW", category: "On-Water Assistance", tagline: "Help on the water is one call away, 24/7.", tint: "#f6f2e7", ink: "#142E51" },
  { name: "Harbor Outfitters", mark: "HARBOR OUTFITTERS", category: "Gear & Apparel", tagline: "Outfit the whole crew for the season.", tint: "#eef4f8", ink: "#142E51" },
  { name: "Viking Eyewear", mark: "VIKING EYEWEAR", category: "Polarized Optics", tagline: "Cut the glare from bow to horizon.", tint: "#f6f2e7", ink: "#142E51" },
  { name: "Snap Dock", mark: "SNAP DOCK", category: "Docking & Boating Gear", tagline: "Modular docking systems that make boating easier.", tint: "#eef4f8", ink: "#142E51" },
];

const HOW = [
  ["Boats", "Boat listings include dealer and boat type today; dock and slip locations appear as show assignments are confirmed.", "/inventory", "Browse Boats"],
  ["Marine Marketplace", "Exhibitor listings show products and services; booth numbers are added as the floor plan is finalized.", "/vendors", "Browse Marketplace"],
  ["Amenities", "Restrooms, food and drinks, entertainment, first aid, tickets and parking are all marked on the official map.", "/plan", "Plan Your Visit"],
];

const ADVERTISE = [
  ["01", "Banners & leaderboards", "Premium banner placements across the map, search results, and every boat detail page, seen by thousands of pre-show shoppers."],
  ["02", "Sponsored placements", "Featured positions in the directory and on the virtual show experience, where buyers plan their visit."],
  ["03", "Booths & activations", "On-site booths, main-stage sponsorships, and product sampling in the highest-traffic aisles of the show."],
];

export default function ShowMap() {
  const vendorTrack = [...VENDORS, ...VENDORS];

  return (
    <>
      <AnnouncementBar />
      <Nav active="/map" />

      {/* HEADER */}
      <section style={{ background: "#fff", padding: "clamp(24px,3vw,40px) clamp(18px,3vw,44px) 0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>The Official Show Map</Eyebrow>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 12 }}>
            <div>
              <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(30px,4vw,50px)", lineHeight: 1.04, letterSpacing: "-.015em", margin: 0, color: "var(--navy)", textTransform: "uppercase" }}>
                Find your way <span style={{ color: "var(--gold)" }}>around the show.</span>
              </h1>
              <p style={{ fontSize: 15.5, color: "rgba(20,46,81,.75)", margin: "14px 0 0", maxWidth: "62ch", lineHeight: 1.6 }}>
                Use the map to find boat displays, dealer locations, exhibitors in the Marine Marketplace, amenities and more.
              </p>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.4)", borderRadius: 999, padding: "9px 16px" }}>
              <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "var(--navy)" }}>Sept 10–13 · Farley State Marina, Atlantic City</span>
            </div>
          </div>
        </div>
      </section>

      {/* OFFICIAL MAP */}
      <section style={{ background: "#fff", padding: "clamp(22px,2.5vw,32px) clamp(18px,3vw,44px) clamp(44px,5vw,68px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1px solid rgba(20,46,81,.14)", borderRadius: 16, overflow: "hidden", boxShadow: "0 28px 60px -34px rgba(20,46,81,.4)" }}>
            <OfficialShowMap />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.35)", borderRadius: 10, padding: "11px 16px", marginTop: 18 }}>
            <span aria-hidden style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--lightblue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flex: "0 0 auto" }}>i</span>
            <span style={{ fontSize: 13.5, color: "rgba(20,46,81,.75)" }}>Map is subject to change. Please check with show staff for the most up-to-date information.</span>
          </div>

          {/* how the map + directory work together */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 18, marginTop: 34 }}>
            {HOW.map(([h, body, href, cta]) => (
              <div key={h} className="card-lift-sm" style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                <h3 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 16.5, margin: 0, color: "var(--navy)", textTransform: "uppercase", letterSpacing: ".02em" }}>{h}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "rgba(20,46,81,.7)", margin: 0, flex: 1 }}>{body}</p>
                <Link href={href} style={{ color: "var(--linkblue)", fontFamily: FONT, fontWeight: 700, fontSize: 12.5, letterSpacing: ".07em", textTransform: "uppercase" }}>
                  {cta} <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXHIBITOR SPOTLIGHT CAROUSEL */}
      <section style={{ background: "var(--bluetint)", padding: "clamp(40px,5vw,68px) 0 clamp(48px,6vw,80px)", borderTop: "1px solid rgba(20,46,81,.08)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 clamp(18px,3vw,44px)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <Eyebrow>In the Spotlight</Eyebrow>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(24px,3vw,38px)", lineHeight: 1.05, letterSpacing: "-.01em", margin: "12px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>Exhibitor spotlight</h2>
            </div>
            <Link href="/vendors" style={{ color: "var(--linkblue)", fontFamily: FONT, fontWeight: 700, fontSize: 12.5, letterSpacing: ".07em", textTransform: "uppercase" }}>
              See all exhibitors <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
        <div style={{ marginTop: 26, overflow: "hidden", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)", maskImage: "linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)" }}>
          <div style={{ display: "flex", gap: 18, padding: "8px clamp(18px,3vw,44px)", width: "max-content", animation: "vmarquee 24s linear infinite" }}>
            {vendorTrack.map((v, i) => (
              <div key={i} style={{ flex: "0 0 264px", width: 264, background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, padding: 22, boxShadow: "0 14px 34px -24px rgba(20,46,81,.5)" }}>
                <div style={{ height: 66, borderRadius: 11, background: v.tint, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, letterSpacing: ".01em", color: v.ink }}>{v.mark}</div>
                <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 10.5, letterSpacing: ".1em", color: "var(--lightblue)", textTransform: "uppercase", marginTop: 16 }}>{v.category}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18.5, margin: "6px 0", letterSpacing: "-.01em", color: "var(--navy)" }}>{v.name}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "rgba(20,46,81,.65)", margin: 0 }}>{v.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MORE THAN BOATS */}
      <section style={{ background: "var(--navy)", color: "#fff", padding: "clamp(56px,7vw,96px) clamp(18px,3vw,44px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>Meet the Exhibitors</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.05, letterSpacing: "-.01em", margin: "14px 0 0", color: "#fff", textTransform: "uppercase", maxWidth: "22ch" }}>It&rsquo;s not just boats. It&rsquo;s the whole boating life.</h2>
          <p style={{ fontSize: "clamp(15.5px,1.2vw,17.5px)", lineHeight: 1.6, color: "rgba(255,255,255,.78)", margin: "18px 0 0", maxWidth: "64ch" }}>
            Beyond the docks, the Marine Marketplace is packed with the businesses that keep you on the water: sails and canvas, engines and service, insurance and gear, all in one place.
          </p>
          <div style={{ display: "flex", gap: 13, flexWrap: "wrap", marginTop: 28 }}>
            <Link href="/vendors" className="h-brighten" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--gold)", color: "var(--navy)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".07em", textTransform: "uppercase", padding: "14px 24px", borderRadius: 8 }}>
              Browse Marine Marketplace <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ADVERTISE */}
      <section style={{ background: "#fff", padding: "clamp(56px,7vw,96px) clamp(18px,3vw,44px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>Advertising Opportunities</Eyebrow>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 14 }}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.6vw,44px)", lineHeight: 1.05, letterSpacing: "-.01em", margin: 0, maxWidth: "22ch", color: "var(--navy)" }}>Put your brand in front of every boater at the show.</h2>
            <Link href="/vendors#inquiry" className="btn-invert" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: ".05em", textTransform: "uppercase", padding: "14px 22px", borderRadius: 8 }}>Reserve ad space →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 18, marginTop: 38 }}>
            {ADVERTISE.map(([n, h, body]) => (
              <div key={n} style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, padding: "28px 26px" }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: "var(--lightblue)", lineHeight: 1 }}>{n}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, margin: "14px 0 10px", letterSpacing: "-.01em", color: "var(--navy)" }}>{h}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.55, color: "rgba(20,46,81,.68)", margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
