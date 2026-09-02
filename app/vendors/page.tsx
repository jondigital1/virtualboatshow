"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, MONO, Eyebrow, PhonePill } from "@/components/ui";
import { submitLead } from "@/lib/leads";
import { DEALERS, VENDORS, DEALER_LOGOS, initials, type Row } from "@/lib/exhibitors";
import { SHORT_NAME, YEAR } from "@/lib/show";

function deco(r: Row) {
  const loc = [r.c, r.s].filter((x) => x && x !== "N/A").join(", ");
  const hasPhone = !!(r.p && r.p !== "N/A");
  return { name: r.n, loc, initials: initials(r.n), phone: r.p, hasPhone, tel: "tel:" + String(r.p || "").replace(/[^0-9]/g, ""), logo: DEALER_LOGOS[r.n] };
}

const DECK = [
  ["01 · The audience", "15,000+ boaters, one weekend", "The Atlantic City In-Water Boat Show draws serious, high-intent buyers, and Buoy puts your brand in front of them online for weeks before the docks even open."],
  ["02 · Why partner", "Meet buyers ready to spend", "These aren’t window shoppers. Show visitors come to compare, finance, and buy, with the average purchase well into five and six figures."],
  ["03 · Packages", "From booths to title sponsorship", "Dealer slips, vendor booths, sponsored map pins, banner placements, stage time, and full title sponsorship, scaled to fit your goals and budget."],
  ["04 · Digital reach", "Always-on placement on Buoy", "Every package includes year-round exposure across the marketplace, boat detail pages, and the interactive show map, not just the weekend of the show."],
  ["05 · Next steps", "Let’s build your package", "Send us a note with what you’d like to showcase and our partnerships team will follow up within two business days with the full deck and pricing."],
];

const INTERESTS = ["Presenting dealer", "Vendor booth", "Sponsorship", "Advertising"];
const STATS: [string, string][] = [["22", "BOAT DEALERS"], ["51", "VENDORS & EXHIBITORS"], ["73", "EXHIBITING COMPANIES"], ["11", "STATES REPRESENTED"]];

const formInput: React.CSSProperties = { width: "100%", background: "#f7f6f1", border: "1px solid rgba(20,46,81,.14)", borderRadius: 11, padding: "13px 15px", fontSize: 15, color: "#142E51" };
const formLabel: React.CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#3d5260", marginBottom: 7, fontFamily: MONO, letterSpacing: ".04em" };

