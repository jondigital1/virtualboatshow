"use client";

import Link from "next/link";
import { useState } from "react";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, MONO, fmt, Eyebrow } from "@/components/ui";
import { submitLead } from "@/lib/leads";

const inputStyle: React.CSSProperties = {
  border: "1px solid rgba(11,34,56,.18)",
  borderRadius: 10,
  padding: 12,
  fontSize: 14.5,
  background: "#F8F6F1",
  color: "#0A2138",
};
const fieldLabel: React.CSSProperties = { fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", color: "#7c8b96" };

const CONDITIONS = ["New", "Excellent", "Good", "Fair"];
const COND_MULT: Record<string, number> = { New: 1.18, Excellent: 1.0, Good: 0.86, Fair: 0.72 };

const FAQ_DATA: [string, string][] = [
  ["Can I sell without buying a boat?", "Absolutely. Your Boat Show offer stands whether or not you buy from a dealer at the show. No strings attached."],
  ["Is this a real offer or just an estimate?", "You get a real, competitive range up front. The final number is confirmed at your dockside appointment once a brand-expert dealer verifies the boat."],
  ["Can I put it toward a boat at the show?", "Yes. Apply your offer as a trade toward any boat on the docks and lock in Boat Show Pricing on both sides of the deal."],
  ["Will dealers blow up my phone?", "Never. We set one appointment for you at the show. No cold calls, no spam. Dealers are busy selling boats on the docks."],
  ["How long is my offer good for?", "Through the entire show weekend, so you can shop the docks with your number already in hand."],
];

const HOW = [
  ["01", "Get your offer", "Tell us about your boat and get a real, competitive offer range in minutes. We’ll take yours even if you don’t buy one at the show."],
  ["02", "Set your appointment", "Pick a dockside time during the show. One appointment, one brand-expert dealer, no cold calls, no phone tag."],
  ["03", "Get paid or trade", "We verify the boat and finalize your number at the slip. Walk away with a check, or roll it into Boat Show Pricing on your next boat."],
];

const WHY = [
  ["Real offers, not estimates", "A firm range up front, confirmed at your appointment, with no lowball surprises."],
  ["Dealers compete", "Every presenting dealer sees your boat and bids, and the best offer comes to you."],
  ["Sell without buying", "Cash out clean, or apply it as a trade toward a show boat. Your call."],
  ["No phone blowing up", "One dockside appointment, so dealers stay focused on the docks, not dialing you."],
  ["Free & no obligation", "Getting your number costs nothing and never locks you in."],
  ["Good all weekend", "Shop the docks with your offer in hand, valid through the entire show."],
];

const TESTIMONIALS = [
  ["“Had a number before I ever left the parking lot, then traded straight into a new center console at the slip. Painless.”", "Marcus D. · Brigantine, NJ"],
  ["“No one blew up my phone. One appointment, one honest offer, done in twenty minutes.”", "Renee P. · Cape May, NJ"],
  ["“Three dealers competing for my Whaler got me $6k over what I’d been quoted online. Sold on the spot.”", "Tom & Lisa K. · Ocean City, NJ"],
];

export default function SellYourBoat() {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ year: "", make: "", model: "", length: "", engine: "", hours: "", condition: "Excellent", firstName: "", email: "", zip: "" });
  const [openFaq, setOpenFaq] = useState(0);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  const len = parseFloat(f.length) || 27;
  const hrs = parseFloat(f.hours) || 0;
  const base = Math.max(15000, len * 7200 * (COND_MULT[f.condition] || 1) - hrs * 18);
  const low = Math.round((base * 0.94) / 500) * 500;
  const high = Math.round((base * 1.07) / 500) * 500;
  const offerRange = "$" + fmt(low) + " - $" + fmt(high);

  const next = () => {
    if (step === 3) submitLead({ type: "sell-boat", ...f, offerLow: low, offerHigh: high });
    setStep((s) => Math.min(4, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const badge = { 1: "Step 1 of 3", 2: "Step 2 of 3", 3: "Step 3 of 3", 4: "Done" }[step];
  const cardTitle = { 1: "Get a real offer in minutes", 2: "A few more details", 3: "Where to send your offer", 4: "Your offer is ready" }[step];
  const nextLabel = { 1: "Next →", 2: "Next →", 3: "Get my offer →" }[step] || "Next";
  const footHint = {
    1: "Most boats qualify. No obligation, ever.",
    2: "Engine hours have the biggest impact on value.",
    3: "We only use this to send your appointment, never spam calls.",
    4: "Final offer confirmed at your dockside appointment.",
  }[step];
  const progressPct = (Math.min(step, 3) / 3) * 100 + "%";

  return (
    <>
      <AnnouncementBar />
      <Nav active="/sell" />

      {/* HERO + STEPPER */}
      <section style={{ position: "relative", background: "#0A2138", color: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-25%", right: "-8%", width: "60%", height: "150%", background: "radial-gradient(circle at 68% 34%, rgba(242,106,62,.14), transparent 60%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1300, margin: "0 auto", padding: "clamp(40px,5vw,72px) clamp(18px,4vw,48px) clamp(48px,6vw,80px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "clamp(30px,4vw,56px)", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <Eyebrow>Sell / Trade · WeBuyAnyBoat</Eyebrow>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(38px,5.5vw,72px)", lineHeight: 0.98, letterSpacing: "-.03em", margin: "16px 0 0" }}>Sell your boat,<br />on your terms.</h1>
            <p style={{ maxWidth: 500, fontSize: "clamp(16px,1.3vw,19px)", lineHeight: 1.55, color: "rgba(255,255,255,.82)", margin: "22px 0 0" }}>Get a real Boat Show offer in minutes. Every presenting dealer competes for your boat. Trade it toward a show boat or cash out. One appointment, no sales calls.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
              {["A real offer, not a vague estimate", "Every show dealer competes for the best price", "Appointment only, so we won’t blow up your phone"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ width: 22, height: 22, flex: "0 0 auto", borderRadius: "50%", background: "rgba(52,199,120,.18)", color: "#34C778", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✓</span>
                  <span style={{ fontSize: 15.5, color: "rgba(255,255,255,.9)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* STEPPER CARD */}
          <div style={{ background: "#fff", color: "#0A2138", borderRadius: 22, padding: "clamp(24px,3vw,34px)", boxShadow: "0 34px 80px -34px rgba(0,0,0,.6)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 19 }}>{cardTitle}</div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 999, padding: "4px 10px" }}>{badge}</div>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: "#ece8df", margin: "16px 0 22px", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: "var(--accent)", width: progressPct, transition: "width .35s ease" }} />
            </div>

            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={fieldLabel}>YEAR</span><input inputMode="numeric" value={f.year} onChange={set("year")} placeholder="2021" style={inputStyle} /></label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={fieldLabel}>LENGTH (FT)</span><input inputMode="numeric" value={f.length} onChange={set("length")} placeholder="28" style={inputStyle} /></label>
                </div>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={fieldLabel}>MAKE</span><input value={f.make} onChange={set("make")} placeholder="e.g. Grady-White" style={inputStyle} /></label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={fieldLabel}>MODEL</span><input value={f.model} onChange={set("model")} placeholder="e.g. Canyon 271" style={inputStyle} /></label>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={fieldLabel}>ENGINE(S)</span><input value={f.engine} onChange={set("engine")} placeholder="e.g. Twin Yamaha 300" style={inputStyle} /></label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={fieldLabel}>ENGINE HOURS</span><input inputMode="numeric" value={f.hours} onChange={set("hours")} placeholder="e.g. 220" style={inputStyle} /></label>
                <div>
                  <span style={fieldLabel}>CONDITION</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 9 }}>
                    {CONDITIONS.map((c) => {
                      const on = f.condition === c;
                      return (
                        <button key={c} onClick={() => setF((s) => ({ ...s, condition: c }))} style={{ fontFamily: MONO, fontSize: 12, padding: "9px 15px", borderRadius: 999, cursor: "pointer", background: on ? "#0A2138" : "#fff", color: on ? "#fff" : "#3d5260", border: `1px solid ${on ? "#0A2138" : "rgba(11,34,56,.16)"}` }}>{c}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={fieldLabel}>FIRST NAME</span><input value={f.firstName} onChange={set("firstName")} placeholder="Alex" style={inputStyle} /></label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={fieldLabel}>EMAIL</span><input type="email" value={f.email} onChange={set("email")} placeholder="you@email.com" style={inputStyle} /></label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={fieldLabel}>ZIP CODE</span><input inputMode="numeric" value={f.zip} onChange={set("zip")} placeholder="08401" style={inputStyle} /></label>
              </div>
            )}

            {step === 4 && (
              <div style={{ textAlign: "center", padding: "6px 0 2px" }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "#178a5a" }}>YOUR BOAT SHOW OFFER</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4vw,40px)", color: "#0A2138", margin: "8px 0 4px", letterSpacing: "-.01em" }}>{offerRange}</div>
                <div style={{ fontFamily: MONO, fontSize: 11.5, color: "#7c8b96" }}>Good through the show weekend · Sept 10-13</div>
                <div style={{ background: "#EDF6F0", border: "1px solid rgba(23,138,90,.3)", borderRadius: 12, padding: "14px 16px", marginTop: 18, textAlign: "left", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ width: 24, height: 24, flex: "0 0 auto", borderRadius: "50%", background: "#178a5a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</span>
                  <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "#33454f" }}>Bring it to your dockside appointment and a brand-expert dealer will confirm your final number, then cash out or roll it into a show boat.</div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              {step > 1 && step < 4 && (
                <button onClick={back} className="btn-outline" style={{ flex: "0 0 auto", background: "#fff", color: "#0A2138", fontWeight: 700, fontSize: 15, padding: "14px 20px", borderRadius: 12, border: "1px solid rgba(11,34,56,.2)", cursor: "pointer" }}>Back</button>
              )}
              {step === 4 ? (
                <Link href="/inventory" className="h-brighten" style={{ flex: 1, textAlign: "center", background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12 }}>Set my appointment →</Link>
              ) : (
                <button onClick={next} className="h-brighten" style={{ flex: 1, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, border: "none", cursor: "pointer" }}>{nextLabel}</button>
              )}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#9aa7b0", marginTop: 12, textAlign: "center", lineHeight: 1.5 }}>{footHint}</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "#F4F1EA", padding: "clamp(64px,8vw,112px) clamp(18px,4vw,48px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>How it works</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 42px", maxWidth: "18ch" }}>Three easy steps to sold.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 18 }}>
            {HOW.map(([n, h, body]) => (
              <div key={n} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 20, padding: "28px 26px" }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 42, color: "var(--accent)", lineHeight: 1 }}>{n}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 21, margin: "14px 0 10px", letterSpacing: "-.01em" }}>{h}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.55, color: "#5a6c78", margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section style={{ background: "#0A2138", color: "#fff", padding: "clamp(64px,8vw,112px) clamp(18px,4vw,48px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>Why sell at the show</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,50px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 40px", color: "#fff", maxWidth: "20ch" }}>The whole dealer network, bidding for your boat.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,270px),1fr))", gap: 18 }}>
            {WHY.map(([h, body]) => (
              <div key={h} style={{ border: "1px solid rgba(255,255,255,.14)", borderRadius: 18, padding: 24 }}>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, margin: "0 0 8px" }}>{h}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "rgba(255,255,255,.66)", margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: "#F4F1EA", padding: "clamp(60px,7vw,100px) clamp(18px,4vw,48px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>From the docks</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 18, marginTop: 28 }}>
            {TESTIMONIALS.map(([quote, who]) => (
              <div key={who} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 18, padding: 26 }}>
                <p style={{ fontSize: 16, lineHeight: 1.55, color: "#33454f", margin: "0 0 16px" }}>{quote}</p>
                <div style={{ fontFamily: MONO, fontSize: 12, color: "#8595a0" }}>{who}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#F4F1EA", padding: "0 clamp(18px,4vw,48px) clamp(64px,8vw,104px)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(26px,3.4vw,42px)", lineHeight: 1.05, letterSpacing: "-.02em", margin: "0 0 26px" }}>Frequently asked</h2>
          {FAQ_DATA.map(([q, a], i) => {
            const open = openFaq === i;
            return (
              <div key={q} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(open ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 22px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16.5, color: "#0A2138" }}>{q}</span>
                  <span style={{ fontFamily: MONO, fontSize: 20, color: "var(--accent)", flex: "0 0 auto" }}>{open ? "-" : "+"}</span>
                </button>
                {open && <div style={{ padding: "0 22px 20px", fontSize: 15, lineHeight: 1.6, color: "#5a6c78" }}>{a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: "#050F1A", color: "#fff", padding: "clamp(60px,7vw,104px) clamp(18px,4vw,48px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,106,62,.16), transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.6vw,56px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: 0, color: "#fff" }}>Know what your boat is worth.</h2>
          <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "rgba(255,255,255,.75)", margin: "18px auto 30px", maxWidth: "46ch" }}>Get your Boat Show offer in minutes. Free, no obligation, good all weekend.</p>
          <button onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="h-lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 16, padding: "16px 28px", borderRadius: 999, border: "none", cursor: "pointer" }}>Get my offer →</button>
        </div>
      </section>

      <Footer />
    </>
  );
}
