"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnnouncementBar, Nav } from "@/components/SiteChrome";
import { DISPLAY, MONO } from "@/components/ui";
import { useIframeModal } from "@/components/IframeModal";

/* ── Dealer + local market data (Point Pleasant example) ─────────────── */
const DEALER = {
  name: "Clarks Landing Yacht Sales",
  shortName: "Clarks Landing",
  tagline: "Family-run on the Manasquan River since 1981, and still the friendliest way to buy a boat on the Jersey Shore.",
  address: "847 Arnold Ave",
  city: "Point Pleasant",
  state: "NJ",
  zip: "08742",
  phone: "(732) 899-5559",
  waterBody: "the Manasquan River",
  hours: ["Mon – Fri   8:30a – 5:00p", "Sat   9:00a – 5:00p", "Sun   10:00a – 5:00p"],
  brands: ["Beneteau", "Cutwater", "Nimbus", "Wellcraft", "Solara", "Roughneck"],
  highlights: [
    { k: "40+ yrs", t: "Family-run since 1981", b: "Four decades on the river and one of the largest boat dealers in the Mid-Atlantic." },
    { k: "Full-service", t: "A marina, not just a lot", b: "Slips to 70 ft, a bait-and-tackle ship store, fuel dock, and factory-trained techs on site." },
    { k: "Clean Marina", t: "NJ certified Clean Marina", b: "Recognized by the state for protecting the same water you boat on." },
  ],
};

const LOCAL = {
  town: "Point Pleasant",
  region: "the Manasquan River",
  heroKicker: "Serving Point Pleasant, NJ",
  intro: "If you grew up anywhere near the Manasquan, you already know the rule: summer starts the day the boat goes in. Point Pleasant sits right where the river meets the ocean, which makes it one of the best home ports on the Jersey Shore, five minutes to the inlet, a short run to the back bay, and flat-water cruising the whole way home.",
  facts: [
    { label: "Did you know", text: "The Manasquan River is Mile 0 of the New Jersey Intracoastal Waterway. Your home dock is literally where the ICW begins." },
    { label: "Did you know", text: "The Manasquan Inlet “Wall” holds fish twelve months a year, connecting the river straight out to the Atlantic." },
  ],
  cards: [
    { label: "On the water", title: "River, inlet, canal & bay", body: "Run the Manasquan River to the inlet in about five minutes, or drop down the Point Pleasant Canal into Barnegat Bay. Open ocean, back bay, and calm river cruising all from one dock." },
    { label: "Marinas & ramps", title: "Easy in, easy out", body: "Full-service marinas line the river, with free public ramps at Bay Avenue and the newer Point Pleasant Canal access, so trailer boaters are minutes from the inlet." },
    { label: "Fishing & culture", title: "A serious fishing town", body: "Striped bass, fluke, tog and bluefish are the local currency, and one of the Shore’s biggest charter and party-boat fleets runs right out of the inlet." },
    { label: "On shore", title: "Landmarks you know", body: "Jenkinson’s Boardwalk, the historic Coast Guard station at the inlet, sunset over Treasure Island, and the freshwater Manasquan Reservoir just inland." },
  ],
  season: "Prime season runs April through October, and the fall run is some of the best fishing all year. The smart time to buy is show season, before the spring rush prices everything back up.",
  nearbyTowns: ["Point Pleasant Beach", "Brielle", "Manasquan", "Bay Head"],
  faqs: [
    { q: "Do I need a license to run a boat in Point Pleasant?", a: "To operate a powerboat on New Jersey tidal waters like the river, inlet and bay, you need a NJ Boating Safety Certificate and a boat license. It is a one-day course. Kids 12 and under have to wear a life jacket any time the boat is underway." },
    { q: "Where can I launch a boat near Point Pleasant?", a: "There are free public ramps at the end of Bay Avenue and at the Point Pleasant Canal access, plus full-service marinas along the Manasquan River. From most of them the inlet is only about a five-minute idle away." },
    { q: "What can I catch around here?", a: "Plenty. Striped bass and bluefish in the river and inlet, fluke and sea bass out front, and tog around the rocks in the cooler months. The Manasquan Inlet Wall famously produces something almost year-round." },
    { q: "When is boating season on the Jersey Shore?", a: "Most boats go in around April and come out in October or November. Summer weekends get busy, so a slip or an early launch helps. Fall is quieter water and often the best fishing of the year." },
    { q: "Why buy at the boat show instead of waiting?", a: "Show pricing is the lowest of the year: factory show rebates, dealers competing in one place, and trades bid up instead of lowballed. Wait until spring and prices climb right back to list. See the full breakdown on our Why the Show guide." },
  ],
};