export default function Vendors() {
  const [q, setQ] = useState("");
  const match = (d: ReturnType<typeof deco>) => !q.trim() || (d.name + " " + d.loc).toLowerCase().includes(q.trim().toLowerCase());
  const dealers = DEALERS.map(deco).filter(match);
  const vendors = VENDORS.map(deco).filter(match);
  const [deck, setDeck] = useState(0);
  const [interest, setInterest] = useState("Presenting dealer");
  const [form, setForm] = useState({ company: "", name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const cur = DECK[deck];

  const [sending, setSending] = useState(false);
  const [formErr, setFormErr] = useState("");

  // Directory search is reported once the typing settles, never per keystroke.
  useEffect(() => {
    const query = q.trim();
    if (!query) return;
    const t = setTimeout(() => track("marketplace_searched", { value: query.slice(0, 60) }), 900);
    return () => clearTimeout(t);
  }, [q]);

  // Was fire-and-forget: it showed the thank-you screen whether or not the
  // request succeeded, so a failed enquiry looked identical to a delivered one.
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormErr("Enter your name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return setFormErr("Enter a valid email address.");
    setFormErr("");
    setSending(true);
    const { ok } = await submitLead({
      type: "vendor-inquiry",
      interest,
      ...form,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });
    setSending(false);
    if (!ok) return setFormErr("Something went wrong. Try again, or email customerinquiry@acvirtualboatshow.com.");
    track("vendor_inquiry_submitted", { interest });
    setSubmitted(true);
  };

  const dirCard = (d: ReturnType<typeof deco>, dark: boolean) => (
    <div key={d.name + d.loc} style={{ background: dark ? "rgba(255,255,255,.04)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.14)" : "1px solid rgba(20,46,81,.1)", borderRadius: 16, padding: dark ? 18 : 20, boxShadow: dark ? undefined : "0 14px 34px -26px rgba(20,46,81,.5)", display: "flex", flexDirection: "column", gap: dark ? 11 : 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: dark ? 12 : 13 }}>
        {d.logo ? (
          <div style={{ flex: "0 0 auto", width: 96, height: 48, borderRadius: 9, background: "#fff", border: "1px solid rgba(20,46,81,.1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.logo} alt={d.name + " logo"} loading="lazy" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
          </div>
        ) : (
          <div style={{ flex: "0 0 auto", width: dark ? 44 : 46, height: dark ? 44 : 46, borderRadius: dark ? 10 : 11, background: dark ? "rgba(255,255,255,.08)" : "#eef2f2", border: dark ? "1px solid rgba(255,255,255,.12)" : undefined, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: dark ? 15 : 16, color: dark ? "#fff" : "#142E51" }}>{d.initials}</div>
        )}
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: dark ? 15.5 : 16, margin: "0 0 3px", letterSpacing: "-.01em", lineHeight: 1.15, color: dark ? "#fff" : undefined }}>{d.name}</h3>
          <div style={{ fontFamily: MONO, fontSize: dark ? 10.5 : 11, letterSpacing: ".04em", color: "var(--accent)", textTransform: "uppercase" }}>{d.loc}</div>
        </div>
      </div>
      {d.hasPhone && (
        <div style={{ marginTop: "auto" }}>
          <PhonePill phone={d.phone} name={d.name} />
        </div>
      )}
    </div>
  );

  return (
    <>
      <AnnouncementBar />
      <Nav active="/vendors" />

      {/* HERO — visitor-first Marine Marketplace directory */}
      <section style={{ background: "#fff", padding: "clamp(24px,3vw,40px) clamp(18px,3vw,44px) 0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: "clamp(20px,3vw,40px)", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <Eyebrow>Explore the Show</Eyebrow>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4vw,50px)", lineHeight: 1.05, letterSpacing: "-.015em", margin: "12px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>Browse Marine Marketplace</h1>
            <span className="gold-rule" style={{ margin: "18px 0 0" }} />
            <p style={{ fontSize: "clamp(15.5px,1.2vw,17.5px)", lineHeight: 1.6, color: "rgba(20,46,81,.75)", margin: "18px 0 0", maxWidth: "48ch" }}>
              Discover marine products, services and exhibitors to outfit, protect and enjoy your boating lifestyle.
            </p>
          </div>
          <div style={{ minWidth: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/show/banner-marketplace.jpg" alt="Marine Marketplace exhibitor tents at the show" style={{ display: "block", width: "100%", height: "auto", borderRadius: 4 }} />
          </div>
        </div>
        <div style={{ maxWidth: 1240, margin: "clamp(24px,3vw,36px) auto 0" }}>
          <div style={{ position: "relative" }}>
            <span aria-hidden style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "rgba(20,46,81,.45)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search exhibitors, dealers or locations…"
              style={{ width: "100%", background: "#fff", border: "1.5px solid rgba(20,46,81,.18)", borderRadius: 12, padding: "15px 18px 15px 46px", fontSize: 15.5, color: "var(--navy)" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px 26px", flexWrap: "wrap", marginTop: 16 }}>
            {STATS.map(([num, lab]) => (
              <span key={lab} style={{ fontFamily: MONO, fontWeight: 600, fontSize: 12, letterSpacing: ".06em", color: "rgba(20,46,81,.6)" }}>
                <span style={{ color: "var(--navy)", fontWeight: 800, fontSize: 14 }}>{num}</span> {lab}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* DEALERS */}
      <section style={{ background: "#F4F7F9", padding: "clamp(56px,7vw,100px) clamp(18px,3vw,44px) clamp(40px,5vw,60px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>On the water</Eyebrow>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 14 }}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,52px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: 0, maxWidth: "18ch" }}>Our presenting dealers</h2>
            <p style={{ fontSize: 15.5, color: "#4c6270", margin: 0, maxWidth: "44ch" }}>20 dealers across 24 locations, bringing their show lineups to the docks and into the virtual show.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,238px),1fr))", gap: 16, marginTop: 36 }}>
            {dealers.map((d) => dirCard(d, false))}
          </div>
          {dealers.length === 0 && (
            <p style={{ fontSize: 14.5, color: "#4c6270", marginTop: 20 }}>No dealers match &ldquo;{q}&rdquo;. Try a different name or town.</p>
          )}
        </div>
      </section>

      {/* DEALER CTA */}
      <section style={{ background: "#F4F7F9", padding: "clamp(8px,1vw,16px) clamp(18px,3vw,44px) clamp(56px,7vw,88px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", background: "linear-gradient(135deg,#142E51 0%,#123a4c 100%)", borderRadius: 24, padding: "clamp(32px,4vw,56px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28, flexWrap: "wrap" }}>
          <div style={{ maxWidth: "56ch" }}>
            <Eyebrow style={{ letterSpacing: ".18em", fontSize: 11.5 }}>For dealers</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.4vw,44px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: "12px 0", color: "#fff" }}>Show your boats here.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,.78)", margin: 0 }}>Reserve your slips for next season and get your show lineup in front of pre-qualified buyers who researched you on Buoy before they ever hit the docks.</p>
          </div>
          <Link href="#inquiry" className="h-lift" style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 9, background: "var(--accent)", color: "#142E51", fontWeight: 700, fontSize: 16, padding: "16px 28px", borderRadius: 999 }}>Become a presenting dealer →</Link>
        </div>
      </section>

      {/* VENDORS */}
      <section style={{ background: "#142E51", color: "#fff", padding: "clamp(56px,7vw,100px) clamp(18px,3vw,44px) clamp(40px,5vw,60px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>In the aisles</Eyebrow>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 14 }}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,52px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: 0, color: "#fff", maxWidth: "18ch" }}>Our show exhibitors</h2>
            <p style={{ fontSize: 15.5, color: "rgba(255,255,255,.7)", margin: 0, maxWidth: "44ch" }}>38 brands and services that keep boaters on the water all season, from engines and insurance to canvas and gear.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,232px),1fr))", gap: 14, marginTop: 36 }}>
            {vendors.map((v) => dirCard(v, true))}
          </div>
          {vendors.length === 0 && (
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.65)", marginTop: 20 }}>No exhibitors match &ldquo;{q}&rdquo;. Try a different name or town.</p>
          )}
        </div>
      </section>

      {/* VENDOR CTA */}
      <section style={{ background: "#142E51", padding: "clamp(8px,1vw,16px) clamp(18px,3vw,44px) clamp(56px,7vw,88px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", background: "#F4F7F9", borderRadius: 24, padding: "clamp(32px,4vw,56px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28, flexWrap: "wrap" }}>
          <div style={{ maxWidth: "56ch" }}>
            <Eyebrow style={{ letterSpacing: ".18em", fontSize: 11.5 }}>For vendors</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.4vw,44px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: "12px 0" }}>Showcase your products here.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#4c6270", margin: 0 }}>Put your brand in the aisles boaters actually walk, plus always-on placement across Buoy’s marketplace, boat pages, and the show map. Booths, sampling, and stage time available.</p>
          </div>
          <Link href="#inquiry" className="btn-invert" style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 9, background: "#142E51", color: "#fff", fontWeight: 700, fontSize: 16, padding: "16px 28px", borderRadius: 999 }}>Reserve a booth →</Link>
        </div>
      </section>

      {/* DECK + INQUIRY */}
      <section id="inquiry" style={{ background: "#F4F7F9", padding: "clamp(56px,7vw,100px) clamp(18px,3vw,44px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
            <Eyebrow>Partner with the show</Eyebrow>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,50px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0" }}>See the opportunity. Then let’s talk.</h2>
            <p style={{ fontSize: 16, color: "#4c6270", margin: "16px auto 0", maxWidth: "56ch" }}>Flip through the partner deck for audience, packages, and pricing, then send us a note and our team will build your package.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 22, marginTop: 44, alignItems: "start" }}>
            {/* DECK VIEWER */}
            <div style={{ background: "#142E51", borderRadius: 22, overflow: "hidden", boxShadow: "0 24px 60px -34px rgba(20,46,81,.8)" }}>
              <div style={{ position: "relative", aspectRatio: "16/10", background: "linear-gradient(150deg,#0d2b45 0%,#142E51 60%)", padding: "clamp(24px,3vw,38px)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "var(--accent)", textTransform: "uppercase" }}>{cur[0]}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,.5)" }}>{deck + 1} / {DECK.length}</div>
                </div>
                <div>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(22px,2.6vw,34px)", lineHeight: 1.05, letterSpacing: "-.02em", color: "#fff", margin: "0 0 14px" }}>{cur[1]}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,.76)", margin: 0, maxWidth: "44ch" }}>{cur[2]}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => { track("vendor_deck_browsed", { via: "arrow" }); setDeck((d) => (d - 1 + DECK.length) % DECK.length); }} style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(255,255,255,.22)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
                  <button onClick={() => { track("vendor_deck_browsed", { via: "arrow" }); setDeck((d) => (d + 1) % DECK.length); }} className="h-brighten" style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "var(--accent)", color: "#142E51", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
                  <div style={{ display: "flex", gap: 7, marginLeft: 8 }}>
                    {DECK.map((_, i) => (
                      <button key={i} onClick={() => { track("vendor_deck_browsed", { via: "dot" }); setDeck(i); }} style={{ width: i === deck ? 22 : 8, height: 8, borderRadius: 999, border: "none", cursor: "pointer", padding: 0, background: i === deck ? "var(--accent)" : "rgba(255,255,255,.28)", transition: "width .2s, background .2s" }} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px clamp(20px,2.5vw,30px)", background: "#081726", flexWrap: "wrap" }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".05em", color: "rgba(255,255,255,.55)" }}>{SHORT_NAME} · Partner Deck {YEAR}</span>
                <a href="#inquiry-form" className="link-muted" style={{ fontWeight: 700, fontSize: 13.5, color: "var(--accent)" }}>Request the full deck →</a>
              </div>
            </div>

            {/* INQUIRY FORM */}
            <div id="inquiry-form" style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 22, padding: "clamp(26px,3vw,38px)" }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(253,183,23,.12)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 18px" }}>✓</div>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, margin: "0 0 10px", letterSpacing: "-.01em" }}>Thanks! We’re on it.</h3>
                  <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#4c6270", margin: "0 auto", maxWidth: "40ch" }}>Your inquiry is in. A member of the show team will reach out within two business days with the full deck and next steps.</p>
                  <button onClick={() => setSubmitted(false)} className="btn-outline" style={{ marginTop: 22, background: "none", border: "1px solid rgba(20,46,81,.18)", color: "#142E51", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 999, cursor: "pointer" }}>Send another inquiry</button>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)" }}>Sponsorship inquiry</div>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 23, margin: "10px 0 20px", letterSpacing: "-.01em" }}>Tell us about your brand</h3>

                  <label style={{ ...formLabel, textTransform: "uppercase" }}>I’m interested in</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                    {INTERESTS.map((label) => {
                      const on = interest === label;
                      return (
                        <button type="button" key={label} onClick={() => setInterest(label)} style={{ fontSize: 13, fontWeight: 600, padding: "9px 14px", borderRadius: 999, cursor: "pointer", background: on ? "#142E51" : "#fff", color: on ? "#fff" : "#3d5260", border: `1px solid ${on ? "#142E51" : "rgba(20,46,81,.16)"}` }}>{label}</button>
                      );
                    })}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={formLabel}>COMPANY</label>
                      <input value={form.company} onChange={setField("company")} placeholder="Your company" style={formInput} required />
                    </div>
                    <div>
                      <label style={formLabel}>NAME</label>
                      <input value={form.name} onChange={setField("name")} placeholder="Full name" style={formInput} required />
                    </div>
                    <div>
                      <label style={formLabel}>EMAIL</label>
                      <input type="email" value={form.email} onChange={setField("email")} placeholder="you@company.com" style={formInput} required />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={formLabel}>MESSAGE</label>
                      <textarea value={form.message} onChange={setField("message")} placeholder="Tell us what you’d like to showcase…" rows={3} style={{ ...formInput, resize: "vertical", minHeight: 88 }} />
                    </div>
                  </div>
                  <button type="submit" className="h-brighten" style={{ width: "100%", marginTop: 20, background: "var(--accent)", color: "#142E51", fontWeight: 700, fontSize: 16, padding: 16, borderRadius: 12, border: "none", cursor: "pointer" }}>Send inquiry →</button>
                  <p style={{ fontSize: 12, color: "#8595a0", textAlign: "center", margin: "14px 0 0" }}>Prefer email? <a href="mailto:customerinquiry@acvirtualboatshow.com" onClick={() => track("email_link_clicked", { page: "vendors" })} style={{ fontWeight: 600 }}>customerinquiry@acvirtualboatshow.com</a></p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
