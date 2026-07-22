"use client";

import Link from "next/link";
import { useState } from "react";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, MONO, Eyebrow } from "@/components/ui";
import { submitLead } from "@/lib/leads";

type Row = { n: string; c: string; s: string; p: string };

const DEALERS: Row[] = [
  { n: "Causeway Marine", c: "Manahawkin", s: "NJ", p: "(609) 597-3488" },
  { n: "Clarks Landing Yacht Sales & Marina", c: "Point Pleasant", s: "NJ", p: "(732) 899-5559" },
  { n: "Coastal Boat Sales", c: "Brick", s: "NJ", p: "(732) 458-3540" },
  { n: "Comstock Yacht Sales & Marina", c: "Brick", s: "NJ", p: "(732) 899-2500" },
  { n: "Comstock Yacht Sales & Marina", c: "Sea Bright", s: "NJ", p: "(732) 704-3727" },
  { n: "Coty Marine", c: "Toms River", s: "NJ", p: "(732) 288-1000" },
  { n: "D & R Boat World", c: "Toms River", s: "NJ", p: "(732) 840-2020" },
  { n: "D & R Boat World", c: "Green Brook", s: "NJ", p: "(732) 968-2600" },
  { n: "EZ Dock Mid Atlantic", c: "Belford", s: "NJ", p: "(609) 624-0040" },
  { n: "Formula Boats", c: "Decatur", s: "IN", p: "(260) 724-9111" },
  { n: "G Winter's Sailing Center, Inc.", c: "Riverside", s: "NJ", p: "(856) 461-3555" },
  { n: "Henriques Yachts", c: "Bayville", s: "NJ", p: "(732) 269-1180" },
  { n: "MarineMax (Brick)", c: "Brick", s: "NJ", p: "" },
  { n: "MarineMax (Somers Point)", c: "Somers Point", s: "NJ", p: "" },
  { n: "MarineMax (Ocean View)", c: "Ocean View", s: "NJ", p: "" },
  { n: "New Jersey Outboards", c: "Bayville", s: "NJ", p: "(732) 505-3002" },
  { n: "Riverside Marina & Yacht Sales", c: "Riverside", s: "NJ", p: "(856) 461-1077" },
  { n: "Sandy Hook Yacht Sales", c: "Sea Bright", s: "NJ", p: "(732) 530-5500" },
  { n: "Schrader Yacht Sales", c: "Point Pleasant", s: "NJ", p: "(732) 899-8010" },
  { n: "Seaport Inlet Marina", c: "Belmar", s: "NJ", p: "(732) 681-3303" },
  { n: "Sheltered Cove Marina", c: "Tuckerton", s: "NJ", p: "(609) 296-9400" },
  { n: "Stone Harbor Marina", c: "Stone Harbor", s: "NJ", p: "(609) 368-1141" },
  { n: "South Jersey Yacht Sales", c: "Cape May", s: "NJ", p: "(609) 884-1600" },
  { n: "Valhalla Boat Sales", c: "New Gretna", s: "NJ", p: "(609) 296-2388" },
];