const phoneHref = "tel:" + DEALER.phone.replace(/[^0-9+]/g, "");
const mapHref = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([DEALER.name, DEALER.address, DEALER.city, DEALER.state, DEALER.zip].join(" "));

function PhotoTile({ label, caption }: { label: string; caption?: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,#17324a 0 16px,#14304a 16px 32px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,.4)", textAlign: "center", padding: 12 }}>{label}</span>
      {caption && (
        <span style={{ position: "absolute", left: 14, bottom: 14, fontFamily: MONO, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#fff", background: "rgba(8,24,41,.72)", padding: "6px 11px", borderRadius: 6 }}>{caption}</span>
      )}
    </div>
  );
}

export default function PointPleasant() {
  const { open: openTickets } = useIframeModal();
  const [faqOpen, setFaqOpen] = useState(0);

  return (
    <>
      <AnnouncementBar />
      <Nav active="/point-pleasant" />

      {/* BREADCRUMB */}
      <section style={{ background: "#F4F1EA", padding: "clamp(22px,3vw,36px) clamp(18px,5vw,56px) 0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", fontFamily: MONO, fontSize: 11.5, letterSpacing: ".1em", color: "#8595a0" }}>
          <Link href="/" className="link-ink" style={{ color: "#8595a0" }}>HOME</Link> / <Link href="/research" className="link-ink" style={{ color: "#8595a0" }}>RESEARCH</Link> / <span style={{ color: "#0A2138" }}>{LOCAL.town.toUpperCase()}, {DEALER.state}</span>
        </div>
      </section>

      {/* HERO + DEALER NAP */}
      <section style={{ background: "#F4F1EA", padding: "clamp(30px,4vw,52px) clamp(18px,5vw,56px) clamp(56px,7vw,90px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "clamp(28px,4vw,52px)", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" }}>{LOCAL.heroKicker}</div>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(34px,5vw,68px)", lineHeight: 0.98, letterSpacing: "-.03em", margin: "16px 0 0" }}>The {LOCAL.town} boat show is <span style={{ color: "var(--accent)" }}>waiting at the docks.</span></h1>
            <p style={{ maxWidth: 560, fontSize: "clamp(16px,1.3vw,19px)", lineHeight: 1.6, color: "#43596a", margin: "22px 0 0" }}>{DEALER.shortName} is bringing {LOCAL.town} to the Atlantic City In-Water Boat Show. Use the Virtual Boat Show to line up the boats you want to board and plan your visit, then come get the steal of the season in person, Sept 10-13 on the docks.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 13, marginTop: 30 }}>
              <button onClick={() => openTickets()} className="h-lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 16, padding: "16px 26px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Get Boat Show Tickets →</button>
              <Link href="/inventory" className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#0A2138", fontWeight: 600, fontSize: 16, padding: "16px 26px", borderRadius: 999, border: "1px solid rgba(11,34,56,.16)" }}>Browse {DEALER.shortName} inventory</Link>
            </div>
          </div>

          {/* NAP card */}
          <div style={{ minWidth: 0 }}>
            <div style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 22, boxShadow: "0 30px 60px -34px rgba(10,33,56,.5)", overflow: "hidden" }}>
              <div style={{ position: "relative", aspectRatio: "16/9", background: "#0A2138" }}>
                <PhotoTile label="Dealer / marina / waterfront photo" />
              </div>
              <div style={{ padding: "24px clamp(20px,2vw,28px) 26px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 46, height: 46, flex: "0 0 auto", borderRadius: 11, background: "#0A2138", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 15 }}>CL</div>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, letterSpacing: "-.01em", margin: 0, lineHeight: 1.1 }}>{DEALER.name}</h2>
                    <div style={{ fontFamily: MONO, fontSize: 11.5, color: "#5a6c78", marginTop: 4 }}>Boat dealer · {DEALER.city}, {DEALER.state}</div>
                  </div>
                </div>
                <div style={{ height: 1, background: "rgba(11,34,56,.1)", margin: "20px 0" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".12em", color: "#9aa7b0", width: 64, flex: "0 0 auto", paddingTop: 2 }}>ADDRESS</span>
                    <span style={{ fontSize: 15, color: "#0A2138", lineHeight: 1.4 }}>{DEALER.address}, {DEALER.city}, {DEALER.state} {DEALER.zip}</span>
                  </div>
                  <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".12em", color: "#9aa7b0", width: 64, flex: "0 0 auto", paddingTop: 2 }}>PHONE</span>
                    <a href={phoneHref} className="link-ink" style={{ fontSize: 15, color: "var(--accent)", fontWeight: 700 }}>{DEALER.phone}</a>
                  </div>
                  <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".12em", color: "#9aa7b0", width: 64, flex: "0 0 auto", paddingTop: 2 }}>HOURS</span>
                    <span style={{ fontSize: 14, color: "#3d5260", lineHeight: 1.6 }}>{DEALER.hours.map((h, i) => (<span key={i}>{h}{i < DEALER.hours.length - 1 && <br />}</span>))}</span>
                  </div>
                </div>
                <a href={mapHref} target="_blank" rel="noopener noreferrer" className="btn-invert" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 22, background: "#0A2138", color: "#fff", fontWeight: 700, fontSize: 14.5, padding: 13, borderRadius: 12 }}>Get directions →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOCAL FACTS STRIP */}
      <section style={{ background: "#050F1A", color: "#fff", padding: "clamp(40px,5vw,60px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)", textAlign: "center" }}>Two things {LOCAL.town} boaters love</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 20, marginTop: 28 }}>
            {LOCAL.facts.map((f, i) => (
              <div key={i} style={{ background: "linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 26, display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: "var(--accent)", lineHeight: 1, flex: "0 0 auto" }}>{i + 1}</span>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.5)" }}>{f.label}</div>
                  <p style={{ fontSize: 16, lineHeight: 1.55, color: "rgba(255,255,255,.86)", margin: "8px 0 0" }}>{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOATING IN TOWN */}
      <section style={{ background: "#F4F1EA", padding: "clamp(70px,9vw,124px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" }}>The local water</div>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.6vw,56px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: "14px 0 0", maxWidth: "18ch" }}>Boating in {LOCAL.town}.</h2>
          <p style={{ fontSize: "clamp(16px,1.25vw,20px)", lineHeight: 1.62, color: "#43596a", margin: "20px 0 44px", maxWidth: "64ch" }}>{LOCAL.intro}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,270px),1fr))", gap: 18 }}>
            {LOCAL.cards.map((c) => (
              <div key={c.title} className="card-lift" style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 20, padding: "28px 26px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)" }}>{c.label}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, margin: "12px 0 10px", letterSpacing: "-.01em" }}>{c.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.58, color: "#5a6c78", margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 44, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 22, alignItems: "stretch" }}>
            <div style={{ background: "#E9EEEE", borderRadius: 20, padding: "32px 30px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)" }}>When to boat, when to buy</div>
              <p style={{ fontSize: "clamp(16px,1.2vw,18px)", lineHeight: 1.6, color: "#33495a", margin: "14px 0 0" }}>{LOCAL.season}</p>
            </div>
            <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", minHeight: 240, background: "#0A2138" }}>
              <PhotoTile label="Local marina / river / waterfront photo" />
            </div>
          </div>
        </div>
      </section>

      {/* WHY BUY FROM DEALER */}
      <section style={{ background: "#E9EEEE", padding: "clamp(70px,9vw,124px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" }}>Why {LOCAL.town} buys here</div>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0", maxWidth: "20ch" }}>Why buy from {DEALER.shortName}.</h2>
          <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "#43596a", margin: "18px 0 42px", maxWidth: "58ch" }}>{DEALER.tagline}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 18 }}>
            {DEALER.highlights.map((w) => (
              <div key={w.t} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 20, padding: "28px 26px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: "var(--accent)", lineHeight: 1, letterSpacing: "-.01em" }}>{w.k}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, margin: "14px 0 9px", letterSpacing: "-.01em" }}>{w.t}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#5a6c78", margin: 0 }}>{w.b}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 30, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontFamily: MONO, fontSize: 12.5, color: "#3d5260" }}>
            <span style={{ letterSpacing: ".1em", textTransform: "uppercase", color: "#8595a0" }}>On the docks:</span>
            <span>{DEALER.brands.join("   ·   ")}</span>
          </div>
        </div>
      </section>

      {/* NEARBY TOWNS */}
      <section style={{ background: "#F4F1EA", padding: "clamp(32px,4vw,52px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "clamp(24px,3.5vw,48px)", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" }}>Proudly serving the area</div>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(24px,3vw,40px)", lineHeight: 1.08, letterSpacing: "-.02em", margin: "14px 0 22px", maxWidth: "18ch" }}>{DEALER.shortName} serves {LOCAL.town} & every dock nearby.</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <span style={{ background: "#0A2138", color: "#fff", fontFamily: MONO, fontSize: 13, letterSpacing: ".04em", padding: "10px 18px", borderRadius: 999 }}>{LOCAL.town}</span>
              {LOCAL.nearbyTowns.map((t) => (
                <span key={t} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.14)", color: "#3d5260", fontFamily: MONO, fontSize: 13, letterSpacing: ".04em", padding: "10px 18px", borderRadius: 999 }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "4/3", background: "#0A2138", boxShadow: "0 24px 50px -30px rgba(10,33,56,.5)" }}>
            <PhotoTile label="Local marina / inlet / your docks" caption={`${LOCAL.town}, ${DEALER.state}`} />
          </div>
        </div>
      </section>

      {/* LOCAL FAQ */}
      <section style={{ background: "#E9EEEE", padding: "clamp(70px,9vw,124px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)", textAlign: "center" }}>{LOCAL.town} boating questions</div>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", lineHeight: 1.04, letterSpacing: "-.02em", margin: "14px auto 40px", textAlign: "center", maxWidth: "22ch" }}>Getting on the water around {LOCAL.town}.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {LOCAL.faqs.map((f, i) => {
              const isOpen = faqOpen === i;
              return (
                <div key={f.q} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 16, overflow: "hidden" }}>
                  <button onClick={() => setFaqOpen(isOpen ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "20px clamp(18px,2vw,26px)" }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(16px,1.5vw,19px)", color: "#0A2138", letterSpacing: "-.01em" }}>{f.q}</span>
                    <span style={{ flex: "0 0 auto", width: 27, height: 27, borderRadius: "50%", background: isOpen ? "var(--accent)" : "rgba(11,34,56,.06)", color: isOpen ? "#0A2138" : "#4c6270", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, lineHeight: 1, transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform .25s, background .2s" }}>+</span>
                  </button>
                  <div style={{ maxHeight: isOpen ? 600 : 0, overflow: "hidden", transition: "max-height .32s ease" }}>
                    <p style={{ margin: 0, padding: "0 clamp(18px,2vw,26px) 22px", fontSize: 15.5, lineHeight: 1.62, color: "#4c6270" }}>{f.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: "#0A2138", color: "#fff", padding: "clamp(66px,8vw,110px) clamp(18px,5vw,56px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(242,106,62,.16), transparent 58%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" }}>Your show, in person</div>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(32px,5vw,60px)", lineHeight: 1, letterSpacing: "-.03em", margin: "16px 0 0" }}>{LOCAL.town}, meet us on the docks.</h2>
          <p style={{ fontSize: "clamp(16px,1.3vw,19px)", lineHeight: 1.55, color: "rgba(255,255,255,.78)", margin: "20px auto 0", maxWidth: "52ch" }}>Line up {DEALER.shortName}&rsquo;s fleet and plan your visit here, then run down from {DEALER.waterBody} and come aboard in person. Sept 10-13 at the Atlantic City In-Water Boat Show.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 13, justifyContent: "center", marginTop: 34 }}>
            <button onClick={() => openTickets()} className="h-lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 16, padding: "16px 28px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Get Boat Show Tickets →</button>
            <a href={phoneHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.08)", color: "#fff", fontWeight: 600, fontSize: 16, padding: "16px 28px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,.32)" }}>Call {DEALER.phone}</a>
          </div>
        </div>
      </section>

      {/* DEALER FOOTER */}
      <footer style={{ background: "#050F1A", color: "rgba(255,255,255,.6)", padding: "clamp(52px,6vw,80px) clamp(18px,5vw,56px) 40px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 36 }}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, color: "#fff" }}>
              <Image src="/buoy-ring-logo.svg" alt="Buoy" width={28} height={28} style={{ display: "block", flex: "0 0 auto" }} />
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, lineHeight: 1.1, whiteSpace: "nowrap" }}>AC In-Water Boat Show</span>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, margin: "16px 0 0", color: "rgba(255,255,255,.55)" }}>{DEALER.name} · {DEALER.city}, {DEALER.state}. Local Virtual Boat Show, powered by Buoy.</p>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,.4)", textTransform: "uppercase" }}>{DEALER.shortName}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16, fontFamily: MONO, fontSize: 14.5 }}>
              <span style={{ color: "rgba(255,255,255,.55)" }}>{DEALER.address}</span>
              <span style={{ color: "rgba(255,255,255,.55)" }}>{DEALER.city}, {DEALER.state} {DEALER.zip}</span>
              <a href={phoneHref} className="link-muted" style={{ color: "rgba(255,255,255,.7)" }}>{DEALER.phone}</a>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,.4)", textTransform: "uppercase" }}>Explore</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              <Link href="/inventory" className="link-muted" style={{ color: "rgba(255,255,255,.7)", fontSize: 14.5 }}>Browse inventory</Link>
              <Link href="/sell" className="link-muted" style={{ color: "rgba(255,255,255,.7)", fontSize: 14.5 }}>Value my boat</Link>
              <Link href="/research" className="link-muted" style={{ color: "rgba(255,255,255,.7)", fontSize: 14.5 }}>Research library</Link>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,.4)", textTransform: "uppercase" }}>Show info</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              <button onClick={() => openTickets()} className="link-muted" style={{ color: "rgba(255,255,255,.7)", fontSize: 14.5, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", padding: 0 }}>Boat Show Pricing</button>
              <span style={{ color: "rgba(255,255,255,.55)", fontSize: 14.5, fontFamily: MONO }}>Sept 10-13, 2026</span>
              <span style={{ color: "rgba(255,255,255,.55)", fontSize: 14.5, fontFamily: MONO }}>Powered by Buoy</span>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1240, margin: "44px auto 0", paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.1)", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", fontFamily: MONO, fontSize: 11.5, letterSpacing: ".05em", color: "rgba(255,255,255,.4)" }}>
          <span>© 2026 {DEALER.name} · Powered by Buoy</span>
          <span>Privacy · Terms · Dealer Agreement</span>
        </div>
      </footer>
    </>
  );
}
