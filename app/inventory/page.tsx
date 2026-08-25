"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { AdSlot } from "@/components/VesselCard";
import { BlurredPrice } from "@/components/BlurredPrice";
import { DISPLAY, MONO, fmt, Eyebrow } from "@/components/ui";
import { fetchListings, toV, type V } from "@/lib/buoy";

const BGS = [
  "repeating-linear-gradient(135deg,#ccd8dc 0 14px,#c3d0d5 14px 28px)",
  "repeating-linear-gradient(135deg,#d7ddd1 0 14px,#ced5c7 14px 28px)",
  "repeating-linear-gradient(135deg,#d1dae0 0 14px,#c7d1d8 14px 28px)",
];

const FAQ_DATA: [string, string][] = [
  ["Should I buy a new or used boat?", "New boats bring full factory warranties and the latest tech; used boats stretch your budget and hold value when they’re well kept. At the show you can weigh both side by side, and every listing here flags New versus hours used, so you can compare honestly before you ever board."],
  ["What do engine hours actually tell me?", "Hours are the odometer of the water. Under about 100 a year is light use, but documented service history matters even more. Every pre-owned listing shows engine hours up front, and your dockside walkthrough is the time to ask the dealer for maintenance records."],
  ["Can I take the boat out before I buy?", "Nothing replaces time on the water. Book a dockside walkthrough through the show and the dealer will arrange a sea trial where available, so you can feel how she handles and runs before you commit to anything."],
  ["What does a boat really cost to own beyond the sticker?", "Plan for insurance, storage or a slip, fuel, winterizing, registration, and routine maintenance. A good rule of thumb is roughly 10% of the purchase price each year. Ask each dealer to break the numbers down for your specific boat at your appointment."],
  ["How does boat financing work, and should I get pre-qualified?", "Marine loans commonly run 10 to 20 years with 10-20% down. Getting pre-qualified before the show tells you your true budget and speeds the whole deal up. Several lenders exhibit on-site, and an estimated monthly payment appears on every listing."],
  ["Is the “Boat Show Price” really a better deal?", "Show pricing is negotiated for the event and is typically the most aggressive of the year. Because every presenting dealer is competing in one marketplace, you can see who’s sharpest without driving lot to lot."],
  ["Can I trade in or sell my current boat?", "Absolutely, and you don’t have to buy one to sell one. Value your boat online, let the dealers compete for it, then bring the best offer to your appointment and roll it straight into your next vessel."],
  ["What’s included: trailer, electronics, warranty?", "It varies boat to boat, so confirm what’s on the sticker: trailer, electronics package, and any remaining factory or extended warranty. Each listing notes the highlights, and your walkthrough is the moment to get every inclusion in writing."],
];

const chipStyle = (active: boolean): React.CSSProperties => ({ fontFamily: MONO, fontSize: 11, letterSpacing: ".02em", padding: "7px 12px", borderRadius: 999, cursor: "pointer", background: active ? "#0A2138" : "#fff", color: active ? "#fff" : "#3d5260", border: `1px solid ${active ? "#0A2138" : "rgba(11,34,56,.16)"}` });
const railHead: React.CSSProperties = { fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "#8595a0", textTransform: "uppercase" };

