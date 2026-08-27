"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { track } from "@vercel/analytics";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, Eyebrow, PhonePill } from "@/components/ui";
import { BoatShowPrice } from "@/components/BoatShowPrice";
import { placementFor } from "@/lib/docks";
import { logoFor, initials } from "@/lib/exhibitors";
import { boatBySlug, boatTitle, showBoats } from "@/lib/showboats";

const FONT = "var(--font-poppins), sans-serif";

export default function ShowBoatVDP() {
  const params = useParams<{ slug: string }>();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const boat = slug ? boatBySlug(slug) : undefined;
  const [photo, setPhoto] = useState(0);
  const [lightbox, setLightbox] = useState(-1); // -1 closed, else photo index
  const [zoomed, setZoomed] = useState(false);
  const [showBlurb, setShowBlurb] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = boat?.photos.length ?? 0;

  const stepMain = (d: number, via: string) => {
    track("boat_photo_swiped", { boat: boat?.slug ?? slug ?? "", context: "vdp", via });
    setPhoto((i) => (i + d + count) % count);
  };
  const stepLb = (d: number, via: string) => {
    track("boat_photo_swiped", { boat: boat?.slug ?? slug ?? "", context: "lightbox", via });
    setZoomed(false);
    setLightbox((i) => (i + d + count) % count);
  };
  const openLb = (i: number, via: string) => {
    track("lightbox_opened", { boat: boat?.slug ?? slug ?? "", via });
    setZoomed(false);
    setLightbox(i);
  };
  const closeLb = () => { setLightbox(-1); setZoomed(false); };

  // Lightbox keyboard nav + background scroll lock.
  useEffect(() => {
    if (lightbox < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowRight") stepLb(1, "key");
      else if (e.key === "ArrowLeft") stepLb(-1, "key");
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox < 0, count]);

  if (!boat) {
    return (
      <>
        <AnnouncementBar />
        <Nav active="/inventory" />
        <section style={{ background: "#fff", padding: "clamp(60px,10vw,120px) 24px", textAlign: "center" }}>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: "var(--navy)", margin: 0 }}>We couldn&rsquo;t find that boat.</h1>
          <p style={{ color: "#5a6c78", margin: "12px 0 22px" }}>The lineup changes as dealers confirm their boats, so it may have been updated.</p>
          <Link href="/inventory" className="h-brighten" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: ".05em", textTransform: "uppercase", padding: "13px 22px", borderRadius: 8 }}>Browse Boats at the Show →</Link>
        </section>
        <Footer />
      </>
    );
  }

  const title = boatTitle(boat);
  const placement = boat.dealers[0] ? placementFor(boat.dealers[0].name) : undefined;
  // Rendered conditionally, because the source data has real gaps: length is
  // derived from the model designation (see scripts/import-show-boats.mjs) and
  // is null for 3 boats whose naming does not encode it, and year is set on 59
  // of 86. The strip shows what exists rather than padding with empty tiles.
  const specs: [string, string][] = [
    boat.lengthFt ? ["Length", `${boat.lengthFt}' approx.`] : null,
    boat.year ? ["Year", String(boat.year)] : null,
    ["Brand", boat.brand],
    ["Dealer", boat.dealers[0]?.name ?? ""],
  ].filter((x): x is [string, string] => Array.isArray(x) && Boolean(x[1]));
  const others = showBoats.filter((b) => b.slug !== boat.slug && b.dealers.some((d) => boat.dealers.some((bd) => bd.name === d.name)) && b.photos.length > 0).slice(0, 3);

  return (
    <>
      <AnnouncementBar />
      <Nav active="/inventory" />

      <section style={{ background: "#fff", padding: "clamp(18px,2.5vw,30px) clamp(18px,3vw,44px) clamp(48px,6vw,72px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ fontFamily: FONT, fontSize: 12.5, color: "#8595a0" }}>
            <Link href="/inventory" style={{ color: "var(--linkblue)", fontWeight: 600 }}>Browse Boats</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span>{title}</span>
          </div>

          <div style={{ marginTop: 18 }}>
            <Eyebrow>{boat.brand}</Eyebrow>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,3.4vw,44px)", lineHeight: 1.05, letterSpacing: "-.018em", margin: "8px 0 0", color: "var(--navy)", textWrap: "balance" }}>{title}</h1>
          </div>

          <div className="vdp-grid">
            {/* GALLERY */}
            <div className="vdp-media">
              <div
                style={{ position: "relative", aspectRatio: "16/10", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(20,46,81,.12)", background: "linear-gradient(160deg,#e8eef3,#dfe7ee)", touchAction: "pan-y" }}
                onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (touchX.current === null || count < 2) return;
                  const dx = e.changedTouches[0].clientX - touchX.current;
                  if (Math.abs(dx) > 40) stepMain(dx < 0 ? 1 : -1, "swipe");
                  touchX.current = null;
                }}
              >
                {count > 0 ? (
                  <button onClick={() => openLb(photo, "main")} aria-label="Open photo viewer" style={{ position: "absolute", inset: 0, padding: 0, border: "none", background: "none", cursor: "zoom-in" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={boat.photos[photo] ?? boat.photos[0]} alt={title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ) : (
                  <span style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ac-mark.png" alt="" style={{ width: 110, opacity: 0.5 }} />
                    <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12, letterSpacing: ".08em", color: "rgba(20,46,81,.45)", textTransform: "uppercase" }}>Photos coming soon</span>
                  </span>
                )}
                {boat.notes && (
                  <span style={{ position: "absolute", top: 12, left: 12, fontFamily: FONT, fontWeight: 700, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", background: "var(--gold)", color: "#142E51", padding: "6px 11px", borderRadius: 7, pointerEvents: "none" }}>{boat.notes}</span>
                )}
                {count > 1 && (
                  <>
                    <button aria-label="Previous photo" onClick={() => stepMain(-1, "arrow")} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.93)", color: "var(--navy)", cursor: "pointer", fontSize: 21, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(20,46,81,.3)" }}>‹</button>
                    <button aria-label="Next photo" onClick={() => stepMain(1, "arrow")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.93)", color: "var(--navy)", cursor: "pointer", fontSize: 21, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(20,46,81,.3)" }}>›</button>
                    <span style={{ position: "absolute", bottom: 12, right: 12, fontFamily: FONT, fontWeight: 700, fontSize: 12, background: "rgba(20,46,81,.78)", color: "#fff", padding: "5px 11px", borderRadius: 999, pointerEvents: "none" }}>{photo + 1} / {count}</span>
                  </>
                )}
              </div>

              {/* three-up thumbnail strip; last tile carries the +N overlay */}
              {count > 1 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 10 }}>
                  {boat.photos.slice(1, 4).map((p, i) => {
                    const isLast = i === 2 && count > 4;
                    return (
                      <button key={p} onClick={() => openLb(i + 1, "thumb")} aria-label={isLast ? `View all ${count} photos` : `Photo ${i + 2}`} style={{ position: "relative", aspectRatio: "16/10", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(20,46,81,.12)", padding: 0, cursor: "pointer", background: "none" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        {isLast && (
                          <span style={{ position: "absolute", inset: 0, background: "rgba(20,46,81,.55)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 19 }}>+{count - 4} more</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {specs.length > 0 && (
                <div className="spec-grid">
                  {specs.map(([label, value]) => (
                    <div key={label} style={{ background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.45)", borderRadius: 11, padding: "12px 14px", minWidth: 0 }}>
                      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(20,46,81,.55)" }}>{label}</div>
                      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 17, color: "var(--navy)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={value}>{value}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* SIDE PANEL */}
            <div className="vdp-rail">
              <BoatShowPrice boat={boat} dealer={boat.dealers[0]?.name ?? "the dealer"} />

              <div style={{ background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.4)", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--navy)" }}>Where to find it</div>
                {placement ? (
                  <>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, color: "var(--navy)", marginTop: 7 }}>
                      {placement.dock === "Land" ? placement.where : `${placement.dock} · ${placement.where}`}
                    </div>
                    <div style={{ fontSize: 13.5, color: "#5a6c78", marginTop: 3 }}>
                      {placement.dock === "Land" ? "Land display" : "On the docks"} · Farley State Marina
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: "#33454f", marginTop: 8, lineHeight: 1.6 }}>
                    Dock &amp; slip location announced before the show
                  </div>
                )}
                <div style={{ fontSize: 13.5, color: "#5a6c78", marginTop: 7 }}>September 10&ndash;13, 2026</div>
                <Link href="/map" style={{ display: "inline-block", marginTop: 12, fontFamily: FONT, fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--linkblue)" }}>
                  Find it on the map <span aria-hidden>&rarr;</span>
                </Link>
              </div>

              {boat.dealers.map((d) => (
                <div key={d.name} style={{ background: "#fff", border: "1px solid rgba(20,46,81,.12)", borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(20,46,81,.55)" }}>{boat.dealers.length > 1 ? "Presented by" : "Presenting dealer"}</div>
                  {logoFor(d.name) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoFor(d.name)} alt={`${d.name} logo`} style={{ display: "block", height: 40, width: "auto", maxWidth: "100%", objectFit: "contain", margin: "12px 0 2px" }} />
                  ) : (
                    <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.45)", fontFamily: DISPLAY, fontWeight: 800, fontSize: 15, color: "var(--navy)", margin: "12px 0 2px" }}>{initials(d.name)}</div>
                  )}
                  <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, color: "var(--navy)", marginTop: 6 }}>{d.name}</div>
                  {d.loc && <div style={{ fontSize: 13.5, color: "#5a6c78", marginTop: 3 }}>{d.loc}</div>}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
                    {d.phone && <PhonePill phone={d.phone} name={d.name} />}
                  </div>
                </div>
              ))}

            </div>

            {/* DESCRIPTION — after the rail in the DOM so reading order matches
                the order phones display, rather than relying on CSS order. */}
            <div className="vdp-about">
              {boat.blurb && (
                <div style={{ marginTop: 22 }}>
                  <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 17, letterSpacing: ".02em", textTransform: "uppercase", color: "var(--navy)", margin: 0 }}>About this boat</h2>
                  <span className="gold-rule" style={{ margin: "10px 0 0", width: 44, height: 3 }} />
                  <div className={showBlurb ? undefined : "vdp-blurb-clamp"}>
                    {boat.blurb.split(/\n+/).map((para, i) => (
                      <p key={i} style={{ fontSize: 15, lineHeight: 1.68, color: "#4c6270", margin: "12px 0 0" }}>{para}</p>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowBlurb((v) => { if (!v) track("vdp_blurb_expanded", { boat: boat.slug }); return !v; })}
                    style={{ marginTop: 10, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--linkblue)" }}
                  >
                    {showBlurb ? "Show less" : "Read more"} <span aria-hidden>{showBlurb ? "\u2191" : "\u2193"}</span>
                  </button>
                </div>
              )}
              <p style={{ fontSize: 12.5, color: "#8595a0", margin: "14px 0 0" }}>
                Photos and details courtesy of {boat.dealers[0].name}{boat.shared ? " and " + boat.brand : ""}
                {boat.photoCredit ? `, with additional photography from ${boat.photoCredit}` : ""}. Boats and
                locations are subject to change. Confirm details with the dealer.
              </p>
            </div>
          </div>

          {/* MORE FROM DEALER */}
          {others.length > 0 && (
            <div style={{ marginTop: "clamp(36px,5vw,56px)" }}>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: "var(--navy)", textTransform: "uppercase", letterSpacing: ".01em", margin: "0 0 16px" }}>More from {boat.dealers[0].name}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,230px),1fr))", gap: 16 }}>
                {others.map((o) => (
                  <Link key={o.slug} href={"/boats/" + o.slug} className="card-lift-sm" style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 14, overflow: "hidden", display: "block" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={o.photos[0]} alt={boatTitle(o)} loading="lazy" style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(20,46,81,.55)" }}>{o.brand}</div>
                      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, color: "var(--navy)", marginTop: 2 }}>{o.model}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* LIGHTBOX — fullscreen viewer: arrows, keyboard, swipe, click-to-zoom */}
      {lightbox >= 0 && count > 0 && (
        <div
          role="dialog"
          aria-label="Photo viewer"
          onClick={closeLb}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null || zoomed) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1, "swipe");
            touchX.current = null;
          }}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(9,20,38,.96)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "min(96vw,1400px)", height: "min(92vh,1000px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, overflow: zoomed ? "auto" : "hidden", display: zoomed ? "block" : "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={boat.photos[lightbox]}
                alt={`${title}, photo ${lightbox + 1} of ${count}`}
                onClick={() => setZoomed((z) => { if (!z) track("lightbox_zoomed", { boat: boat?.slug ?? "" }); return !z; })}
                style={zoomed
                  ? { width: "170%", maxWidth: "none", display: "block", cursor: "zoom-out", margin: "0 auto" }
                  : { maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block", cursor: "zoom-in" }}
              />
            </div>
          </div>
          <span style={{ position: "fixed", top: 16, left: 20, fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: "rgba(255,255,255,.85)" }}>{lightbox + 1} / {count} · {title}</span>
          <button aria-label="Close viewer" onClick={closeLb} style={{ position: "fixed", top: 12, right: 14, width: 42, height: 42, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.14)", color: "#fff", fontSize: 19, cursor: "pointer" }}>✕</button>
          {count > 1 && !zoomed && (
            <>
              <button aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); stepLb(-1, "arrow"); }} style={{ position: "fixed", left: 14, top: "50%", transform: "translateY(-50%)", width: 46, height: 46, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.16)", color: "#fff", fontSize: 24, cursor: "pointer" }}>‹</button>
              <button aria-label="Next photo" onClick={(e) => { e.stopPropagation(); stepLb(1, "arrow"); }} style={{ position: "fixed", right: 14, top: "50%", transform: "translateY(-50%)", width: 46, height: 46, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.16)", color: "#fff", fontSize: 24, cursor: "pointer" }}>›</button>
            </>
          )}
          <span style={{ position: "fixed", bottom: 14, left: "50%", transform: "translateX(-50%)", fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,.55)" }}>Click photo to zoom · arrow keys to browse · Esc to close</span>
        </div>
      )}

      <Footer />
    </>
  );
}
