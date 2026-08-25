"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { AdSlot } from "@/components/VesselCard";
import { BlurredPrice } from "@/components/BlurredPrice";
import { DISPLAY, MONO, fmt } from "@/components/ui";
import { useIframeModal } from "@/components/IframeModal";
import { fetchListing, toV, feet, fmtInt, type Listing, type V } from "@/lib/buoy";

/* Value signals, addresses buyer skepticism where the decision happens. */
const TRUST: [string, string][] = [
  ["Dockside sea trial", "Run it before you buy"],
  ["Trade-In Special", "Started before you arrive"],
  ["Financing on site", "Sign right at the slip"],
];


const tile: React.CSSProperties = { background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 14, padding: "15px 16px" };
const tileLabel: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: "#8595a0", textTransform: "uppercase" };

const PLACEHOLDER_BG = "repeating-linear-gradient(135deg,#ccd8dc 0 16px,#c3d0d5 16px 32px)";
const TERMS: [number, string][] = [[120, "10 yr"], [180, "15 yr"], [240, "20 yr"]];

const titleWords = (s: string) => s.replace(/[-_]+/g, " ").replace(/\b[a-z]/g, (c) => c.toUpperCase());

const scrollToRequest = () => document.getElementById("request")?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function VDP() {
  const params = useParams<{ slug: string }>();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const [listing, setListing] = useState<Listing | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setStatus("loading");
    fetchListing(String(slug))
      .then((res) => {
        if (!alive) return;
        if (res && res.listing) {
          setListing(res.listing);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (alive) setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  const v = useMemo(() => (listing ? toV(listing) : null), [listing]);

  if (status !== "ready" || !listing || !v) {
    return (
      <>
        <AnnouncementBar />
        <Nav active="/inventory" />
        <section style={{ background: "#F4F7F9", padding: "clamp(60px,10vw,140px) clamp(18px,3vw,44px)", minHeight: "50vh" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            {status === "loading" ? (
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".16em", color: "#8595a0", display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "livePulse 1.6s infinite" }} />
                LOADING LISTING…
              </div>
            ) : (
              <>
                <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.4vw,40px)", letterSpacing: "-.02em", margin: 0 }}>Listing not found.</h1>
                <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#4c6270", margin: "14px auto 24px", maxWidth: "44ch" }}>It may have sold or come off the market. Browse the live inventory to keep shopping the show.</p>
                <Link href="/inventory" className="btn-invert" style={{ display: "inline-block", background: "#142E51", color: "#fff", fontWeight: 700, fontSize: 14.5, padding: "13px 24px", borderRadius: 999 }}>Back to inventory →</Link>
              </>
            )}
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return <VDPBody listing={listing} v={v} />;
}

function VDPBody({ listing, v }: { listing: Listing; v: V }) {
  const { open: openModal } = useIframeModal();
  const [saved, setSaved] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const photos = useMemo(() => {
    const urls = (listing.photos ?? []).map((p) => p?.url).filter((u): u is string => !!u);
    if (!urls.length && listing.coverPhotoUrl) urls.push(listing.coverPhotoUrl);
    return urls;
  }, [listing]);

  const name = v.title || [v.year || "", v.make, v.model].filter(Boolean).join(" ").trim();
  const hasPrice = !v.por && v.price > 0;
  const rawHours = listing.engineHours ?? listing.hours;

  const lenFt = feet(listing.lengthFt);
  const beamFt = feet(listing.beamFt);
  const draftFt = feet(listing.draftFt);

  const specTiles: [string, string][] = [];
  if (v.engine) specTiles.push(["Engine", v.engine]);
  if (lenFt) specTiles.push(["Length", lenFt]);
  if (beamFt) specTiles.push(["Beam", beamFt]);
  if (draftFt) specTiles.push(["Draft", draftFt]);
  if (rawHours != null) specTiles.push(["Engine Hours", fmtInt(rawHours) + " hrs"]);
  if (v.year > 0) specTiles.push(["Year", String(v.year)]);
  if (v.klass) specTiles.push(["Class", v.klass]);
  if (v.condition) specTiles.push(["Condition", v.condition]);

  const specGroups: [string, [string, string][]][] = [];
  {
    const dims: [string, string][] = [];
    if (lenFt) dims.push(["Length Overall", lenFt]);
    if (beamFt) dims.push(["Beam", beamFt]);
    if (draftFt) dims.push(["Draft", draftFt]);
    if (dims.length) specGroups.push(["Dimensions", dims]);
    const prop: [string, string][] = [];
    if (v.engine) prop.push(["Engines", v.engine]);
    if (rawHours != null) prop.push(["Engine Hours", fmtInt(rawHours) + " hrs"]);
    if (prop.length) specGroups.push(["Propulsion", prop]);
    const det: [string, string][] = [];
    if (v.klass) det.push(["Class", v.klass]);
    if (v.year > 0) det.push(["Year", String(v.year)]);
    if (v.condition) det.push(["Condition", v.condition]);
    if (listing.hullMaterial) det.push(["Hull", titleWords(String(listing.hullMaterial))]);
    if (det.length) specGroups.push(["Details", det]);
  }

  const metaBits = [
    [v.lenLabel, v.klass].filter(Boolean).join(" "),
    v.engine,
  ].filter(Boolean) as string[];

  const dealerInitials = v.dealer
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const descParas = v.description
    ? v.description.split(/\n+/).map((p) => p.trim()).filter(Boolean)
    : [];

  const priceLabel = hasPrice ? "$" + fmt(v.price) : "Price on request";

  return (
    <>
      <AnnouncementBar />
      <Nav active="/inventory" />

      {/* TITLE HEADER */}
      <section style={{ background: "#F4F7F9", padding: "clamp(20px,2.5vw,32px) clamp(18px,3vw,44px) 0" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: MONO, fontSize: 11.5, letterSpacing: ".1em", color: "#8595a0", flexWrap: "wrap" }}>
            <Link href="/" className="link-ink" style={{ color: "#8595a0" }}>HOME</Link><span>/</span>
            <Link href="/inventory" className="link-ink" style={{ color: "#8595a0" }}>INVENTORY</Link>
            {v.klass && <><span>/</span><span>{v.klass.toUpperCase()}</span></>}
            {v.make && <><span>/</span><span style={{ color: "#142E51" }}>{v.make.toUpperCase()}</span></>}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 14 }}>
            <div>
              {v.condition && <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".14em", color: "var(--accent)", textTransform: "uppercase" }}>{v.condition}</div>}
              <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(27px,3.4vw,46px)", lineHeight: 1.02, letterSpacing: "-.025em", margin: "8px 0 0" }}>{name}</h1>
              {(metaBits.length > 0 || v.dock) && (
                <div style={{ display: "flex", gap: "8px 16px", flexWrap: "wrap", marginTop: 12, fontFamily: MONO, fontSize: 12.5, color: "#3d5260" }}>
                  {metaBits.map((bit, i) => (
                    <span key={bit} style={{ display: "inline-flex", gap: 16 }}>
                      {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                      <span>{bit}</span>
                    </span>
                  ))}
                  {v.dock && (
                    <span style={{ display: "inline-flex", gap: 16 }}>
                      {metaBits.length > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                      <span style={{ color: "#142E51" }}>{v.dock}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setSaved((s) => !s)} className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", border: "1px solid rgba(20,46,81,.16)", borderRadius: 999, padding: "9px 15px", cursor: "pointer", color: saved ? "var(--accent)" : "#3d5260", fontWeight: 600, fontSize: 13.5 }}>
                <span style={{ fontSize: 15 }}>{saved ? "♥" : "♡"}</span>{saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN */}
      <section style={{ background: "#F4F7F9", padding: "clamp(20px,2.5vw,30px) clamp(18px,3vw,44px) clamp(48px,6vw,80px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", gap: "clamp(20px,2.5vw,36px)", alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* LEFT */}
          <div style={{ flex: "1 1 580px", minWidth: 0 }}>
            {/* GALLERY */}
            <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", aspectRatio: "16/10", boxShadow: "0 24px 54px -30px rgba(20,46,81,.5)", background: PLACEHOLDER_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {photos.length > 0 ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={photos[activePhoto] ?? photos[0]} alt={name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".16em", color: "rgba(20,46,81,.4)" }}>// VESSEL PHOTO</span>
              )}
              {photos.length > 0 && (
                <span style={{ position: "absolute", bottom: 12, right: 12, fontFamily: MONO, fontSize: 11, background: "rgba(20,46,81,.82)", color: "#fff", padding: "6px 11px", borderRadius: 8 }}>{Math.min(activePhoto + 1, photos.length)} / {photos.length} {photos.length === 1 ? "photo" : "photos"}</span>
              )}
            </div>
            {photos.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginTop: 10 }}>
                {photos.slice(0, 5).map((url, i) => (
                  <button key={url + i} onClick={() => setActivePhoto(i)} style={{ padding: 0, border: `2px solid ${activePhoto === i ? "var(--accent)" : "transparent"}`, borderRadius: 11, overflow: "hidden", aspectRatio: "4/3", cursor: "pointer", position: "relative", background: PLACEHOLDER_BG }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    {i === 4 && photos.length > 5 && (
                      <span style={{ position: "absolute", inset: 0, background: "rgba(20,46,81,.62)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>+{photos.length - 5}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* TRUST / VALUE BAND */}
            <div style={{ marginTop: 20, background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, padding: "8px 6px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,150px),1fr))" }}>
              {TRUST.map(([t, sub]) => (
                <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px" }}>
                  <span style={{ flex: "0 0 auto", width: 20, height: 20, borderRadius: "50%", background: "rgba(23,138,90,.14)", color: "#178a5a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, marginTop: 1 }}>✓</span>
                  <div>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, letterSpacing: "-.01em", lineHeight: 1.15 }}>{t}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#7c8b96", marginTop: 3, lineHeight: 1.3 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* SPEC TILES */}
            {specTiles.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,140px),1fr))", gap: 10, marginTop: 24 }}>
                {specTiles.map(([lab, val]) => (
                  <div key={lab} style={tile}>
                    <div style={tileLabel}>{lab}</div>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: lab === "Engine" || lab === "Class" ? 15 : 20, marginTop: 6, lineHeight: 1.15 }}>{val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* DESCRIPTION */}
            {descParas.length > 0 && (
              <div style={{ marginTop: 32, background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 18, padding: "clamp(22px,2.5vw,30px)" }}>
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, margin: "0 0 12px", letterSpacing: "-.01em" }}>About this boat</h2>
                {descParas.map((p, i) => (
                  <p key={i} style={{ fontSize: 15.5, lineHeight: 1.65, color: "#42555f", margin: i < descParas.length - 1 ? "0 0 14px" : 0 }}>{p}</p>
                ))}
              </div>
            )}

            {/* FULL SPECS */}
            {specGroups.length > 0 && (
              <div style={{ marginTop: 24, background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 18, padding: "clamp(22px,2.5vw,30px)" }}>
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, margin: "0 0 18px", letterSpacing: "-.01em" }}>Full specifications</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "24px 40px" }}>
                  {specGroups.map(([group, rows]) => (
                    <div key={group}>
                      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 6 }}>{group}</div>
                      {rows.map(([k, val], idx) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: idx < rows.length - 1 ? "1px solid rgba(20,46,81,.08)" : undefined, fontSize: 14.5 }}>
                          <span style={{ color: "#7c8b96" }}>{k}</span><span style={{ fontWeight: 600 }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loan estimator with a TYPED price field, so the boat's real Boat
                Show Price is never seeded in and can never be reverse-computed
                from the monthly payment. The visitor runs their own numbers. */}
            <PaymentCalc />

            {/* INLINE LEAD FORM */}
            <RequestForm boatLabel={name} price={v.price} dealer={v.dealer} buoyHref={v.buoyHref} />
          </div>

          {/* RIGHT: BUY BOX */}
          <div style={{ flex: "0 1 366px", minWidth: 280, position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid rgba(20,46,81,.12)", borderRadius: 18, padding: 22, boxShadow: "0 20px 46px -30px rgba(20,46,81,.4)" }}>
              {/* Struck MSRP renders only when the server provides it */}
              {v.msrp > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: "#8595a0", textTransform: "uppercase" }}>MSRP</span>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: "#9aa7b0", textDecoration: "line-through" }}>${fmt(v.msrp)}</span>
                </div>
              )}
              <div style={{ borderTop: v.msrp > 0 ? "1px solid rgba(20,46,81,.1)" : undefined, margin: v.msrp > 0 ? "14px 0" : "0 0 14px", paddingTop: v.msrp > 0 ? 14 : 0 }}>
                {/* The Boat Show Price is blurred online, always. MSRP above is the
                    only legible number. The blur drives the appointment (the
                    "Book a walkthrough" button below), where the real deal is
                    revealed. SAVE and the payment calculator are gone: both would
                    let a visitor back out the price. */}
                {hasPrice ? (
                  <BlurredPrice value={priceLabel} large />
                ) : (
                  <>
                    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: "var(--accent)", fontWeight: 700 }}>BOAT SHOW PRICE</div>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: "#142E51", letterSpacing: "-.01em", lineHeight: 1.05, marginTop: 5 }}>By appointment</div>
                  </>
                )}
              </div>
              <a href={v.buoyHref} target="_blank" rel="noopener noreferrer" className="h-brighten" style={{ display: "block", width: "100%", background: "var(--accent)", color: "#142E51", fontWeight: 700, fontSize: 15.5, padding: 15, borderRadius: 12, border: "none", cursor: "pointer", textAlign: "center", boxSizing: "border-box" }}>See it on Buoy List →</a>
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#8595a0", textAlign: "center", marginTop: 8 }}>Message the seller on the live listing</div>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button onClick={scrollToRequest} className="btn-outline" style={{ flex: 1, textAlign: "center", background: "#fff", color: "#142E51", fontWeight: 700, fontSize: 14, padding: "12px 8px", borderRadius: 12, border: "1px solid rgba(20,46,81,.18)", cursor: "pointer", fontFamily: "inherit" }}>Book a walkthrough</button>
              </div>
            </div>

            {/* SELLER CARD */}
            <div style={{ background: "#fff", border: "1px solid rgba(20,46,81,.12)", borderRadius: 18, padding: 20 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "#8595a0", textTransform: "uppercase" }}>Listed by</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                <div style={{ width: 46, height: 46, flex: "0 0 auto", borderRadius: 12, background: "#142E51", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 17 }}>{dealerInitials || "B"}</div>
                <div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16 }}>{v.dealer}</div>
                  {v.dock && <div style={{ fontFamily: MONO, fontSize: 11, color: "#7c8b96", marginTop: 2 }}>{v.dock}</div>}
                </div>
              </div>
              <a href={v.buoyHref} target="_blank" rel="noopener noreferrer" className="link-ink" style={{ display: "block", fontFamily: MONO, fontSize: 12.5, color: "var(--accent)", marginTop: 14, fontWeight: 700 }}>View the listing on Buoy List →</a>
            </div>

            <AdSlot label="Sponsor / vendor ad" height={250} />
          </div>
        </div>
      </section>

      {/* MOBILE STICKY CTA BAR */}
      <div className="vdp-mobile-bar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".1em", color: "var(--accent)" }}>BOAT SHOW PRICE</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 17, color: "#fff", lineHeight: 1.1 }}>
            {priceLabel}
            {hasPrice && v.msrp > 0 && <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,.55)", textDecoration: "line-through", marginLeft: 7 }}>${fmt(v.msrp)}</span>}
          </div>
        </div>
        <a href={v.buoyHref} target="_blank" rel="noopener noreferrer" aria-label="See it on Buoy List" style={{ flex: "0 0 auto", width: 46, height: 46, borderRadius: 12, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>↗</a>
        <button onClick={scrollToRequest} className="h-brighten" style={{ flex: "0 0 auto", background: "var(--accent)", color: "#142E51", fontWeight: 700, fontSize: 14.5, padding: "13px 18px", borderRadius: 12, border: "none", cursor: "pointer" }}>Get Your Deal</button>
      </div>
      <div className="vdp-mobile-spacer" />

      <Footer />
    </>
  );
}


/* ── Inline lead-capture: the primary conversion form ─────────────────── */
function RequestForm({ boatLabel, price, dealer, buoyHref }: { boatLabel: string; price: number; dealer: string; buoyHref: string }) {
  const [form, setForm] = useState({ firstName: "", email: "", phone: "", day: "Sat · Sept 12" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "vdp-appointment", boat: boatLabel, price, dealer, ...form }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  const input: React.CSSProperties = { width: "100%", background: "#F8F6F1", border: "1px solid rgba(20,46,81,.16)", borderRadius: 11, padding: "13px 14px", fontSize: 15, color: "#142E51", outline: "none" };
  const lab: React.CSSProperties = { display: "block", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", color: "#7c8b96", marginBottom: 6, textTransform: "uppercase" };

  return (
    <div id="request" style={{ marginTop: 24, background: "#fff", border: "2px solid var(--accent)", borderRadius: 18, padding: "clamp(22px,2.5vw,32px)", scrollMarginTop: 76 }}>
      {status === "done" ? (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(23,138,90,.12)", color: "#178a5a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>✓</div>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, margin: "0 0 10px", letterSpacing: "-.01em" }}>You&rsquo;re on the list.</h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#4c6270", margin: "0 auto", maxWidth: "42ch" }}>{dealer} will confirm your dockside time. No spam, no phone tag. One seller, one appointment.</p>
          <button onClick={() => setStatus("idle")} className="btn-outline" style={{ marginTop: 20, background: "none", border: "1px solid rgba(20,46,81,.18)", color: "#142E51", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 999, cursor: "pointer" }}>Send another request</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)" }}>Claim your Boat Show Deal</div>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(22px,2.4vw,28px)", margin: "10px 0 6px", letterSpacing: "-.01em" }}>Book a dockside walkthrough of this boat</h2>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: "#5a6c78", margin: "0 0 20px", maxWidth: "52ch" }}>Reserve a private time to step aboard the {boatLabel} at the show. We&rsquo;ll confirm your slot before you step on the docks.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 14 }}>
            <div><label style={lab}>First name</label><input style={input} value={form.firstName} onChange={set("firstName")} placeholder="Alex" required /></div>
            <div><label style={lab}>Email</label><input style={input} type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" required /></div>
            <div><label style={lab}>Phone</label><input style={input} type="tel" value={form.phone} onChange={set("phone")} placeholder="(555) 555-5555" required /></div>
            <div><label style={lab}>Preferred day</label>
              <select style={{ ...input, appearance: "none", WebkitAppearance: "none" }} value={form.day} onChange={set("day")}>
                <option>Thu · Sept 10</option><option>Fri · Sept 11</option><option>Sat · Sept 12</option><option>Sun · Sept 13</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={status === "sending"} className="h-brighten" style={{ width: "100%", marginTop: 18, background: "var(--accent)", color: "#142E51", fontWeight: 700, fontSize: 16, padding: 16, borderRadius: 12, border: "none", cursor: status === "sending" ? "default" : "pointer", opacity: status === "sending" ? 0.7 : 1 }}>
            {status === "sending" ? "Sending…" : "Request my dockside appointment →"}
          </button>
          {status === "error" && (
            <p style={{ fontSize: 13, color: "#b3261e", margin: "12px 0 0", textAlign: "center" }}>
              Something went wrong. Please try again, or <a href={buoyHref} target="_blank" rel="noopener noreferrer" style={{ color: "#b3261e", fontWeight: 700 }}>message the seller on Buoy List</a>.
            </p>
          )}
          <p style={{ fontFamily: MONO, fontSize: 10.5, color: "#9aa7b0", textAlign: "center", margin: "14px 0 0", lineHeight: 1.5 }}>Free & no obligation. We only use this to set your appointment.</p>
        </form>
      )}
    </div>
  );
}


