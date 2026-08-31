"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { ShowMap } from "@/components/ShowMap";
import { Eyebrow } from "@/components/ui";
import { pickFeatured, boatTitle, type ShowBoat } from "@/lib/showboats";
import { pickExhibitors, initials, type Row as Exhibitor } from "@/lib/exhibitors";

const FONT = "var(--font-poppins), sans-serif";
const SECTION_PAD = "clamp(56px,7vw,96px) clamp(18px,5vw,56px)";

/* ---- small helpers ---- */

function InfoBar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.35)", borderRadius: 10, padding: "11px 16px", marginTop: 22 }}>
      <span aria-hidden style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--lightblue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flex: "0 0 auto" }}>i</span>
      <span style={{ fontSize: 13.5, color: "rgba(20,46,81,.75)" }}>{children}</span>
    </div>
  );
}

function OutlineBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="btn-outline"
      style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "var(--navy)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", padding: "12px 20px", borderRadius: 8, border: "1.5px solid var(--lightblue)" }}
    >
      {children} <span aria-hidden>→</span>
    </Link>
  );
}

export default function Home() {
  // Curated show boats (data/show-boats.json). Random picks are client-only
  // (useEffect) so the server render never mismatches, and every page load
  // reshuffles — each dealer gets equal turns at the featured real estate.
  const [featured, setFeatured] = useState<ShowBoat[]>([]);
  const [thumbs, setThumbs] = useState<ShowBoat[]>([]);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);

  useEffect(() => {
    const picks = pickFeatured(10);
    setFeatured(picks.slice(0, 6));
    const rest = picks.slice(6, 10);
    setThumbs(rest.length === 4 ? rest : picks.slice(0, 4));
    setExhibitors(pickExhibitors(4));
  }, []);

  return (
    <>
      <AnnouncementBar />
      <Nav active="/" />

      {/* HERO — spacious, promotional, unmistakably AC In-Water Boat Show */}
      <section style={{ position: "relative", background: "#fff", overflow: "hidden" }}>
        <div style={{ maxWidth: 1340, margin: "0 auto", padding: "clamp(20px,3vw,40px) clamp(18px,4vw,44px) clamp(40px,5vw,64px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "clamp(20px,3vw,44px)", alignItems: "center" }}>
          <div style={{ minWidth: 0, paddingTop: "clamp(8px,2vw,28px)" }}>
            <Eyebrow>The Official Virtual Boat Show</Eyebrow>
            <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(34px,4.6vw,60px)", lineHeight: 1.08, letterSpacing: "-.015em", margin: "16px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>
              Explore the boats
              <br />
              <span style={{ color: "var(--gold)" }}>before you hit the docks.</span>
            </h1>
            <span className="gold-rule" style={{ margin: "22px 0 0", background: "var(--lightblue)" }} />
            <p style={{ maxWidth: 480, fontSize: "clamp(15.5px,1.2vw,17.5px)", lineHeight: 1.65, color: "rgba(20,46,81,.8)", margin: "22px 0 0" }}>
              Browse participating dealers and available inventory, see what&rsquo;s coming to the docks, and plan your Atlantic City waterfront weekend.
            </p>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(30px,3.4vw,44px)", letterSpacing: ".01em", margin: "30px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>
              Let&rsquo;s <span style={{ color: "var(--gold)" }}>Boat!</span>
            </div>
          </div>

          <div style={{ minWidth: 0, position: "relative", borderRadius: 6, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/show/hero-marina-aerial.jpg"
              alt="Aerial view of hundreds of boats filling Farley State Marina beside the Golden Nugget in Atlantic City"
              style={{ display: "block", width: "100%", height: "auto" }}
            />
            {/* brand wave accent along the waterline, echoing the logo */}
            <svg aria-hidden viewBox="0 0 1600 120" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: -1, width: "100%", height: "clamp(34px,6vw,64px)", display: "block" }}>
              <path d="M0,78 C300,18 620,118 900,70 C1180,26 1420,88 1600,52 L1600,120 L0,120 Z" fill="#75BAE4" opacity="0.9" />
              <path d="M0,96 C320,44 640,132 940,88 C1220,50 1440,104 1600,74 L1600,120 L0,120 Z" fill="#FDB717" />
              <path d="M0,112 C340,76 700,138 1020,104 C1280,80 1470,116 1600,98 L1600,120 L0,120 Z" fill="#fff" />
            </svg>
          </div>
        </div>
      </section>

      {/* EXPLORE THE SHOW — the bridge into both directories */}
      <section id="explore" style={{ scrollMarginTop: 82, background: "var(--bluetint)", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>The Show, Your Way</Eyebrow>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.05, letterSpacing: "-.01em", margin: "14px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>Explore the Show</h2>
          <span className="gold-rule" style={{ margin: "18px 0 0" }} />
          <p style={{ fontSize: "clamp(15.5px,1.2vw,17.5px)", lineHeight: 1.6, color: "rgba(20,46,81,.75)", margin: "18px 0 0", maxWidth: "58ch" }}>
            Two ways to discover everything waiting for you at the Atlantic City In-Water Boat Show. Find the perfect boat. Find the right products and services. All in one place.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 20, marginTop: 36 }}>
            {/* Browse Boats card */}
            <div className="card-lift" style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="explore-split">
                <div style={{ padding: "24px 22px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
                  <h3 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 19, letterSpacing: ".01em", margin: 0, color: "var(--navy)", textTransform: "uppercase" }}>Browse Boats at the Show</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "rgba(20,46,81,.7)", margin: 0 }}>Explore boats scheduled to be on display from participating dealers and brands.</p>
                  <div style={{ marginTop: "auto" }}>
                    <OutlineBtn href="/inventory">Browse Boats</OutlineBtn>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/show/explore-boats-show.jpg" alt="A Beneteau Antares 9 on display in front of the Golden Nugget at the show" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              {thumbs.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "16px", margin: "auto 0" }}>
                  {thumbs.map((b) => (
                    <Link key={b.slug} href={"/boats/" + b.slug} title={boatTitle(b)} style={{ display: "block", aspectRatio: "4/3", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(20,46,81,.1)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.photos[0]} alt={boatTitle(b)} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Marine Marketplace card */}
            <div className="card-lift" style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="explore-split">
                <div style={{ padding: "24px 22px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
                  <h3 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 19, letterSpacing: ".01em", margin: 0, color: "var(--navy)", textTransform: "uppercase" }}>Browse Marine Marketplace</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "rgba(20,46,81,.7)", margin: 0 }}>Discover marine products, services and exhibitors at the show.</p>
                  <div style={{ marginTop: "auto" }}>
                    <OutlineBtn href="/vendors">Browse Marketplace</OutlineBtn>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/show/explore-marketplace.jpg" alt="Exhibitor tents at the Marine Marketplace" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              {exhibitors.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "16px", margin: "auto 0" }}>
                  {exhibitors.map((v) => (
                    <Link key={v.n} href="/vendors" title={v.n} style={{ height: "100%", minHeight: 118, borderRadius: 8, border: "1px solid rgba(117,186,228,.4)", background: "var(--bluetint)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 6px", textAlign: "center", minWidth: 0 }}>
                      <span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 12.5, flex: "0 0 auto" }}>{initials(v.n)}</span>
                      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 11, lineHeight: 1.25, color: "var(--navy)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{v.n}</span>
                      <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 9.5, color: "rgba(20,46,81,.55)", textTransform: "uppercase", letterSpacing: ".05em" }}>{[v.c, v.s].filter((x) => x && x !== "N/A").join(", ")}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED AT THE SHOW — rotating, dealer-fair selection */}
      {featured.length > 0 && (
        <section id="featured" style={{ scrollMarginTop: 82, background: "#fff", padding: SECTION_PAD }}>
          <div style={{ maxWidth: 1240, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
              <div>
                <Eyebrow>On the Water This Year</Eyebrow>
                <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.05, letterSpacing: "-.01em", margin: "14px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>
                  Featured at <span style={{ color: "var(--gold)" }}>the show</span>
                </h2>
                <span className="gold-rule" style={{ margin: "18px 0 0" }} />
              </div>
              <Link href="/inventory" className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "var(--navy)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", padding: "12px 20px", borderRadius: 8, border: "1.5px solid var(--lightblue)" }}>
                See All Boats <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="featured-grid" style={{ marginTop: 30 }}>
              {featured.map((b) => (
                <Link key={b.slug} href={"/boats/" + b.slug} className="card-lift" style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, overflow: "hidden", display: "block" }}>
                  <div style={{ position: "relative", aspectRatio: "16/10" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.photos[0]} alt={boatTitle(b)} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    {b.notes && (
                      <span style={{ position: "absolute", top: 11, left: 11, fontFamily: FONT, fontWeight: 700, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", background: "var(--gold)", color: "#142E51", padding: "5px 10px", borderRadius: 6, maxWidth: "85%" }}>{b.notes}</span>
                    )}
                  </div>
                  <div style={{ padding: "16px 18px 18px" }}>
                    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(20,46,81,.55)" }}>{b.brand}{b.year ? ` · ${b.year}` : ""}</div>
                    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, color: "var(--navy)", marginTop: 3, lineHeight: 1.15 }}>{b.model}</div>
                    <div style={{ fontSize: 13.5, color: "#5a6c78", marginTop: 6 }}>{b.dealers.map((d) => d.name).join(" · ")}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FIND YOUR WAY — the official 2026 visitor map */}
      <section id="map" style={{ scrollMarginTop: 82, background: "#fff", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>Getting Around</Eyebrow>
          <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.08, letterSpacing: "-.01em", margin: "14px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>
            Find your way <span style={{ color: "var(--gold)" }}>around the show.</span>
          </h2>
          <span className="gold-rule" style={{ margin: "18px 0 0", background: "var(--lightblue)" }} />
          <p style={{ fontSize: "clamp(15.5px,1.2vw,17.5px)", lineHeight: 1.6, color: "rgba(20,46,81,.75)", margin: "18px 0 0", maxWidth: "56ch" }}>
            Use the map to find boat displays, dealer locations, exhibitors in the Marine Marketplace, amenities and more.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(240px,1fr) minmax(min(100%,420px),2.2fr)", gap: 22, marginTop: 32, alignItems: "start" }} className="map-grid">
            <div style={{ background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.35)", borderRadius: 16, padding: "clamp(22px,2.5vw,32px)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
              <span aria-hidden style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" /><circle cx="12" cy="11" r="2.3" /></svg>
              </span>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 19, lineHeight: 1.25, color: "var(--navy)", textTransform: "uppercase" }}>
                Plan ahead,
                <br />
                make it a weekend!
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "rgba(20,46,81,.7)", margin: 0 }}>Find everything you need for a smooth and unforgettable boat show experience.</p>
              <OutlineBtn href="/plan">Plan Your Visit</OutlineBtn>
            </div>

            <div style={{ background: "#fff", border: "1px solid rgba(20,46,81,.14)", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 54px -32px rgba(20,46,81,.35)" }}>
              <ShowMap />
            </div>
          </div>

          <InfoBar>Map is subject to change. Please check with show staff for the most up-to-date information.</InfoBar>
        </div>
      </section>

      {/* SPONSOR ACKNOWLEDGMENT — slim strip, full wall lives at /sponsors */}
      <section style={{ background: "#fff", borderTop: "1px solid rgba(20,46,81,.08)", padding: "clamp(28px,3.5vw,44px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(20,46,81,.55)" }}>Thank you to our 2026 sponsors</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(22px,4vw,48px)", flexWrap: "wrap", marginTop: 20 }}>
            {["golden-nugget", "boating", "salt-water-sportsman", "yachting", "pursuit", "press-of-atlantic-city"].map((slug) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={slug} src={`/sponsors/${slug}.png`} alt="" loading="lazy" style={{ height: 40, maxWidth: 130, objectFit: "contain", opacity: 0.85 }} />
            ))}
          </div>
          <Link href="/sponsors" style={{ display: "inline-block", marginTop: 18, fontFamily: FONT, fontWeight: 700, fontSize: 12.5, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--linkblue)" }}>
            Meet all our sponsors <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* POWERED BY BUOY — the one block where Buoy identity leads */}
      <section id="buoy" style={{ scrollMarginTop: 82, background: "var(--bluetint)", padding: "clamp(48px,6vw,80px) clamp(18px,5vw,56px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: "clamp(28px,5vw,64px)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flex: "0 0 auto" }}>
            <Image src="/buoy-ring-logo.svg" alt="" width={56} height={56} style={{ display: "block" }} />
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: ".02em", color: "var(--navy)" }}>BUOY</span>
          </div>
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>
            <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(22px,2.6vw,30px)", margin: 0, color: "var(--navy)" }}>Powered by Buoy</h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "rgba(20,46,81,.75)", margin: "10px 0 0", maxWidth: "62ch" }}>
              Buoy provides the technology behind the Atlantic City Virtual Boat Show, helping visitors explore boats, discover dealers and exhibitors, and plan their experience before and during the show.
            </p>
          </div>
          <a
            href="https://www.buoyboating.com?utm_source=acvbs&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("buoy_referral_clicked", { page: "home" })}
            className="btn-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "var(--navy)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", padding: "13px 22px", borderRadius: 8, border: "1.5px solid rgba(20,46,81,.3)", flex: "0 0 auto" }}
          >
            Learn About Buoy <span aria-hidden>→</span>
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
