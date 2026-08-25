"use client";

import { useState } from "react";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { Eyebrow, PhonePill } from "@/components/ui";
import { useIframeModal } from "@/components/IframeModal";

const FONT = "var(--font-poppins), sans-serif";

const DIRECTIONS_URL = "https://www.google.com/maps/search/?api=1&query=Farley+State+Marina%2C+Atlantic+City%2C+NJ";

type InfoCard = {
  title: string;
  body: string;
  cta: string;
  icon: React.ReactNode;
  action: { kind: "tickets" } | { kind: "link"; href: string; external?: boolean };
};

const ICON_PROPS = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Circle({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
      {children}
    </span>
  );
}

function DineCard({ img, name, tag, phone, place, group }: { img: string; name: string; tag: string; phone: string; place: string; group: string }) {
  return (
    <div className="card-lift-sm" style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={name} loading="lazy" style={{ width: "100%", aspectRatio: "2/1", objectFit: "cover", display: "block" }} />
        <span style={{ position: "absolute", top: 9, left: 9, fontFamily: FONT, fontWeight: 700, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", background: "rgba(255,255,255,.94)", color: "var(--navy)", padding: "5px 10px", borderRadius: 999 }}>{group}</span>
      </div>
      <div style={{ padding: "15px 16px 16px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: "var(--navy)", lineHeight: 1.2 }}>{name}</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "rgba(20,46,81,.7)" }}>{tag}</div>
        <div style={{ fontSize: 12.5, color: "rgba(20,46,81,.55)" }}>{place}</div>
        <div style={{ marginTop: "auto", paddingTop: 8 }}>
          <PhonePill phone={phone} />
        </div>
      </div>
    </div>
  );
}

export default function PlanYourVisit() {
  const { open: openTickets } = useIframeModal();
  // Hotel search dates, prefilled with the show weekend and editable.
  const [checkin, setCheckin] = useState("2026-09-10");
  const [checkout, setCheckout] = useState("2026-09-13");
  const openHotels = () => {
    const ci = checkin.replace(/-/g, "");
    const co = checkout.replace(/-/g, "");
    openTickets(`https://visitatlanticcity.bookdirect.net/#/lodgings/ctab/540?checkin=${ci}&checkout=${co}`, "Hotels & Stays");
  };

  const cards: InfoCard[] = [
    {
      title: "Hours & Tickets",
      body: "Show dates, daily hours, admission info and ticket options.",
      cta: "Get Tickets",
      action: { kind: "tickets" },
      icon: <svg {...ICON_PROPS}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>,
    },
    {
      title: "Stay & Play",
      body: "Where to stay and more to do in Atlantic City.",
      cta: "View Details",
      action: { kind: "link", href: "#explore-ac" },
      icon: <svg {...ICON_PROPS}><path d="M3 20V9l9-5 9 5v11" /><path d="M9 20v-6h6v6" /></svg>,
    },
    {
      title: "Food & Drinks",
      body: "Enjoy great dining at the show and nearby Golden Nugget restaurants.",
      cta: "View Details",
      action: { kind: "link", href: "#dining" },
      icon: <svg {...ICON_PROPS}><path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M17 3c-1.7 0-3 2-3 5v3h3M17 3v18M17 11v10" transform="translate(1 0) scale(.92)" /></svg>,
    },
    {
      title: "Directions & Parking",
      body: "Find the show at Farley State Marina, get directions and parking information.",
      cta: "Get Directions",
      action: { kind: "link", href: DIRECTIONS_URL, external: true },
      icon: <svg {...ICON_PROPS}><path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" /><circle cx="12" cy="11" r="2.3" /></svg>,
    },
  ];

  const cardAction = (c: InfoCard) => {
    const style: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, color: "var(--gold)", fontFamily: FONT, fontWeight: 700, fontSize: 12.5, letterSpacing: ".07em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", padding: 0 };
    if (c.action.kind === "tickets") {
      return <button onClick={() => openTickets()} style={style}>{c.cta} <span aria-hidden>→</span></button>;
    }
    return (
      <a href={c.action.href} target={c.action.external ? "_blank" : undefined} rel={c.action.external ? "noopener noreferrer" : undefined} style={style}>
        {c.cta} <span aria-hidden>→</span>
      </a>
    );
  };

  return (
    <>
      <AnnouncementBar />
      <Nav active="/plan" />

      {/* HERO */}
      <section style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1340, margin: "0 auto", padding: "clamp(24px,3vw,44px) clamp(18px,4vw,44px) clamp(36px,4vw,56px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: "clamp(22px,3vw,44px)", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <Eyebrow>Make the Most of the Show</Eyebrow>
            <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(32px,4.4vw,54px)", lineHeight: 1.06, letterSpacing: "-.015em", margin: "14px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>Plan Your Visit</h1>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(19px,2.1vw,26px)", lineHeight: 1.3, margin: "14px 0 0", color: "var(--gold)", textTransform: "uppercase" }}>
              Make a day of it.
              <br />
              Make a weekend of it.
            </div>
            <span className="gold-rule" style={{ margin: "20px 0 0", background: "var(--lightblue)" }} />
            <p style={{ fontSize: "clamp(15.5px,1.2vw,17.5px)", lineHeight: 1.65, color: "rgba(20,46,81,.8)", margin: "20px 0 0", maxWidth: "44ch" }}>
              Everything you need to plan your Atlantic City In-Water Boat Show experience, from show hours and parking to waterfront dining and where to stay.
            </p>
          </div>
          <div style={{ minWidth: 0, position: "relative", borderRadius: 6, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/show/golden-nugget.jpg" alt="Golden Nugget Atlantic City and Farley State Marina" style={{ display: "block", width: "100%", height: "auto" }} />
            <svg aria-hidden viewBox="0 0 1600 120" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: -1, width: "100%", height: "clamp(30px,5vw,52px)", display: "block" }}>
              <path d="M0,78 C300,18 620,118 900,70 C1180,26 1420,88 1600,52 L1600,120 L0,120 Z" fill="#75BAE4" opacity="0.9" />
              <path d="M0,96 C320,44 640,132 940,88 C1220,50 1440,104 1600,74 L1600,120 L0,120 Z" fill="#FDB717" />
              <path d="M0,112 C340,76 700,138 1020,104 C1280,80 1470,116 1600,98 L1600,120 L0,120 Z" fill="#fff" />
            </svg>
          </div>
        </div>
      </section>

      {/* UTILITY STRIP: one connected navy bar, not four floating cards */}
      <section style={{ background: "#fff", padding: "0 clamp(18px,5vw,56px) clamp(44px,5.5vw,72px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", background: "rgba(255,255,255,.14)", borderRadius: 18, overflow: "hidden", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,250px),1fr))", gap: 1, boxShadow: "0 26px 56px -30px rgba(20,46,81,.55)" }}>
          {cards.map((c) => (
            <div key={c.title} style={{ background: "var(--navy)", padding: "clamp(22px,2.4vw,30px) clamp(20px,2.2vw,28px)", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
              <span aria-hidden style={{ color: "var(--gold)" }}>{c.icon}</span>
              <h3 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15.5, letterSpacing: ".04em", margin: 0, color: "#fff", textTransform: "uppercase" }}>{c.title}</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "rgba(255,255,255,.72)", margin: 0, flex: 1 }}>{c.body}</p>
              {cardAction(c)}
            </div>
          ))}
        </div>
      </section>

      {/* FOOD & DRINKS */}
      <section id="dining" style={{ scrollMarginTop: 82, background: "var(--bluetint)", padding: "clamp(48px,6vw,84px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>Eat and Drink Well</Eyebrow>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(24px,3.2vw,38px)", letterSpacing: "-.01em", margin: "14px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>Food &amp; Drinks</h2>
          <span className="gold-rule" style={{ margin: "16px 0 0" }} />
          <p style={{ fontSize: "clamp(15px,1.15vw,17px)", lineHeight: 1.6, color: "rgba(20,46,81,.75)", margin: "16px 0 0", maxWidth: "64ch" }}>
            From casual bites at the show to world-class dining at the Golden Nugget, there&rsquo;s something for every taste.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 16, marginTop: 30 }}>
            <DineCard img="/show/dine-deck.jpg" name="The Deck" tag="Waterfront dining, drinks and light bites." place="Show Waterfront" phone="(609) 441-2000" group="At the Show" />
            <DineCard img="/show/dine-live.jpg" name="Live Entertainment" tag="Live music and entertainment throughout the show." place="Show Waterfront" phone="(609) 441-2000" group="At the Show" />
            <DineCard img="/show/dine-vic.jpg" name="Vic & Anthony's Steakhouse" tag="Classic steakhouse with waterfront views." place="Golden Nugget" phone="(609) 441-8355" group="Nearby Dining" />
            <DineCard img="/show/dine-chart.jpg" name="Chart House" tag="Seafood with a perfect view." place="Golden Nugget" phone="(609) 340-5030" group="Nearby Dining" />
          </div>
        </div>
      </section>

      {/* EXPLORE ATLANTIC CITY: partner pages open in the on-site modal */}
      <section id="explore-ac" style={{ scrollMarginTop: 82, background: "#fff", padding: "clamp(48px,6vw,80px) clamp(18px,4vw,44px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>Beyond the docks</Eyebrow>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(26px,3.6vw,42px)", lineHeight: 1.06, letterSpacing: "-.01em", margin: "14px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>
            Explore <span style={{ color: "var(--gold)" }}>Atlantic City</span>
          </h2>
          <span className="gold-rule" style={{ margin: "18px 0 0" }} />
          <p style={{ fontSize: "clamp(15px,1.2vw,17px)", lineHeight: 1.6, color: "rgba(20,46,81,.75)", margin: "16px 0 30px", maxWidth: "60ch" }}>
            The show is four days, and the city around it doesn&rsquo;t slow down. Browse what Atlantic City has going on without ever leaving this site.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: 18 }}>
            {/* Hotels tile: editable dates, prefilled with the show weekend */}
            <div className="card-lift" style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <button onClick={openHotels} style={{ padding: 0, border: "none", background: "none", cursor: "pointer", display: "block" }} aria-label="Browse hotels">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/show/tile-hotels.jpg" alt="" loading="lazy" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 18px 18px", flex: 1 }}>
                <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 17, color: "var(--navy)" }}>Hotels &amp; Stays</span>
                <span style={{ fontFamily: FONT, fontSize: 13.5, lineHeight: 1.55, color: "#5a6c78" }}>Rooms go fast on show weekend. Pick your dates and browse what&rsquo;s open.</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 3, fontFamily: FONT, fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(20,46,81,.6)" }}>
                    Check-in
                    <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} style={{ fontFamily: FONT, fontSize: 13, color: "var(--navy)", border: "1px solid rgba(20,46,81,.2)", borderRadius: 8, padding: "7px 9px", background: "var(--bluetint)" }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 3, fontFamily: FONT, fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(20,46,81,.6)" }}>
                    Check-out
                    <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} style={{ fontFamily: FONT, fontSize: 13, color: "var(--navy)", border: "1px solid rgba(20,46,81,.2)", borderRadius: 8, padding: "7px 9px", background: "var(--bluetint)" }} />
                  </label>
                </div>
                <button onClick={openHotels} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: FONT, fontWeight: 700, fontSize: 11.5, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--linkblue)", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: "auto", paddingTop: 8 }}>
                  Browse Hotels <span aria-hidden>→</span>
                </button>
              </div>
            </div>
            {[
              { t: "Beaches & Boardwalk", d: "The famous boardwalk and wide, clean beaches start a few minutes from the marina.", u: "https://www.visitatlanticcity.com/things-to-do/beaches-boardwalk/", img: "/show/tile-beaches.jpg" },
              { t: "Shopping", d: "Boutiques, brand-name outlets, and tax-free clothing. Some of the best shopping on the coast.", u: "https://www.visitatlanticcity.com/things-to-do/shopping/", img: "/show/tile-shopping.jpg" },
              { t: "Casinos", d: "Nine casinos in town, one of them right at the show. Try your luck when the docks close.", u: "https://www.visitatlanticcity.com/things-to-do/casinos/", img: "/show/tile-casinos.jpg" },
              { t: "Nightlife & Entertainment", d: "Live music, comedy, and late nights, from Boardwalk Hall to the beach bars.", u: "https://www.visitatlanticcity.com/things-to-do/nightlife/", img: "/show/tile-nightlife.jpg" },
              { t: "All Things to Do", d: "The aquarium, golf, family attractions, and everything else worth a detour.", u: "https://www.visitatlanticcity.com/things-to-do/", img: "/show/tile-things.jpg" },
            ].map((c) => (
              <button
                key={c.t}
                onClick={() => openTickets(c.u, c.t)}
                className="card-lift"
                style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, overflow: "hidden", padding: 0, display: "flex", flexDirection: "column", alignItems: "stretch", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt="" loading="lazy" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
                <span style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 18px 18px", flex: 1 }}>
                  <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 17, color: "var(--navy)" }}>{c.t}</span>
                  <span style={{ fontFamily: FONT, fontSize: 13.5, lineHeight: 1.55, color: "#5a6c78" }}>{c.d}</span>
                  <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 11.5, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--linkblue)", marginTop: "auto", paddingTop: 6 }}>Take a look <span aria-hidden>→</span></span>
                </span>
              </button>
            ))}
          </div>
          <p style={{ fontFamily: FONT, fontSize: 12.5, color: "#8595a0", margin: "16px 0 0" }}>
            Listings and booking are provided by Visit Atlantic City and open right here in a viewer.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