/* ── Loan estimator. Price is TYPED by the visitor, never seeded from the real
   Boat Show Price, so nothing about the deal leaks. ─────────────────────── */
function PaymentCalc() {
  const [price, setPrice] = useState(0);
  const [downPct, setDownPct] = useState(10);
  const [apr, setApr] = useState(7.49);
  const [term, setTerm] = useState(240);

  const down = Math.round((price * downPct) / 100);
  const loan = Math.max(0, price - down);
  const r = apr / 1200;
  const monthly = price > 0 ? (r > 0 ? (loan * r) / (1 - Math.pow(1 + r, -term)) : loan / term) : 0;
  const showMonthly = price > 0 ? "$" + fmt(monthly) : "-";

  return (
    <div id="calc" style={{ marginTop: 24, background: "#142E51", color: "#fff", borderRadius: 18, padding: "clamp(24px,3vw,34px)", scrollMarginTop: 76 }}>
      <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".16em", color: "var(--accent)", textTransform: "uppercase" }}>Boat loan calculator</div>
      <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, margin: "10px 0 6px", color: "#fff", letterSpacing: "-.01em" }}>Estimate your monthly payment</h2>
      <p style={{ fontFamily: MONO, fontSize: 11.5, color: "rgba(255,255,255,.55)", margin: "0 0 22px", lineHeight: 1.5 }}>Enter any price to run the numbers. Your Boat Show Price is confirmed at your appointment.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "26px 36px", alignItems: "center" }}>
        <div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 13.5, color: "rgba(255,255,255,.72)", display: "block", marginBottom: 9 }}>Purchase price</span>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.28)", borderRadius: 10, padding: "0 14px" }}>
              <span style={{ fontFamily: MONO, fontSize: 16, color: "rgba(255,255,255,.6)" }}>$</span>
              <input type="number" inputMode="numeric" min={0} value={price || ""} onChange={(e) => setPrice(Math.max(0, Math.round(+e.target.value)))} placeholder="Enter a price" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontFamily: MONO, fontSize: 16, padding: "13px 8px", width: "100%" }} />
            </div>
          </div>
          <Slider label={`Down payment · ${downPct}%`} value={"$" + fmt(down)} min={0} max={40} step={1} v={downPct} onChange={setDownPct} top />
          <Slider label="Interest rate (APR)" value={apr + "%"} min={4} max={12} step={0.25} v={apr} onChange={setApr} top />
          <div style={{ marginTop: 22, fontSize: 13.5, color: "rgba(255,255,255,.72)", marginBottom: 10 }}>Loan term</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TERMS.map(([tv, l]) => {
              const on = term === tv;
              return <button key={tv} onClick={() => setTerm(tv)} style={{ fontFamily: MONO, fontSize: 12, padding: "9px 15px", borderRadius: 999, cursor: "pointer", background: on ? "var(--accent)" : "rgba(255,255,255,.06)", color: on ? "#142E51" : "#fff", border: `1px solid ${on ? "var(--accent)" : "rgba(255,255,255,.3)"}` }}>{l}</button>;
            })}
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 16, padding: 26, textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,.6)", textTransform: "uppercase" }}>Estimated payment</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(38px,5vw,52px)", lineHeight: 1, margin: "10px 0 4px", color: "#fff" }}>{showMonthly}</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,.6)" }}>per month</div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.14)", margin: "20px 0 0", paddingTop: 16, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,.72)" }}><span>Amount financed</span><span style={{ color: "#fff", fontWeight: 700 }}>{price > 0 ? "$" + fmt(loan) : "-"}</span></div>
          <Link href="#request" className="h-brighten" style={{ display: "block", marginTop: 18, background: "var(--accent)", color: "#142E51", fontWeight: 700, fontSize: 14.5, padding: 13, borderRadius: 12, textAlign: "center" }}>Get pre-qualified →</Link>
        </div>
      </div>
      <p style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(255,255,255,.45)", margin: "18px 0 0", lineHeight: 1.5 }}>Estimate only. Actual terms depend on credit approval, taxes, and fees. Rates shown for illustration.</p>
    </div>
  );
}

function Slider({ label, value, min, max, step, v, onChange, top }: { label: string; value: string; min: number; max: number; step: number; v: number; onChange: (n: number) => void; top?: boolean }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: top ? "22px 0 9px" : "0 0 9px" }}>
        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,.72)" }}>{label}</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14 }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => onChange(+e.target.value)} style={{ width: "100%" }} />
    </>
  );
}
