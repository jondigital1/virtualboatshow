"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, Eyebrow } from "@/components/ui";
import { showBoats, waitingDealers, boatTitle, allBrands, allDealers, type ShowBoat } from "@/lib/showboats";

const FONT = "var(--font-poppins), sans-serif";

const FAQ_DATA: [string, string][] = [
  ["Should I buy a new or used boat?", "New boats bring full factory warranties and the latest tech; used boats stretch your budget and hold value when they’re well kept. At the show you can weigh both side by side and compare honestly before you ever board."],
  ["What do engine hours actually tell me?", "Hours are the odometer of the water. Under about 100 a year is light use, but documented service history matters even more. Your dockside walkthrough is the time to ask the dealer for maintenance records."],
  ["Can I take the boat out before I buy?", "Nothing replaces time on the water. Ask the dealer at the show. Many will arrange a sea trial where available, so you can feel how she handles before you commit to anything."],
  ["What does a boat really cost to own beyond the sticker?", "Plan for insurance, storage or a slip, fuel, winterizing, registration, and routine maintenance. A good rule of thumb is roughly 10% of the purchase price each year. Ask each dealer to break the numbers down for your specific boat."],
  ["How does boat financing work, and should I get pre-qualified?", "Marine loans commonly run 10 to 20 years with 10-20% down. Getting pre-qualified before the show tells you your true budget and speeds everything up. Several lenders exhibit on-site."],
  ["Is the “Boat Show Price” really a better deal?", "Show pricing is negotiated for the event. Talking to the dealer at the dock is how you get it, and pricing details are confirmed with the dealer at the show."],
  ["Can I trade in or sell my current boat?", "Absolutely. Talk to the dealer for the boat you're interested in. Starting the conversation before the show means your trade-in is ready to discuss when you arrive."],
  ["What’s included: trailer, electronics, warranty?", "It varies boat to boat, so confirm what’s on the sticker: trailer, electronics package, and any remaining factory or extended warranty. Your walkthrough is the moment to get every inclusion in writing."],
];

const selectStyle: React.CSSProperties = { background: "#fff", border: "1px solid rgba(20,46,81,.16)", borderRadius: 10, padding: "12px 34px 12px 14px", fontSize: 14, color: "#142E51", cursor: "pointer", fontFamily: FONT };