const VENDORS: Row[] = [
  { n: "All Seasons Marina", c: "Marmora", s: "NJ", p: "(609) 390-1850" },
  { n: "Boatique USA", c: "Chester", s: "CT", p: "(860) 227-4291" },
  { n: "Bulldog Canvas Company, LLC", c: "Warminster", s: "PA", p: "(215) 792-2211" },
  { n: "Cast Off Yacht Sales", c: "Toms River", s: "NJ", p: "(609) 389-6324" },
  { n: "EZ Docks - Docks Unlimited Marine Construction", c: "Belford", s: "NJ", p: "(732) 787-3088" },
  { n: "Freedom Boat Club of Delaware", c: "Lewes", s: "DE", p: "(301) 943-9249" },
  { n: "Fish Skinz", c: "Titusville", s: "FL", p: "(321) 652-1692" },
  { n: "Flying Point on the Shore", c: "Atlantic City", s: "NJ", p: "(516) 524-4475" },
  { n: "Further Customs", c: "Laguna Niguel", s: "CA", p: "(888) 803-8784" },
  { n: "Garage Living", c: "Morganville", s: "NJ", p: "N/A" },
  { n: "Gioia Sails", c: "Lakewood", s: "NJ", p: "(732) 901-6770" },
  { n: "Golden Nugget - Farley State Marina", c: "Atlantic City", s: "NJ", p: "(609) 441-8482" },
  { n: "Harbor Outfitters", c: "Seaville", s: "NJ", p: "(609) 478-3451" },
  { n: "Intercoastal Financial Group", c: "Longport", s: "NJ", p: "(732) 245-9783" },
  { n: "Intricate Marine Services", c: "Galloway", s: "NJ", p: "N/A" },
  { n: "Jersey Cape Yacht Sales", c: "Lower Bank", s: "NJ", p: "(609) 965-8650" },
  { n: "JJ Boatworks", c: "Atlantic City", s: "NJ", p: "(609) 344-0749" },
  { n: "Leaf Guard", c: "Pennsauken", s: "NJ", p: "(856) 600-7908" },
  { n: "Lil Pee Wee's Water Ice", c: "Marlton", s: "NJ", p: "(856) 359-0438" },
  { n: "Marks Marine Insurance", c: "Deptford", s: "NJ", p: "(856) 384-8744" },
  { n: "Monmouth Marine Engines", c: "Brielle", s: "NJ", p: "(732) 528-9290" },
  { n: "Mr. Shrinkwrap of South Jersey", c: "Haddonfield", s: "NJ", p: "(856) 858-6610" },
  { n: "New York Life", c: "Wayne", s: "PA", p: "(267) 995-4560" },
  { n: "Next Level Marine Custom", c: "Somers Point", s: "NJ", p: "(609) 670-5205" },
  { n: "National Marine Manufacturers Association", c: "Chicago", s: "IL", p: "(312) 946-6200" },
  { n: "NRG Home", c: "Philadelphia", s: "PA", p: "(267) 521-8958" },
  { n: "PM Winter Boat Covers", c: "Cherry Hill", s: "NJ", p: "(856) 857-7475" },
  { n: "Salty Dog Publications", c: "Brick", s: "NJ", p: "(732) 714-8400" },
  { n: "Sandy Hook Boat Club", c: "N/A", s: "N/A", p: "(732) 977-6264" },
  { n: "Sea Tow Atlantic City", c: "Brigantine", s: "NJ", p: "(609) 266-1984" },
  { n: "Snap Dock", c: "Seaville", s: "NJ", p: "(609) 478-3451" },
  { n: "Softub By Innovative Spas", c: "Seaville", s: "NJ", p: "(609) 478-3451" },
  { n: "Soldier Solutions", c: "Wallingford", s: "CT", p: "(203) 265-9119" },
  { n: "TC Coatings LLC", c: "Blackwood", s: "NJ", p: "(856) 212-1250 ext. 115" },
  { n: "Tees By BO", c: "Miami", s: "FL", p: "(305) 970-7385" },
  { n: "Total Marine", c: "Little Egg Harbor", s: "NJ", p: "(609) 294-0480" },
  { n: "Tuckerton Marine", c: "Tuckerton", s: "NJ", p: "(609) 344-0749" },
  { n: "Viking Eyewear", c: "Oceanport", s: "NJ", p: "(732) 272-3524" },
];

function initials(name: string) {
  const words = name.replace(/\([^)]*\)/g, " ").replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter((w) => w && !["llc", "inc"].includes(w.toLowerCase()));
  if (!words.length) return "?";
  return ((words[0][0] || "") + (words[1] ? words[1][0] : words[0][1] || "")).toUpperCase();
}
function deco(r: Row) {
  const loc = [r.c, r.s].filter((x) => x && x !== "N/A").join(", ");
  const hasPhone = !!(r.p && r.p !== "N/A");
  return { name: r.n, loc, initials: initials(r.n), phone: r.p, hasPhone, tel: "tel:" + String(r.p || "").replace(/[^0-9]/g, "") };
}

const DECK = [
  ["01 · The audience", "40,000+ boaters, one weekend", "The Atlantic City In-Water Boat Show draws serious, high-intent buyers, and Buoy puts your brand in front of them online for weeks before the docks even open."],
  ["02 · Why partner", "Meet buyers ready to spend", "These aren’t window shoppers. Show visitors come to compare, finance, and buy, with the average purchase well into five and six figures."],
  ["03 · Packages", "From booths to title sponsorship", "Dealer slips, vendor booths, sponsored map pins, banner placements, stage time, and full title sponsorship, scaled to fit your goals and budget."],
  ["04 · Digital reach", "Always-on placement on Buoy", "Every package includes year-round exposure across the marketplace, boat detail pages, and the interactive show map, not just the weekend of the show."],
  ["05 · Next steps", "Let’s build your package", "Send us a note with what you’d like to showcase and our partnerships team will follow up within two business days with the full deck and pricing."],
];

