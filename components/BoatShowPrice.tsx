"use client";

import { useState } from "react";
import { DISPLAY, MONO } from "@/components/ui";
import { submitLead } from "@/lib/leads";

const FONT = "var(--font-poppins), sans-serif";

/**
 * "Boat Show Price": a deliberately blurred figure with no number behind it.
 *
 * The bars are empty spans, not blurred text — there is no price in the DOM,
 * no title attribute, and nothing to reveal by inspecting, selecting, or
 * saving the page, because no number exists. We hold no price data for any
 * boat; the blur is the content, not a filter over content. Keep it that way:
 * putting a real or placeholder figure in here would turn an honest teaser
 * into something that reads as a trick.
 *
 * The "$" is real text so the block is legibly a price rather than a broken
 * image, and a visually-hidden line carries the same message to screen
 * readers, who would otherwise get a lone dollar sign and silence.
 */
const BARS = [
  { w: 17, h: 40 },
  { w: 16, h: 37 },
  null,
  { w: 17, h: 39 },
  { w: 16, h: 36 },
  { w: 17, h: 38 },
];

function BlurredFigure() {
  return (
    <>
      <div aria-hidden style={{ display: "flex", alignItems: "flex-end", gap: 7, marginBottom: 4 }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 36, fontWeight: 800, lineHeight: 0.92, letterSpacing: "-.02em", color: "var(--navy)" }}>$</span>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 42, filter: "blur(8px)", pointerEvents: "none", userSelect: "none" }}>
          {BARS.map((b, i) =>
            b === null ? (
              <span key={i} style={{ width: 7 }} />
            ) : (
              <span key={i} style={{ display: "block", width: b.w, height: b.h, background: "rgba(20,46,81,.82)", borderRadius: 3 }} />
            )
          )}
        </div>
      </div>
      <span className="sr-only">Price available at the show.</span>
    </>
  );
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "#fff",
  border: "1px solid rgba(20,46,81,.18)",
  borderRadius: 9,
  padding: "11px 13px",
  fontSize: 14.5,
  color: "var(--navy)",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: MONO,
  fontWeight: 600,
  fontSize: 10.5,
  letterSpacing: ".09em",
  textTransform: "uppercase",
  color: "rgba(20,46,81,.55)",
  marginBottom: 5,
};

export function BoatShowPrice({ boat, dealer }: { boat: string; dealer: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((s) => ({ ...s, [k]: e.target.value }));
    if (err) setErr("");
  };

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setErr("Enter your name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return setErr("Enter a valid email address.");
    setBusy(true);
    const { ok } = await submitLead({ type: "price-request", boat, dealer, ...form });
    setBusy(false);
    if (ok) setSent(true);
    else setErr("Something went wrong. Try again, or call the dealer above.");
  }

  return (
    <div style={{ background: "#FFFCF3", border: "1px solid rgba(253,183,23,.55)", borderRadius: 14, padding: 18 }}>
      <BlurredFigure />

      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 15, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--navy)", marginTop: 10 }}>
        Boat Show Price
      </div>
      <span aria-hidden style={{ display: "block", width: 44, height: 3, borderRadius: 2, background: "var(--gold)", margin: "9px 0 10px" }} />

      {sent ? (
        <p style={{ fontSize: 13.5, color: "rgba(20,46,81,.72)", margin: 0, lineHeight: 1.55 }}>
          Got it. {dealer} will be in touch, and the number is yours on the dock.
        </p>
      ) : (
        <>
          <p style={{ fontSize: 13.5, color: "rgba(20,46,81,.72)", margin: 0, lineHeight: 1.55 }}>
            The best number of the year on this boat, and you can only get it standing on the dock.
          </p>

          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className="h-brighten"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 13, background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", padding: "12px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Request price <span aria-hidden>→</span>
            </button>
          ) : (
            <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 14 }}>
              <div>
                <label style={labelStyle} htmlFor="bsp-name">Name</label>
                <input id="bsp-name" style={fieldStyle} value={form.name} onChange={set("name")} autoComplete="name" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="bsp-email">Email</label>
                <input id="bsp-email" type="email" style={fieldStyle} value={form.email} onChange={set("email")} autoComplete="email" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="bsp-phone">Phone <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <input id="bsp-phone" type="tel" style={fieldStyle} value={form.phone} onChange={set("phone")} autoComplete="tel" />
              </div>

              {err && <div style={{ fontSize: 13, color: "#b3261e" }}>{err}</div>}

              <button
                type="submit"
                disabled={busy}
                className="h-brighten"
                style={{ background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", padding: "12px 18px", borderRadius: 8, border: "none", cursor: busy ? "default" : "pointer", fontFamily: "inherit" }}
              >
                {busy ? "Sending…" : "Send request"}
              </button>
              <p style={{ fontFamily: FONT, fontSize: 11.5, color: "rgba(20,46,81,.55)", margin: 0, lineHeight: 1.45 }}>
                Goes to {dealer}. We never sell your details.
              </p>
            </form>
          )}
        </>
      )}
    </div>
  );
}
