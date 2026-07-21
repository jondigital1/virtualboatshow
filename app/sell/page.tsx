"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, MONO, Eyebrow } from "@/components/ui";
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

export default function SellYourBoat() {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ year: "", make: "", model: "", length: "", engine: "", hours: "", condition: "Excellent", firstName: "", email: "", zip: "" });
  // Chrome hides + dealer/boat context come from how the VDP opens this
  // (`/sell?embed=1&dealer=...&boat=...`). A direct visit redirects away, so
  // every trade lead is tied to one specific boat and its dealer.
  const [embedded, setEmbedded] = useState(false);
  const [dealer, setDealer] = useState("");
  const [boat, setBoat] = useState("");
  useEffect(() => {
    let isEmbed = true;
    try {
      const p = new URLSearchParams(window.location.search);
      isEmbed = p.has("embed") || window.self !== window.top;
      setDealer(p.get("dealer") || "");
      setBoat(p.get("boat") || "");
    } catch {
      isEmbed = true;
    }
    if (!isEmbed) {
      window.location.replace("/#trade");
      return;
    }
    setEmbedded(true);
  }, []);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const dealerName = dealer || "your dealer";

  const next = () => {
    if (step === 3) submitLead({ type: "trade-in", dealer, boat, ...f });
    setStep((s) => Math.min(4, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const badge = { 1: "Step 1 of 3", 2: "Step 2 of 3", 3: "Step 3 of 3", 4: "Done" }[step];
  const cardTitle = { 1: "Tell us about your boat", 2: "A few more details", 3: "Where to reach you", 4: "You’re all set" }[step];
  const nextLabel = { 1: "Next →", 2: "Next →", 3: "Get my Trade-In Special →" }[step] || "Next";
  const footHint = {
    1: "No obligation, ever. This just gets your special started.",
    2: "Engine hours and condition help the dealer prep your special.",
    3: `We only use this to send your Trade-In Special from ${dealerName}, never spam calls.`,
    4: `${dealerName} will be in touch before the show.`,
  }[step];
  const progressPct = (Math.min(step, 3) / 3) * 100 + "%";

  return (
    <>
      {!embedded && <AnnouncementBar />}
      {!embedded && <Nav active="/#trade" />}

      <section style={{ position: "relative", background: "#0A2138", color: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-25%", right: "-8%", width: "60%", height: "150%", background: "radial-gradient(circle at 68% 34%, rgba(242,106,62,.14), transparent 60%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1300, margin: "0 auto", padding: "clamp(32px,5vw,64px) clamp(18px,4vw,40px) clamp(40px,6vw,72px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "clamp(28px,4vw,52px)", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <Eyebrow>Boat Show Trade-In Special</Eyebrow>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(34px,5vw,60px)", lineHeight: 0.98, letterSpacing: "-.03em", margin: "16px 0 0" }}>Lock in your trade before you arrive.</h1>
            <p style={{ maxWidth: 500, fontSize: "clamp(16px,1.3vw,19px)", lineHeight: 1.55, color: "rgba(255,255,255,.82)", margin: "20px 0 0" }}>
              {boat ? <>Trading toward the <strong style={{ color: "#fff" }}>{boat}</strong>? </> : null}
              Tell {dealerName} about your boat and they&rsquo;ll prepare your Boat Show Trade-In Special, ready and waiting when you get to the docks. One dealer, no runaround, no obligation.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
              {[`Handled by ${dealerName}, the dealer for this boat`, "Your Trade-In Special, secured before you arrive", "Roll it into your show boat, or keep it simple"].map((t) => (
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
              <div style={{ textAlign: "center", padding: "10px 0 2px" }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(23,138,90,.12)", color: "#178a5a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px" }}>✓</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(22px,3vw,28px)", color: "#0A2138", letterSpacing: "-.01em" }}>Thanks, {f.firstName || "you"}!</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#5a6c78", margin: "10px auto 0", maxWidth: "36ch" }}>{dealerName} will reach out with your Boat Show Trade-In Special before the show, so it&rsquo;s ready and waiting when you arrive. No obligation.</p>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              {step > 1 && step < 4 && (
                <button onClick={back} className="btn-outline" style={{ flex: "0 0 auto", background: "#fff", color: "#0A2138", fontWeight: 700, fontSize: 15, padding: "14px 20px", borderRadius: 12, border: "1px solid rgba(11,34,56,.2)", cursor: "pointer" }}>Back</button>
              )}
              {step === 4 ? (
                <Link href="/inventory" className="h-brighten" style={{ flex: 1, textAlign: "center", background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12 }}>Browse the fleet →</Link>
              ) : (
                <button onClick={next} className="h-brighten" style={{ flex: 1, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 15, padding: 15, borderRadius: 12, border: "none", cursor: "pointer" }}>{nextLabel}</button>
              )}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#9aa7b0", marginTop: 12, textAlign: "center", lineHeight: 1.5 }}>{footHint}</div>
          </div>
        </div>
      </section>

      {!embedded && <Footer />}
    </>
  );
}
