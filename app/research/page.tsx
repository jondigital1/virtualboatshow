"use client";

import Link from "next/link";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, MONO, fmt, Eyebrow } from "@/components/ui";
import { useIframeModal } from "@/components/IframeModal";
import { SHOW_STATS } from "@/lib/inventory";

const BGS = [
  "repeating-linear-gradient(135deg,#ccd8dc 0 14px,#c3d0d5 14px 28px)",
  "repeating-linear-gradient(135deg,#d7ddd1 0 14px,#ced5c7 14px 28px)",
  "repeating-linear-gradient(135deg,#d1dae0 0 14px,#c7d1d8 14px 28px)",
  "repeating-linear-gradient(135deg,#dcd6cc 0 14px,#d3ccbf 14px 28px)",
];

type Market = { town: string; state: string; dealer: string; href: string; live: boolean };
const MARKETS: Market[] = [
  { town: "Point Pleasant", state: "NJ", dealer: "Clarks Landing Yacht Sales", href: "/point-pleasant", live: true },
  { town: "Toms River", state: "NJ", dealer: "Coming soon", href: "#", live: false },
  { town: "Brielle", state: "NJ", dealer: "Coming soon", href: "#", live: false },
  { town: "Annapolis", state: "MD", dealer: "Coming soon", href: "#", live: false },
];

type Cat = { tag: string; title: string; desc: string; href: string; live: boolean };
const CATS: Cat[] = [
  { tag: "Why buy", title: "Why the boat show wins", desc: "The full research on show pricing, trades, and the four-day deal window.", href: "/why-the-show", live: true },
  { tag: "Local guides", title: "Boating in your town", desc: "Local water, marinas, launch ramps and fishing for every market in the show.", href: "/point-pleasant", live: true },
  { tag: "Coming soon", title: "Model research", desc: "Head-to-head breakdowns of the hulls and brands headed to the docks.", href: "#", live: false },
  { tag: "Coming soon", title: "Ownership & cost guides", desc: "What a boat really costs to run, insure, dock, and maintain each season.", href: "#", live: false },
];