export default function Inventory() {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("all");
  const [dealer, setDealer] = useState("all");
  const [sort, setSort] = useState("featured");
  const [faqOpen, setFaqOpen] = useState(-1);

  const brands = useMemo(allBrands, []);
  const dealers = useMemo(allDealers, []);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    let l = showBoats.filter((b) => {
      if (brand !== "all" && b.brand !== brand) return false;
      if (dealer !== "all" && !b.dealers.some((d) => d.name === dealer)) return false;
      if (query && !(boatTitle(b) + " " + b.dealers.map((d) => d.name).join(" ")).toLowerCase().includes(query)) return false;
      return true;
    });
    if (sort === "brand") l = [...l].sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
    else if (sort === "length") l = [...l].sort((a, b) => (b.lengthFt ?? 0) - (a.lengthFt ?? 0));
    else if (sort === "year") l = [...l].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    else l = [...l].sort((a, b) => a.priority - b.priority || a.brand.localeCompare(b.brand));
    return l;
  }, [q, brand, dealer, sort]);

  const clearAll = () => { setQ(""); setBrand("all"); setDealer("all"); };

  return (
    <>
      <AnnouncementBar />
      <Nav active="/inventory" />

      {/* PAGE HEAD */}
      <section style={{ background: "#fff", padding: "clamp(24px,3vw,40px) clamp(18px,3vw,44px) 0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "clamp(18px,3vw,36px)", alignItems: "center" }}>
            <div>
              <Eyebrow>Explore the Show</Eyebrow>
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,3.6vw,46px)", lineHeight: 1.06, letterSpacing: "-.015em", margin: "12px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>Browse Boats at the Show</h1>
              <span className="gold-rule" style={{ margin: "16px 0 0" }} />
              <p style={{ fontSize: 15.5, color: "#4c6270", margin: "16px 0 0", maxWidth: "52ch", lineHeight: 1.6 }}>
                Explore the feature boats participating dealers are bringing to the Atlantic City In-Water Boat Show. These are the boats you can see in person during the show.
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.4)", borderRadius: 999, padding: "9px 16px", marginTop: 18 }}>
                <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "var(--navy)" }}>{showBoats.length} feature boats · {dealers.length} dealers · 250+ boats in the water at the show</span>
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/show/banner-boats.jpg" alt="Boats and dealer tents lining the docks at the show" style={{ display: "block", width: "100%", height: "auto", borderRadius: 4 }} />
            </div>
          </div>

          {/* SEARCH + FILTERS */}
          <div style={{ background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.35)", borderRadius: 16, padding: "clamp(14px,2vw,20px)", marginTop: 28 }}>
            <div style={{ position: "relative" }}>
              <span aria-hidden style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(20,46,81,.45)" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              </span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search boats, brands, models or dealers…" style={{ width: "100%", background: "#fff", border: "1px solid rgba(20,46,81,.16)", borderRadius: 10, padding: "13px 16px 13px 42px", fontSize: 15, color: "#142E51", fontFamily: FONT }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <select value={brand} onChange={(e) => setBrand(e.target.value)} style={selectStyle} aria-label="Filter by brand">
                <option value="all">Brand: All</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={dealer} onChange={(e) => setDealer(e.target.value)} style={selectStyle} aria-label="Filter by dealer">
                <option value="all">Dealer: All</option>
                {dealers.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle} aria-label="Sort">
                <option value="featured">Sort: Featured</option>
                <option value="brand">Brand A–Z</option>
                <option value="year">Year: Newest</option>
                <option value="length">Length: Longest</option>
              </select>
              {(q || brand !== "all" || dealer !== "all") && (
                <button onClick={clearAll} style={{ background: "none", border: "none", color: "var(--linkblue)", fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer", padding: "6px 4px" }}>Clear All</button>
              )}
              <span style={{ marginLeft: "auto", fontFamily: FONT, fontSize: 13, color: "rgba(20,46,81,.6)" }}>
                <strong style={{ color: "var(--navy)" }}>{list.length}</strong> {list.length === 1 ? "result" : "results"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section style={{ background: "#fff", padding: "clamp(22px,2.5vw,32px) clamp(18px,3vw,44px) clamp(56px,7vw,90px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,250px),1fr))", gap: 18 }}>
            {list.map((b) => (
              <ShowBoatCard key={b.slug} b={b} />
            ))}
          </div>

          {list.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed rgba(20,46,81,.2)", borderRadius: 18 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 21, color: "var(--navy)" }}>No boats match those filters.</div>
              <p style={{ color: "#5a6c78", margin: "10px 0 18px" }}>Try widening your search. New boats are added as dealers confirm their show lineups.</p>
              <button onClick={clearAll} className="btn-invert" style={{ background: "#142E51", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 20px", borderRadius: 999, border: "none", cursor: "pointer" }}>Clear all filters</button>
            </div>
          )}

          {waitingDealers.length > 0 && (
            <div style={{ marginTop: 34 }}>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, color: "var(--navy)", textTransform: "uppercase", letterSpacing: ".02em", margin: 0 }}>More lineups on the way</h2>
              <p style={{ fontSize: 14, color: "#5a6c78", margin: "6px 0 14px" }}>These dealers are at the show, and their feature boats are being finalized.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {waitingDealers.map((w) => (
                  <span key={w.dealer} style={{ background: "#fff", border: "1px solid rgba(20,46,81,.14)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#33454f" }}>
                    <strong style={{ color: "var(--navy)" }}>{w.dealer}</strong> · {w.brands.join(", ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "var(--bluetint)", padding: "clamp(56px,7vw,96px) clamp(18px,3vw,44px)", borderTop: "1px solid rgba(20,46,81,.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Eyebrow style={{ textAlign: "center" }}>Before you buy</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.6vw,42px)", lineHeight: 1.04, letterSpacing: "-.01em", margin: "14px 0 0", textAlign: "center", color: "var(--navy)" }}>Boat-buying questions, answered.</h2>
          <p style={{ textAlign: "center", fontSize: 16, color: "#4c6270", margin: "14px auto 40px", maxWidth: "58ch" }}>New to the docks or trading up? Here’s what smart buyers sort out before they step aboard.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQ_DATA.map(([q2, a], i) => {
              const open = faqOpen === i;
              return (
                <div key={q2} style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, overflow: "hidden" }}>
                  <button onClick={() => setFaqOpen(open ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "20px clamp(18px,2vw,26px)" }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(16px,1.5vw,19px)", color: "#142E51", letterSpacing: "-.01em" }}>{q2}</span>
                    <span style={{ flex: "0 0 auto", width: 27, height: 27, borderRadius: "50%", background: open ? "var(--gold)" : "rgba(20,46,81,.06)", color: open ? "#142E51" : "#4c6270", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, lineHeight: 1, transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform .25s, background .2s" }}>+</span>
                  </button>
                  <div style={{ maxHeight: open ? 540 : 0, overflow: "hidden", transition: "max-height .32s ease" }}>
                    <p style={{ margin: 0, padding: "0 clamp(18px,2vw,26px) 22px", fontSize: 15.5, lineHeight: 1.62, color: "#4c6270" }}>{a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function ShowBoatCard({ b }: { b: ShowBoat }) {
  const href = `/boats/${b.slug}`;
  const title = boatTitle(b);
  const dealerLine = b.dealers.map((d) => d.name).join(" · ");
  // In-card photo browsing: arrows + dots + swipe, without leaving the SRP.
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);
  const many = b.photos.length > 1;
  const step = (d: number) => setIdx((i) => (i + d + b.photos.length) % b.photos.length);
  const arrowStyle = (side: "left" | "right"): React.CSSProperties => ({ position: "absolute", [side]: 6, top: "50%", transform: "translateY(-50%)", zIndex: 3, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.92)", color: "var(--navy)", cursor: "pointer", fontSize: 17, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(20,46,81,.25)" });
  return (
    <div className="card-lift" style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{ position: "relative", aspectRatio: "16/11", background: "linear-gradient(160deg,#e8eef3,#dfe7ee)", touchAction: "pan-y" }}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current === null || !many) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <Link href={href} aria-label={`${title} details`} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          {b.photos.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.photos[idx] ?? b.photos[0]} alt={title} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ac-mark.png" alt="" style={{ width: 74, opacity: 0.5 }} />
              <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 11, letterSpacing: ".08em", color: "rgba(20,46,81,.45)", textTransform: "uppercase" }}>Photos coming soon</span>
            </span>
          )}
        </Link>
        {many && (
          <>
            <button aria-label="Previous photo" onClick={() => step(-1)} style={arrowStyle("left")}>‹</button>
            <button aria-label="Next photo" onClick={() => step(1)} style={arrowStyle("right")}>›</button>
            {b.photos.length <= 8 ? (
              <span aria-hidden style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", zIndex: 2, display: "flex", gap: 5, pointerEvents: "none" }}>
                {b.photos.map((_, i) => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === idx ? "#fff" : "rgba(255,255,255,.5)", boxShadow: "0 1px 3px rgba(20,46,81,.4)" }} />
                ))}
              </span>
            ) : (
              <span aria-hidden style={{ position: "absolute", bottom: 8, right: 8, zIndex: 2, pointerEvents: "none", fontFamily: FONT, fontWeight: 700, fontSize: 10.5, background: "rgba(20,46,81,.75)", color: "#fff", padding: "3px 8px", borderRadius: 999 }}>
                {idx + 1} / {b.photos.length}
              </span>
            )}
          </>
        )}
        {b.notes ? (
          <span style={{ position: "absolute", top: 9, left: 9, fontFamily: FONT, fontWeight: 700, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", background: "var(--gold)", color: "#142E51", padding: "5px 9px", borderRadius: 6, pointerEvents: "none", zIndex: 2, maxWidth: "80%" }}>{b.notes}</span>
        ) : b.priority === 1 ? (
          <span style={{ position: "absolute", top: 9, left: 9, fontFamily: FONT, fontWeight: 700, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", background: "rgba(20,46,81,.92)", color: "#fff", padding: "5px 9px", borderRadius: 6, pointerEvents: "none", zIndex: 2 }}>Dealer Feature</span>
        ) : null}
      </div>
      <div style={{ padding: "14px 15px 16px", display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(20,46,81,.55)" }}>{b.brand}{b.year ? ` · ${b.year}` : ""}</div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 17.5, margin: "3px 0 0", lineHeight: 1.15, letterSpacing: "-.01em", color: "var(--navy)" }}>
            <Link href={href} className="link-ink" style={{ color: "inherit" }}>{b.model}</Link>
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, color: "#5a6c78" }}>
          <span>⚓ {dealerLine}</span>
          <span>📍 Dock &amp; slip announced before the show</span>
        </div>
        <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid rgba(20,46,81,.08)" }}>
          <Link href={href} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT, fontWeight: 700, fontSize: 12.5, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--linkblue)" }}>
            View Boat <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}