const INTERESTS = ["Presenting dealer", "Vendor booth", "Sponsorship", "Advertising"];
const STATS: [string, string][] = [["20", "BOAT DEALERS"], ["38", "VENDORS & EXHIBITORS"], ["58", "EXHIBITING COMPANIES"], ["8", "STATES REPRESENTED"]];

const formInput: React.CSSProperties = { width: "100%", background: "#f7f6f1", border: "1px solid rgba(11,34,56,.14)", borderRadius: 11, padding: "13px 15px", fontSize: 15, color: "#0A2138" };
const formLabel: React.CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#3d5260", marginBottom: 7, fontFamily: MONO, letterSpacing: ".04em" };

export default function Vendors() {
  const dealers = DEALERS.map(deco);
  const vendors = VENDORS.map(deco);
  const [deck, setDeck] = useState(0);
  const [interest, setInterest] = useState("Presenting dealer");
  const [form, setForm] = useState({ company: "", name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const cur = DECK[deck];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLead({ type: "vendor-inquiry", interest, ...form });
    setSubmitted(true);
  };

  const dirCard = (d: ReturnType<typeof deco>, dark: boolean) => (
    <div key={d.name + d.loc} style={{ background: dark ? "rgba(255,255,255,.04)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.14)" : "1px solid rgba(11,34,56,.1)", borderRadius: 16, padding: dark ? 18 : 20, boxShadow: dark ? undefined : "0 14px 34px -26px rgba(10,33,56,.5)", display: "flex", flexDirection: "column", gap: dark ? 11 : 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: dark ? 12 : 13 }}>
        <div style={{ flex: "0 0 auto", width: dark ? 44 : 46, height: dark ? 44 : 46, borderRadius: dark ? 10 : 11, background: dark ? "rgba(255,255,255,.08)" : "#eef2f2", border: dark ? "1px solid rgba(255,255,255,.12)" : undefined, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: dark ? 15 : 16, color: dark ? "#fff" : "#0A2138" }}>{d.initials}</div>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: dark ? 15.5 : 16, margin: "0 0 3px", letterSpacing: "-.01em", lineHeight: 1.15, color: dark ? "#fff" : undefined }}>{d.name}</h3>
          <div style={{ fontFamily: MONO, fontSize: dark ? 10.5 : 11, letterSpacing: ".04em", color: "var(--accent)", textTransform: "uppercase" }}>{d.loc}</div>
        </div>
      </div>
      {d.hasPhone && (
        <a href={d.tel} className={dark ? "link-muted" : "link-ink"} style={{ fontSize: dark ? 13 : 13.5, color: dark ? "rgba(255,255,255,.62)" : "#5a6c78", marginTop: "auto" }}>{d.phone}</a>
      )}
    </div>
  );

  return (
    <>
      <AnnouncementBar />
      <Nav active="/vendors" />

      {/* HERO / THANK YOU */}
      <section style={{ background: "linear-gradient(180deg,#0A2138 0%,#0d2b45 100%)", color: "#fff", padding: "clamp(56px,8vw,104px) clamp(18px,3vw,44px) clamp(48px,6vw,76px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow style={{ letterSpacing: ".22em" }}>Thank you</Eyebrow>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(36px,5.6vw,74px)", lineHeight: 1, letterSpacing: "-.03em", margin: "18px 0 0" }}>The show belongs<br />to our partners.</h1>
          <p style={{ fontSize: "clamp(16px,1.4vw,20px)", lineHeight: 1.6, color: "rgba(255,255,255,.78)", margin: "24px auto 0", maxWidth: "60ch" }}>Every dock, every booth, every deal starts with the dealers and exhibitors who show up for boaters. Without their boats on the water and their brands in the aisles, there is no show. So before anything else: thank you.</p>
          <div style={{ display: "flex", gap: "14px 40px", flexWrap: "wrap", justifyContent: "center", marginTop: 40 }}>
            {STATS.map(([num, lab]) => (
              <div key={lab}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3vw,40px)", color: "var(--accent)", lineHeight: 1 }}>{num}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".06em", color: "rgba(255,255,255,.6)", marginTop: 6 }}>{lab}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEALERS */}
      <section style={{ background: "#F4F1EA", padding: "clamp(56px,7vw,100px) clamp(18px,3vw,44px) clamp(40px,5vw,60px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>On the water</Eyebrow>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 14 }}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,52px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: 0, maxWidth: "18ch" }}>Our presenting dealers</h2>
            <p style={{ fontSize: 15.5, color: "#4c6270", margin: 0, maxWidth: "44ch" }}>20 dealers across 24 locations, bringing their full lineups to the docks, and their entire inventory onto Buoy.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,238px),1fr))", gap: 16, marginTop: 36 }}>
            {dealers.map((d) => dirCard(d, false))}
          </div>
        </div>
      </section>

      {/* DEALER CTA */}
      <section style={{ background: "#F4F1EA", padding: "clamp(8px,1vw,16px) clamp(18px,3vw,44px) clamp(56px,7vw,88px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", background: "linear-gradient(135deg,#0A2138 0%,#123a4c 100%)", borderRadius: 24, padding: "clamp(32px,4vw,56px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28, flexWrap: "wrap" }}>
          <div style={{ maxWidth: "56ch" }}>
            <Eyebrow style={{ letterSpacing: ".18em", fontSize: 11.5 }}>For dealers</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.4vw,44px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: "12px 0", color: "#fff" }}>Show your boats here.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,.78)", margin: 0 }}>Reserve your slips for next season and get your show lineup in front of pre-qualified buyers who researched you on Buoy before they ever hit the docks.</p>
          </div>
          <Link href="#inquiry" className="h-lift" style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 9, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 16, padding: "16px 28px", borderRadius: 999 }}>Become a presenting dealer →</Link>
        </div>
      </section>

      {/* VENDORS */}
      <section style={{ background: "#0A2138", color: "#fff", padding: "clamp(56px,7vw,100px) clamp(18px,3vw,44px) clamp(40px,5vw,60px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>In the aisles</Eyebrow>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 14 }}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,52px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: 0, color: "#fff", maxWidth: "18ch" }}>Our show exhibitors</h2>
            <p style={{ fontSize: 15.5, color: "rgba(255,255,255,.7)", margin: 0, maxWidth: "44ch" }}>38 brands and services that keep boaters on the water all season, from engines and insurance to canvas and gear.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,232px),1fr))", gap: 14, marginTop: 36 }}>
            {vendors.map((v) => dirCard(v, true))}
          </div>
        </div>
      </section>

      {/* VENDOR CTA */}
      <section style={{ background: "#0A2138", padding: "clamp(8px,1vw,16px) clamp(18px,3vw,44px) clamp(56px,7vw,88px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", background: "#F4F1EA", borderRadius: 24, padding: "clamp(32px,4vw,56px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28, flexWrap: "wrap" }}>
          <div style={{ maxWidth: "56ch" }}>
            <Eyebrow style={{ letterSpacing: ".18em", fontSize: 11.5 }}>For vendors</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.4vw,44px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: "12px 0" }}>Showcase your products here.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#4c6270", margin: 0 }}>Put your brand in the aisles boaters actually walk, plus always-on placement across Buoy’s marketplace, boat pages, and the show map. Booths, sampling, and stage time available.</p>
          </div>
          <Link href="#inquiry" className="btn-invert" style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 9, background: "#0A2138", color: "#fff", fontWeight: 700, fontSize: 16, padding: "16px 28px", borderRadius: 999 }}>Reserve a booth →</Link>
        </div>
      </section>

      {/* DECK + INQUIRY */}
      <section id="inquiry" style={{ background: "#F4F1EA", padding: "clamp(56px,7vw,100px) clamp(18px,3vw,44px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
            <Eyebrow>Partner with the show</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,50px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0" }}>See the opportunity. Then let’s talk.</h2>
            <p style={{ fontSize: 16, color: "#4c6270", margin: "16px auto 0", maxWidth: "56ch" }}>Flip through the partner deck for audience, packages, and pricing, then send us a note and our team will build your package.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 22, marginTop: 44, alignItems: "start" }}>
            {/* DECK VIEWER */}
            <div style={{ background: "#0A2138", borderRadius: 22, overflow: "hidden", boxShadow: "0 24px 60px -34px rgba(10,33,56,.8)" }}>
              <div style={{ position: "relative", aspectRatio: "16/10", background: "linear-gradient(150deg,#0d2b45 0%,#0A2138 60%)", padding: "clamp(24px,3vw,38px)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "var(--accent)", textTransform: "uppercase" }}>{cur[0]}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,.5)" }}>{deck + 1} / {DECK.length}</div>
                </div>
                <div>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(22px,2.6vw,34px)", lineHeight: 1.05, letterSpacing: "-.02em", color: "#fff", margin: "0 0 14px" }}>{cur[1]}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,.76)", margin: 0, maxWidth: "44ch" }}>{cur[2]}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setDeck((d) => (d - 1 + DECK.length) % DECK.length)} style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(255,255,255,.22)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
                  <button onClick={() => setDeck((d) => (d + 1) % DECK.length)} className="h-brighten" style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "var(--accent)", color: "#0A2138", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
                  <div style={{ display: "flex", gap: 7, marginLeft: 8 }}>
                    {DECK.map((_, i) => (
                      <button key={i} onClick={() => setDeck(i)} style={{ width: i === deck ? 22 : 8, height: 8, borderRadius: 999, border: "none", cursor: "pointer", padding: 0, background: i === deck ? "var(--accent)" : "rgba(255,255,255,.28)", transition: "width .2s, background .2s" }} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px clamp(20px,2.5vw,30px)", background: "#081726", flexWrap: "wrap" }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".05em", color: "rgba(255,255,255,.55)" }}>AC In-Water Boat Show · Partner Deck 2026</span>
                <a href="#inquiry-form" className="link-muted" style={{ fontWeight: 700, fontSize: 13.5, color: "var(--accent)" }}>Request the full deck →</a>
              </div>
            </div>

            {/* INQUIRY FORM */}
            <div id="inquiry-form" style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 22, padding: "clamp(26px,3vw,38px)" }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(242,106,62,.12)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 18px" }}>✓</div>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, margin: "0 0 10px", letterSpacing: "-.01em" }}>Thanks! We’re on it.</h3>
                  <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#4c6270", margin: "0 auto", maxWidth: "40ch" }}>Your inquiry is in. A member of the show team will reach out within two business days with the full deck and next steps.</p>
                  <button onClick={() => setSubmitted(false)} className="btn-outline" style={{ marginTop: 22, background: "none", border: "1px solid rgba(11,34,56,.18)", color: "#0A2138", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 999, cursor: "pointer" }}>Send another inquiry</button>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)" }}>Sponsorship inquiry</div>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 23, margin: "10px 0 20px", letterSpacing: "-.01em" }}>Tell us about your brand</h3>

                  <label style={{ ...formLabel, textTransform: "uppercase" }}>I’m interested in</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                    {INTERESTS.map((label) => {
                      const on = interest === label;
                      return (
                        <button type="button" key={label} onClick={() => setInterest(label)} style={{ fontSize: 13, fontWeight: 600, padding: "9px 14px", borderRadius: 999, cursor: "pointer", background: on ? "#0A2138" : "#fff", color: on ? "#fff" : "#3d5260", border: `1px solid ${on ? "#0A2138" : "rgba(11,34,56,.16)"}` }}>{label}</button>
                      );
                    })}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={formLabel}>COMPANY</label>
                      <input value={form.company} onChange={setField("company")} placeholder="Your company" style={formInput} required />
                    </div>
                    <div>
                      <label style={formLabel}>NAME</label>
                      <input value={form.name} onChange={setField("name")} placeholder="Full name" style={formInput} required />
                    </div>
                    <div>
                      <label style={formLabel}>EMAIL</label>
                      <input type="email" value={form.email} onChange={setField("email")} placeholder="you@company.com" style={formInput} required />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={formLabel}>MESSAGE</label>
                      <textarea value={form.message} onChange={setField("message")} placeholder="Tell us what you’d like to showcase…" rows={3} style={{ ...formInput, resize: "vertical", minHeight: 88 }} />
                    </div>
                  </div>
                  <button type="submit" className="h-brighten" style={{ width: "100%", marginTop: 20, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 16, padding: 16, borderRadius: 12, border: "none", cursor: "pointer" }}>Send inquiry →</button>
                  <p style={{ fontSize: 12, color: "#8595a0", textAlign: "center", margin: "14px 0 0" }}>Prefer email? <a href="mailto:partners@acinwaterboatshow.com" style={{ fontWeight: 600 }}>partners@acinwaterboatshow.com</a></p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