export default function Research() {
  const { open: openTickets } = useIframeModal();
  const avg = "$" + fmt(SHOW_STATS.avgSave);

  return (
    <>
      <AnnouncementBar />
      <Nav active="/research" />

      {/* HERO */}
      <section style={{ background: "#0A2138", color: "#fff", padding: "clamp(52px,6vw,96px) clamp(18px,5vw,56px) clamp(48px,6vw,80px)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-6%", width: "56%", height: "150%", background: "radial-gradient(circle at 70% 35%, rgba(242,106,62,.15), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>The research library</Eyebrow>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(38px,5.6vw,76px)", lineHeight: 0.98, letterSpacing: "-.03em", margin: "18px 0 0" }}>Know before you go aboard.</h1>
          <p style={{ fontSize: "clamp(16px,1.3vw,19px)", lineHeight: 1.6, color: "rgba(255,255,255,.8)", margin: "22px auto 0", maxWidth: "60ch" }}>Straight answers on why the show wins, what a boat costs to own, and the local water wherever the Virtual Boat Show lands. Written for boaters, not for algorithms.</p>
        </div>
      </section>

      {/* FEATURED */}
      <section style={{ background: "#F4F1EA", padding: "clamp(56px,7vw,96px) clamp(18px,5vw,56px) clamp(20px,3vw,32px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Link href="/why-the-show" className="card-lift" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 24, overflow: "hidden", color: "inherit" }}>
            <div style={{ background: "#050F1A", color: "#fff", padding: "clamp(34px,4vw,56px)", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,106,62,.25), transparent 70%)" }} />
              <div style={{ position: "relative", fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)" }}>Featured guide</div>
              <div style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,3vw,42px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: "16px 0 0" }}>Why the boat show is the steal of the year</div>
              <div style={{ position: "relative", fontSize: 16, color: "rgba(255,255,255,.75)", marginTop: 14, lineHeight: 1.55, maxWidth: "46ch" }}>The research on why show pricing beats the showroom, plus the easy path from ticket to keys.</div>
              <div style={{ position: "relative", marginTop: 26, fontFamily: MONO, fontSize: 13, color: "var(--accent)" }}>Read the guide →</div>
            </div>
            <div style={{ padding: "clamp(34px,4vw,56px)", display: "flex", flexDirection: "column", gap: 18, justifyContent: "center" }}>
              {[
                [avg, "avg. off MSRP at the show"],
                [`${SHOW_STATS.days} days`, "the deal window, once a year"],
                [String(SHOW_STATS.dealers), "dealers competing in one marina"],
              ].map(([n, label], i) => (
                <div key={label}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(36px,4vw,52px)", color: "#0A2138", lineHeight: 1, letterSpacing: "-.02em" }}>{n}</span>
                    <span style={{ fontSize: 14, color: "#5a6c78" }}>{label}</span>
                  </div>
                  {i < 2 && <div style={{ height: 1, background: "rgba(11,34,56,.1)", marginTop: 18 }} />}
                </div>
              ))}
            </div>
          </Link>
        </div>
      </section>

      {/* LOCAL MARKET GUIDES */}
      <section style={{ background: "#F4F1EA", padding: "clamp(52px,6vw,84px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 30 }}>
            <div>
              <Eyebrow>Local market guides</Eyebrow>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.4vw,44px)", lineHeight: 1.05, letterSpacing: "-.02em", margin: "12px 0 0", maxWidth: "22ch" }}>Where the show is boating.</h2>
            </div>
            <p style={{ fontFamily: MONO, fontSize: 12, color: "#7c8b96", margin: 0, maxWidth: "34ch", lineHeight: 1.5 }}>A guide for every town in the show, written by people who know the local water.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,280px),1fr))", gap: 18 }}>
            {MARKETS.map((m, i) => {
              const inner = (
                <>
                  <div style={{ position: "relative", aspectRatio: "16/10", background: BGS[i % BGS.length], display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(24px,2.4vw,34px)", color: "rgba(10,33,56,.32)", letterSpacing: "-.02em" }}>{m.state}</span>
                    <span style={{ position: "absolute", top: 11, left: 11, fontFamily: MONO, fontSize: 9.5, letterSpacing: ".1em", background: m.live ? "var(--accent)" : "rgba(8,24,41,.72)", color: m.live ? "#0A2138" : "#fff", padding: "5px 9px", borderRadius: 6 }}>{m.live ? "GUIDE LIVE" : "COMING SOON"}</span>
                  </div>
                  <div style={{ padding: "20px 20px 22px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, margin: 0, letterSpacing: "-.01em" }}>{m.town}, {m.state}</h3>
                    <div style={{ fontSize: 14, color: "#5a6c78", lineHeight: 1.45 }}>{m.dealer}</div>
                    <div style={{ marginTop: "auto", paddingTop: 14, fontFamily: MONO, fontSize: 12, color: m.live ? "var(--accent)" : "#9aa7b0" }}>{m.live ? "Read the local guide →" : "In the works"}</div>
                  </div>
                </>
              );
              const style: React.CSSProperties = { background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", color: "inherit", opacity: m.live ? 1 : 0.62 };
              return m.live ? (
                <Link key={m.town} href={m.href} className="card-lift" style={style}>{inner}</Link>
              ) : (
                <div key={m.town} style={{ ...style, cursor: "default" }}>{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MORE CATEGORIES */}
      <section style={{ background: "#E9EEEE", padding: "clamp(70px,9vw,120px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>More in the library</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.6vw,46px)", lineHeight: 1.04, letterSpacing: "-.02em", margin: "12px 0 38px", maxWidth: "20ch" }}>Growing every week.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 18 }}>
            {CATS.map((c) => {
              const inner = (
                <>
                  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: c.live ? "var(--accent)" : "#9aa7b0" }}>{c.tag}</div>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 21, margin: "14px 0 10px", letterSpacing: "-.01em" }}>{c.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.55, color: "#5a6c78", margin: "0 0 18px" }}>{c.desc}</p>
                  <div style={{ marginTop: "auto", fontFamily: MONO, fontSize: 12, color: c.live ? "var(--accent)" : "#9aa7b0" }}>{c.live ? "Explore →" : "In the works"}</div>
                </>
              );
              const style: React.CSSProperties = { background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 20, padding: "30px 26px", display: "flex", flexDirection: "column", color: "inherit", opacity: c.live ? 1 : 0.62 };
              return c.live ? (
                <Link key={c.title} href={c.href} className="card-lift" style={style}>{inner}</Link>
              ) : (
                <div key={c.title} style={{ ...style, cursor: "default" }}>{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#0A2138", color: "#fff", padding: "clamp(60px,7vw,100px) clamp(18px,5vw,56px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(242,106,62,.16), transparent 58%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.02, letterSpacing: "-.03em", margin: 0 }}>Done reading? Come see it in the water.</h2>
          <p style={{ fontSize: "clamp(16px,1.3vw,19px)", lineHeight: 1.55, color: "rgba(255,255,255,.78)", margin: "18px auto 0", maxWidth: "50ch" }}>The Atlantic City In-Water Boat Show runs September 10-13. Reserve your ticket and unlock live pricing early.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 13, justifyContent: "center", marginTop: 32 }}>
            <button onClick={() => openTickets()} className="h-lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 16, padding: "16px 28px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Get Boat Show Tickets →</button>
            <Link href="/inventory" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.08)", color: "#fff", fontWeight: 600, fontSize: 16, padding: "16px 28px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,.32)" }}>Browse the inventory</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
