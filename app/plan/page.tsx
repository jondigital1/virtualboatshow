"use client";

import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { Eyebrow } from "@/components/ui";
import { useIframeModal } from "@/components/IframeModal";

const FONT = "var(--font-poppins), sans-serif";

const DIRECTIONS_URL = "https://www.google.com/maps/search/?api=1&query=Farley+State+Marina%2C+Atlantic+City%2C+NJ";
const SHOW_SITE = "https://acinwaterboatshow.com";

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

function DineCard({ img, name, tag, phone, place }: { img: string; name: string; tag: string; phone: string; place: string }) {
  return (
    <div className="card-lift-sm" style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt={name} loading="lazy" style={{ width: "100%", aspectRatio: "2/1", objectFit: "cover", display: "block" }} />
      <div style={{ padding: "16px 16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16.5, color: "var(--navy)" }}>{name}</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "rgba(20,46,81,.7)" }}>{tag}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 6, fontSize: 13, color: "rgba(20,46,81,.65)" }}>
          <span>📍 {place}</span>
          <a href={"tel:" + phone.replace(/[^0-9]/g, "")} style={{ color: "var(--linkblue)", fontWeight: 600 }}>☎ {phone}</a>
        </div>
      </div>
    </div>
  );
}

export default function PlanYourVisit() {
  const { open: openTickets } = useIframeModal();

  const cards: InfoCard[] = [
    {
      title: "Hours & Tickets",
      body: "Show dates, daily hours, admission info and ticket options.",
      cta: "Get Tickets",
      action: { kind: "tickets" },
      icon: <svg {...ICON_PROPS}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>,
    },
    {
      title: "Directions & Parking",
      body: "Find the show at Farley State Marina, get directions and parking information.",
      cta: "Get Directions",
      action: { kind: "link", href: DIRECTIONS_URL, external: true },
      icon: <svg {...ICON_PROPS}><path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" /><circle cx="12" cy="11" r="2.3" /></svg>,
    },
    {
      title: "Food & Drinks",
      body: "Enjoy great dining at the show and nearby Golden Nugget restaurants.",
      cta: "View Details",
      action: { kind: "link", href: "#dining" },
      icon: <svg {...ICON_PROPS}><path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M17 3c-1.7 0-3 2-3 5v3h3M17 3v18M17 11v10" transform="translate(1 0) scale(.92)" /></svg>,
    },
    {
      title: "Stay & Play",
      body: "Where to stay and more to do in Atlantic City.",
      cta: "View Details",
      action: { kind: "link", href: "#weekend" },
      icon: <svg {...ICON_PROPS}><path d="M3 20V9l9-5 9 5v11" /><path d="M9 20v-6h6v6" /></svg>,
    },
  ];

  const cardAction = (c: InfoCard) => {
    const style: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, color: "var(--linkblue)", fontFamily: FONT, fontWeight: 700, fontSize: 12.5, letterSpacing: ".07em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", padding: 0 };
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
              Everything you need to plan your Atlantic City In-Water Boat Show experience — from show hours and parking to waterfront dining and where to stay.
            </p>
          </div>
          <div style={{ minWidth: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/show/golden-nugget.jpg" alt="Golden Nugget Atlantic City and Farley State Marina" style={{ display: "block", width: "100%", height: "auto", borderRadius: 4 }} />
          </div>
        </div>
      </section>

      {/* INFO CARDS */}
      <section style={{ background: "var(--bluetint)", padding: "clamp(36px,4.5vw,60px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 18 }}>
          {cards.map((c) => (
            <div key={c.title} className="card-lift-sm" style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, padding: "26px 24px", display: "flex", flexDirection: "column", gap: 13, alignItems: "flex-start" }}>
              <Circle>{c.icon}</Circle>
              <h3 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 17.5, letterSpacing: ".01em", margin: 0, color: "var(--navy)", textTransform: "uppercase" }}>{c.title}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "rgba(20,46,81,.7)", margin: 0, flex: 1 }}>{c.body}</p>
              {cardAction(c)}
            </div>
          ))}
        </div>
      </section>

      {/* FOOD & DRINKS */}
      <section id="dining" style={{ scrollMarginTop: 82, background: "#fff", padding: "clamp(48px,6vw,84px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(24px,3.2vw,38px)", letterSpacing: "-.01em", margin: 0, color: "var(--navy)", textTransform: "uppercase" }}>Food &amp; Drinks</h2>
          <span className="gold-rule" style={{ margin: "16px 0 0" }} />
          <p style={{ fontSize: "clamp(15px,1.15vw,17px)", lineHeight: 1.6, color: "rgba(20,46,81,.75)", margin: "16px 0 0", maxWidth: "64ch" }}>
            From casual bites at the show to world-class dining at the Golden Nugget, there&rsquo;s something for every taste.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "clamp(24px,3vw,40px)", marginTop: 34 }}>
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 16, letterSpacing: ".03em", color: "var(--navy)", textTransform: "uppercase" }}>At the Show</div>
              <p style={{ fontSize: 14, color: "rgba(20,46,81,.65)", margin: "6px 0 16px" }}>Grab a bite, enjoy a drink and take in the waterfront views.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,210px),1fr))", gap: 16 }}>
                <DineCard img="/show/dine-deck.jpg" name="The Deck" tag="Waterfront dining, drinks and light bites." place="Show Waterfront" phone="(609) 441-2000" />
                <DineCard img="/show/dine-live.jpg" name="Live Entertainment" tag="Live music and entertainment throughout the show." place="Show Waterfront" phone="(609) 441-2000" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 16, letterSpacing: ".03em", color: "var(--navy)", textTransform: "uppercase" }}>Nearby Dining</div>
              <p style={{ fontSize: 14, color: "rgba(20,46,81,.65)", margin: "6px 0 16px" }}>World-class restaurants at the Golden Nugget and beyond.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,210px),1fr))", gap: 16 }}>
                <DineCard img="/show/dine-vic.jpg" name="Vic & Anthony's Steakhouse" tag="Classic steakhouse with waterfront views." place="Golden Nugget" phone="(609) 441-8355" />
                <DineCard img="/show/dine-chart.jpg" name="Chart House" tag="Seafood with a perfect view." place="Golden Nugget" phone="(609) 340-5030" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAKE IT A WEEKEND */}
      <section id="weekend" style={{ scrollMarginTop: 82, position: "relative", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/show/ac-boardwalk.jpg" alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(244,247,249,.96) 0%, rgba(244,247,249,.82) 34%, rgba(244,247,249,0) 62%)" }} />
        <div style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,96px) clamp(18px,5vw,56px)" }}>
          <div style={{ maxWidth: 460 }}>
            <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(28px,3.6vw,44px)", letterSpacing: "-.01em", margin: 0, color: "var(--navy)" }}>Make It a Weekend</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0 0" }}>
              <span aria-hidden style={{ height: 2, width: 34, background: "var(--navy)", opacity: 0.4 }} />
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, letterSpacing: ".14em", color: "var(--linkblue)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Atlantic City Awaits</span>
              <span aria-hidden style={{ height: 2, width: 34, background: "var(--navy)", opacity: 0.4 }} />
            </div>
            <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "rgba(20,46,81,.85)", margin: "16px 0 0" }}>
              Stay, dine and play in Atlantic City. Find the best hotel deals and explore top attractions just minutes from the marina.
            </p>
            <a
              href={SHOW_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="h-brighten"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 12.5, letterSpacing: ".07em", textTransform: "uppercase", padding: "14px 24px", borderRadius: 8 }}
            >
              Explore Stay &amp; Play <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