export default function Inventory() {
  const [vessels, setVessels] = useState<V[] | null>(null);
  const [q, setQ] = useState("");
  const [condition, setCondition] = useState("all");
  const [price, setPrice] = useState("all");
  const [lenBand, setLenBand] = useState("all");
  const [klass, setKlass] = useState<Record<string, boolean>>({});
  const [make, setMake] = useState<Record<string, boolean>>({});
  const [dock, setDock] = useState<Record<string, boolean>>({});
  const [sort, setSort] = useState("featured");
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const [visible, setVisible] = useState(10);
  const [faqOpen, setFaqOpen] = useState(0);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const loading = vessels === null;
  const totalAll = vessels?.length ?? 0;

  const toggle = (setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, key: string) => { setter((s) => ({ ...s, [key]: !s[key] })); setVisible(10); };
  const clearFilters = () => { setQ(""); setCondition("all"); setPrice("all"); setLenBand("all"); setKlass({}); setMake({}); setDock({}); setVisible(10); };

  useEffect(() => {
    let alive = true;
    fetchListings({ sort: "newest", limit: 100 })
      .then((res) => { if (alive) setVessels((res.listings ?? []).map(toV)); })
      .catch(() => { if (alive) setVessels([]); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) setVisible((v) => v + 5); }, { rootMargin: "600px" });
    if (sentinel.current) io.observe(sentinel.current);
    const onScroll = () => { const doc = document.documentElement; if (window.innerHeight + window.scrollY >= doc.scrollHeight - 700) setVisible((v) => v + 5); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  const keysTrue = (o: Record<string, boolean>) => Object.keys(o).filter((k) => o[k]);
  const makeCounts = useMemo(() => { const c: Record<string, number> = {}; (vessels ?? []).forEach((v) => { if (v.make) c[v.make] = (c[v.make] || 0) + 1; }); return c; }, [vessels]);
  const klassOptions = useMemo(() => {
    const c: Record<string, number> = {};
    (vessels ?? []).forEach((v) => { if (v.klass) c[v.klass] = (c[v.klass] || 0) + 1; });
    return Object.keys(c).sort((a, b) => c[b] - c[a] || a.localeCompare(b));
  }, [vessels]);
  const dockOptions = useMemo(() => {
    const c: Record<string, number> = {};
    (vessels ?? []).forEach((v) => { if (v.dock) c[v.dock] = (c[v.dock] || 0) + 1; });
    return Object.keys(c).sort((a, b) => c[b] - c[a] || a.localeCompare(b));
  }, [vessels]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const selK = keysTrue(klass), selM = keysTrue(make), selD = keysTrue(dock);
    let l = (vessels ?? []).filter((v) => {
      if (condition !== "all" && v.condition !== condition) return false;
      const p = v.price;
      if (price === "lt100" && !(p < 100000)) return false;
      if (price === "mid" && !(p >= 100000 && p < 300000)) return false;
      if (price === "gt300" && !(p >= 300000)) return false;
      const le = v.len;
      if (lenBand === "lt25" && !(le < 25)) return false;
      if (lenBand === "mid" && !(le >= 25 && le <= 32)) return false;
      if (lenBand === "gt33" && !(le > 32)) return false;
      if (selK.length && !selK.includes(v.klass)) return false;
      if (selM.length && !selM.includes(v.make)) return false;
      if (selD.length && !selD.includes(v.dock)) return false;
      if (query && !(v.year + " " + v.make + " " + v.model).toLowerCase().includes(query)) return false;
      return true;
    });
    if (sort === "price-asc") l = [...l].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") l = [...l].sort((a, b) => b.price - a.price);
    else if (sort === "year") l = [...l].sort((a, b) => b.year - a.year || b.price - a.price);
    else if (sort === "length") l = [...l].sort((a, b) => b.len - a.len);
    // Keep featured boats pinned to the top regardless of sort
    // (stable sort preserves the order of everything else).
    l = [...l].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return l;
  }, [vessels, q, condition, price, lenBand, klass, make, dock, sort]);

  const total = list.length;
  const vis = Math.min(visible, total);
  const shown = list.slice(0, vis);

  // interleave ad cards every 6 boats
  const items: ({ ad: true; adId: string } | (V & { ad: false }))[] = [];
  let boatCount = 0;
  shown.forEach((v) => { items.push({ ...v, ad: false }); boatCount++; if (boatCount % 6 === 0) items.push({ ad: true, adId: "srp-ad-" + boatCount / 6 }); });

  return (
    <>
      <AnnouncementBar />
      <Nav active="/inventory" />

      {/* PAGE HEAD */}
      <section style={{ background: "#F4F1EA", padding: "clamp(24px,3vw,40px) clamp(18px,3vw,44px) 0" }}>
        <div style={{ maxWidth: 1500, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 11.5, letterSpacing: ".12em", color: "#8595a0" }}>
            <Link href="/" style={{ color: "#8595a0" }} className="link-ink">HOME</Link><span>/</span><span>INVENTORY</span>
            <span style={{ background: "#0A2138", color: "#fff", padding: "3px 8px", borderRadius: 5, letterSpacing: ".14em" }}>SRP</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 12 }}>
            <div>
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4vw,52px)", lineHeight: 1, letterSpacing: "-.025em", margin: 0 }}>Boat Show Inventory</h1>
              <p style={{ fontSize: 15.5, color: "#4c6270", margin: "11px 0 0", maxWidth: "64ch" }}>A first look at every boat coming to this year&rsquo;s docks, from the presenting dealers, restocked all weekend as they sell. The Boat Show Pricing is revealed when you book your appointment at the show.</p>
            </div>
            {!loading && totalAll > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#fff", border: "1px solid rgba(11,34,56,.12)", borderRadius: 999, padding: "9px 16px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34C778", animation: "livePulse 2.4s infinite" }} />
                <span style={{ fontFamily: MONO, fontSize: 12, color: "#3d5260" }}>{fmt(totalAll)} {totalAll === 1 ? "boat" : "boats"} in the water</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: 24 }}><AdSlot label="Presenting sponsor banner · 970×90" height={110} /></div>
        </div>
      </section>

      {/* BROWSE */}
      <section style={{ background: "#F4F1EA", padding: "clamp(22px,2.5vw,32px) clamp(18px,3vw,44px) clamp(60px,7vw,96px)" }}>
        <div style={{ maxWidth: 1500, margin: "0 auto", display: "flex", gap: "clamp(18px,2vw,30px)", alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* FILTER RAIL */}
          <aside style={{ flex: "1 1 220px", maxWidth: 246, position: "sticky", top: 78, background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 18, padding: "20px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16 }}>Filters</div>
              <button onClick={clearFilters} className="link-ink" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".04em", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Clear all</button>
            </div>
            <div style={{ marginTop: 15 }}>
              <input value={q} onChange={(e) => { setQ(e.target.value); setVisible(10); }} placeholder="Search make or model…" style={{ width: "100%", background: "#F8F6F1", border: "1px solid rgba(11,34,56,.16)", borderRadius: 10, padding: "11px 13px", fontSize: 14, color: "#0A2138", outline: "none" }} />
            </div>

            <FilterGroup title="Condition">
              {([["all", "All"], ["New", "New"], ["Used", "Used"]] as [string, string][]).map(([v, l]) => <button key={v} onClick={() => { setCondition(v); setVisible(10); }} style={chipStyle(condition === v)}>{l}</button>)}
            </FilterGroup>
            <FilterGroup title="Price">
              {([["all", "Any"], ["lt100", "Under $100k"], ["mid", "$100k-$300k"], ["gt300", "$300k+"]] as [string, string][]).map(([v, l]) => <button key={v} onClick={() => { setPrice(v); setVisible(10); }} style={chipStyle(price === v)}>{l}</button>)}
            </FilterGroup>
            <FilterGroup title="Length">
              {([["all", "Any"], ["lt25", "Under 25'"], ["mid", "25'-32'"], ["gt33", "33'+"]] as [string, string][]).map(([v, l]) => <button key={v} onClick={() => { setLenBand(v); setVisible(10); }} style={chipStyle(lenBand === v)}>{l}</button>)}
            </FilterGroup>
            {klassOptions.length > 0 && (
              <FilterGroup title="Class">
                {klassOptions.map((c) => <button key={c} onClick={() => toggle(setKlass, c)} style={chipStyle(!!klass[c])}>{c}</button>)}
              </FilterGroup>
            )}
            {dockOptions.length > 0 && (
              <FilterGroup title="Location">
                {dockOptions.map((d) => <button key={d} onClick={() => toggle(setDock, d)} style={chipStyle(!!dock[d])}>{d}</button>)}
              </FilterGroup>
            )}

            <div style={{ marginTop: 20, borderTop: "1px solid rgba(11,34,56,.1)", paddingTop: 16 }}>
              <div style={railHead}>Make</div>
              <div style={{ marginTop: 8, maxHeight: 200, overflow: "auto" }}>
                {Object.keys(makeCounts).sort().map((m) => {
                  const on = !!make[m];
                  return (
                    <button key={m} onClick={() => toggle(setMake, m)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", padding: "6px 0", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${on ? "#0A2138" : "rgba(11,34,56,.3)"}`, background: on ? "#0A2138" : "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flex: "0 0 auto" }}>{on ? "✓" : ""}</span>
                      <span style={{ fontSize: 13.5, color: "#33454f", flex: 1 }}>{m}</span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: "#9aa7b0" }}>{makeCounts[m]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* RESULTS */}
          <div style={{ flex: "5 1 620px", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
              <div style={{ fontFamily: MONO, fontSize: 13, color: "#3d5260" }}>{!loading && (<>Showing <strong style={{ color: "#0A2138" }}>{total}</strong> of {totalAll} at the show</>)}</div>
              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: "#8595a0" }}>SORT</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.16)", borderRadius: 10, padding: "10px 30px 10px 13px", fontSize: 13.5, color: "#0A2138", cursor: "pointer" }}>
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="year">Year: Newest</option>
                  <option value="length">Length: Longest</option>
                </select>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,200px),1fr))", gap: 16, alignItems: "stretch" }}>
              {items.map((it, i) =>
                it.ad ? (
                  <div key={it.adId} style={{ position: "relative", border: "1px dashed rgba(242,106,62,.45)", borderRadius: 16, overflow: "hidden", background: "linear-gradient(180deg,#fbf3ef,#fbfaf5)", display: "flex", flexDirection: "column", minHeight: 250 }}>
                    <div style={{ position: "absolute", top: 9, left: 9, zIndex: 3, fontFamily: MONO, fontSize: 9, letterSpacing: ".12em", color: "var(--accent)", background: "rgba(255,255,255,.85)", padding: "2px 7px", borderRadius: 4 }}>SPONSORED</div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, color: "rgba(11,34,56,.4)", padding: 16, textAlign: "center" }}>Sponsor / vendor ad</div>
                  </div>
                ) : (
                  <BoatCard key={it.id} v={it} bg={BGS[i % BGS.length]} fav={!!favs[it.id]} onFav={() => setFavs((s) => ({ ...s, [it.id]: !s[it.id] }))} />
                )
              )}
            </div>

            {!loading && total === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed rgba(11,34,56,.2)", borderRadius: 18 }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 21 }}>No boats match those filters.</div>
                <p style={{ color: "#5a6c78", margin: "10px 0 18px" }}>Try widening your search. The docks restock all weekend as boats sell.</p>
                <button onClick={clearFilters} className="btn-invert" style={{ background: "#0A2138", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 20px", borderRadius: 999, border: "none", cursor: "pointer" }}>Clear all filters</button>
              </div>
            )}

            <div ref={sentinel} style={{ height: 1 }} />
            <div style={{ textAlign: "center", marginTop: 26, fontFamily: MONO, fontSize: 12, letterSpacing: ".04em", color: "#8595a0" }}>
              {loading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "livePulse 1.6s infinite" }} />Loading listings…</span>
              ) : vis < total ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "livePulse 1.6s infinite" }} />Loading more listings…</span>
              ) : total > 0 ? (
                <span>End of the list. Refine filters to explore more of the show fleet.</span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#F4F1EA", padding: "clamp(56px,7vw,96px) clamp(18px,3vw,44px)", borderTop: "1px solid rgba(11,34,56,.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Eyebrow style={{ textAlign: "center" }}>Before you buy</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.04, letterSpacing: "-.02em", margin: "14px 0 0", textAlign: "center" }}>Boat-buying questions, answered.</h2>
          <p style={{ textAlign: "center", fontSize: 16, color: "#4c6270", margin: "14px auto 40px", maxWidth: "58ch" }}>New to the docks or trading up? Here’s what smart buyers sort out before they step aboard.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQ_DATA.map(([q2, a], i) => {
              const open = faqOpen === i;
              return (
                <div key={q2} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 16, overflow: "hidden" }}>
                  <button onClick={() => setFaqOpen(open ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "20px clamp(18px,2vw,26px)" }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(16px,1.5vw,19px)", color: "#0A2138", letterSpacing: "-.01em" }}>{q2}</span>
                    <span style={{ flex: "0 0 auto", width: 27, height: 27, borderRadius: "50%", background: open ? "var(--accent)" : "rgba(11,34,56,.06)", color: open ? "#0A2138" : "#4c6270", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, lineHeight: 1, transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform .25s, background .2s" }}>+</span>
                  </button>
                  <div style={{ maxHeight: open ? 540 : 0, overflow: "hidden", transition: "max-height .32s ease" }}>
                    <p style={{ margin: 0, padding: "0 clamp(18px,2vw,26px) 22px", fontSize: 15.5, lineHeight: 1.62, color: "#4c6270" }}>{a}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 38, fontSize: 15, color: "#4c6270" }}>Still have questions? <Link href="/map" style={{ fontWeight: 700 }}>Find the right dealer at the show →</Link></div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={railHead}>{title}</div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>{children}</div>
    </div>
  );
}

function BoatCard({ v, bg, fav, onFav }: { v: V; bg: string; fav: boolean; onFav: () => void }) {
  const href = `/inventory/${v.id}`;
  const title = [v.year > 0 ? v.year : null, v.make, v.model].filter(Boolean).join(" ");
  const meta: string[] = [];
  if (v.len > 0) meta.push(v.lenLabel);
  if (v.condition === "New") meta.push("New");
  else if (v.hours > 0) meta.push(fmt(v.hours) + " hrs");
  else if (v.condition) meta.push(v.condition);
  return (
    <div className="card-lift" style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ position: "relative", aspectRatio: "16/11", background: bg }}>
        <Link href={href} aria-label={`${title} details`} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          {v.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.photoUrl} alt={title} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".14em", color: "rgba(10,33,56,.4)" }}>{"// VESSEL PHOTO"}</span>
          )}
        </Link>
        {v.dock ? (
          <span style={{ position: "absolute", top: 9, left: 9, fontFamily: MONO, fontSize: 9, letterSpacing: ".05em", background: "rgba(8,24,41,.9)", color: "#fff", padding: "4px 7px", borderRadius: 5, pointerEvents: "none", zIndex: 2 }}>{v.dock}</span>
        ) : null}
        {v.photos > 0 ? (
          <span style={{ position: "absolute", bottom: 9, left: 9, fontFamily: MONO, fontSize: 9, letterSpacing: ".05em", background: "rgba(8,24,41,.78)", color: "#fff", padding: "3px 7px", borderRadius: 5, pointerEvents: "none", zIndex: 2 }}>{v.photos} {v.photos === 1 ? "photo" : "photos"}</span>
        ) : null}
        <button onClick={onFav} aria-label="Save" style={{ position: "absolute", top: 7, right: 7, width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.92)", color: fav ? "var(--accent)" : "#4c6270", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>{fav ? "♥" : "♡"}</button>
      </div>
      <div style={{ padding: "13px 14px 15px", display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
        <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15.5, margin: 0, lineHeight: 1.15, letterSpacing: "-.01em" }}>
          <Link href={href} className="link-ink" style={{ color: "inherit" }}>{title}</Link>
        </h3>
        {meta.length > 0 && (
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#5a6c78", display: "flex", flexWrap: "wrap", gap: "4px 7px" }}>
            {meta.map((m, i) => (
              <Fragment key={m + i}>
                {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                <span>{m}</span>
              </Fragment>
            ))}
          </div>
        )}
        <div style={{ fontFamily: MONO, fontSize: 10, color: "#8595a0" }}>{v.dealer}</div>
        <div style={{ marginTop: "auto" }}>
          <div style={{ paddingTop: 10, borderTop: "1px solid rgba(11,34,56,.08)" }}>
            {v.msrp > 0 && (
              <div style={{ fontFamily: MONO, fontSize: 9.5, color: "#9aa7b0", textDecoration: "line-through" }}>MSRP ${fmt(v.msrp)}</div>
            )}
            {v.price > 0
              ? <BlurredPrice value={`$${fmt(v.price)}`} />
              : <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 15, color: "#0A2138", lineHeight: 1.05, marginTop: v.msrp > 0 ? 2 : 0 }}>Price on request</div>}
          </div>
          <Link href={href} className="h-brighten" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 13.5, padding: 11, borderRadius: 10 }}>Vessel Details →</Link>
        </div>
      </div>
    </div>
  );
}
