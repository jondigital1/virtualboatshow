"use client";

import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, Eyebrow } from "@/components/ui";
import { HOST_VENUE, MEDIA_PARTNERS, SHOW_PARTNERS, type Sponsor } from "@/lib/sponsors";
import Link from "next/link";

const FONT = "var(--font-poppins), sans-serif";

function SponsorCard({ s, big }: { s: Sponsor; big?: boolean }) {
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-lift-sm"
      style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, padding: big ? "34px 30px" : "26px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}
    >
      <span style={{ height: big ? 120 : 84, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/sponsors/${s.slug}.png`} alt={s.name + " logo"} loading="lazy" style={{ maxHeight: "100%", maxWidth: big ? 280 : 200, objectFit: "contain", display: "block" }} />
      </span>
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: big ? 18 : 15.5, color: "var(--navy)", lineHeight: 1.2 }}>{s.name}</span>
      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 11.5, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--linkblue)" }}>Visit their site</span>
    </a>
  );
}

export default function Sponsors() {
  return (
    <>
      <AnnouncementBar />
      <Nav />

      {/* INTRO */}
      <section style={{ background: "#fff", padding: "clamp(30px,4vw,52px) clamp(18px,4vw,44px) clamp(24px,3vw,36px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>The people behind the show</Eyebrow>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,52px)", lineHeight: 1.05, letterSpacing: "-.015em", margin: "14px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>
            Our <span style={{ color: "var(--gold)" }}>Sponsors</span>
          </h1>
          <span className="gold-rule" style={{ margin: "20px auto 0" }} />
          <p style={{ fontSize: "clamp(15.5px,1.25vw,18px)", lineHeight: 1.7, color: "rgba(20,46,81,.78)", margin: "22px auto 0", maxWidth: "62ch" }}>
            A show like this doesn&rsquo;t float on its own. The partners below put real support behind the Atlantic City In-Water Boat Show, from the marina that hosts us to the magazines, papers, and radio stations that carry the word up and down the coast. We&rsquo;re grateful for all of them, and if you have a minute, they&rsquo;re worth getting to know.
          </p>
        </div>
      </section>

      {/* HOST VENUE */}
      <section style={{ background: "#fff", padding: "clamp(20px,2.5vw,32px) clamp(18px,4vw,44px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--navy)", margin: "0 0 6px", textAlign: "center" }}>Host Venue</h2>
          <p style={{ fontFamily: FONT, fontSize: 14.5, color: "#5a6c78", textAlign: "center", margin: "0 0 20px" }}>Home water for the whole show. The docks, the backdrop, and the place to toast a good day.</p>
          <div style={{ maxWidth: 420, margin: "0 auto" }}>
            <SponsorCard s={HOST_VENUE} big />
          </div>
        </div>
      </section>

      {/* MEDIA PARTNERS */}
      <section style={{ background: "var(--bluetint)", padding: "clamp(36px,4.5vw,60px) clamp(18px,4vw,44px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--navy)", margin: "0 0 6px", textAlign: "center" }}>Media Partners</h2>
          <p style={{ fontFamily: FONT, fontSize: 14.5, color: "#5a6c78", textAlign: "center", margin: "0 0 22px" }}>The pages and airwaves that bring boaters to the docks every September.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,230px),1fr))", gap: 16 }}>
            {MEDIA_PARTNERS.map((s) => <SponsorCard key={s.slug} s={s} />)}
          </div>
        </div>
      </section>

      {/* SHOW PARTNERS */}
      <section style={{ background: "#fff", padding: "clamp(36px,4.5vw,60px) clamp(18px,4vw,44px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--navy)", margin: "0 0 6px", textAlign: "center" }}>Show Partners</h2>
          <p style={{ fontFamily: FONT, fontSize: 14.5, color: "#5a6c78", textAlign: "center", margin: "0 0 22px" }}>The builders and crews who help put the show on the water and keep it running all weekend.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,230px),1fr))", gap: 16, maxWidth: 760, margin: "0 auto" }}>
            {SHOW_PARTNERS.map((s) => <SponsorCard key={s.slug} s={s} />)}
          </div>
        </div>
      </section>

      {/* BECOME A SPONSOR */}
      <section style={{ background: "var(--navy)", padding: "clamp(40px,5vw,64px) clamp(18px,4vw,44px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(22px,2.8vw,32px)", color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: ".01em" }}>
            Want your name on this page?
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 15.5, lineHeight: 1.65, color: "rgba(255,255,255,.78)", margin: "14px auto 24px", maxWidth: "54ch" }}>
            Sponsoring the show puts your brand in front of tens of thousands of boaters on the docks and everyone browsing right here. Tell us what you have in mind and we&rsquo;ll take it from there.
          </p>
          <Link href="/vendors#inquiry" className="h-brighten" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--gold)", color: "var(--navy)", fontWeight: 700, fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase", padding: "15px 26px", borderRadius: 8 }}>
            Become a Sponsor
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
