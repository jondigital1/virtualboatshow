"use client";

/**
 * Access gate for the INVENTORY pages only (wired in app/inventory/layout.tsx).
 *
 * Two phases, switched by lib/gate.ts SHOW_OPENS (9 AM Eastern, opening day):
 *
 *  BEFORE. The show owners do not want the full boat list browsable before
 *  the show. The only key is the internal access code (staff and show use,
 *  never distributed to shoppers). Buying tickets does not open the gate: the
 *  ticket funnel collects a name and email for the show's records and grants
 *  no access (a capture-unlocks design shipped briefly on 2026-08-27 and was
 *  reversed by Jon the same day).
 *
 *  FROM 9 AM ON. No passcode. The gate asks for first name, last name and
 *  email, records them, and drops the visitor onto a freshly loaded
 *  /inventory (Jon, 2026-09-07, answering Giselle's request to do away with
 *  the code: ticket holders would never know it and the show does not want
 *  to stop anyone from looking). The device is marked so nobody is asked
 *  twice. Consent to email is given by continuing, stated under the button,
 *  which is what lets the row keep the name and address at all.
 *
 * Both phases render the client-approved "teaser" view: four real boat photos
 * in real inventory cards with the names withheld, then the card carrying
 * either the ticket funnel and code entry (before) or the registration form
 * (after). It renders in the normal page chrome, not as a modal, so a visitor
 * (and a search crawler) lands on a page that sells the show rather than a
 * wall.
 *
 * A SOFT gate, by design and by audience. The code is stored as a SHA-256
 * hash (not plaintext), so a casual visitor cannot read it in the page
 * source. A determined technical person could still reach the data (the boat
 * list ships in the client bundle, and boat detail pages stay open so share
 * links keep working), but that is not the threat model: the point is to
 * deter normal pre-shopping, not to defend against scrapers.
 *
 * Codes are case-insensitive: this component and the script both lowercase
 * before hashing, so a flyer that styles the code as LetsBoat still unlocks.
 *
 * To change the code: node scripts/set-gate-password.mjs "yournewcode"
 */

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, Eyebrow } from "@/components/ui";
import { TicketFunnelButton } from "@/components/TicketFunnel";
import { submitLead } from "@/lib/leads";
import { readAttribution } from "@/lib/attribution";
import { GATE_STORAGE_KEY, GATE_PASSWORD_HASH, GATE_REGISTERED_MARK, SHOW_OPENS, SHOW_OPENS_LABEL } from "@/lib/gate";

const FONT = "var(--font-poppins), sans-serif";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * The four teaser cards: photography from the approved mock, copied to neutral
 * filenames.
 *
 * They are deliberately NOT read from inventory any more. Two reasons. The
 * blur is a CSS filter, not redaction, so pulling live boats put their brand,
 * model and berth in the page source in plain text, and served them from
 * /boats/<slug>-1.jpg, which named the boat in the URL even if the text had
 * been hidden. And the slug list rotted silently: regal-36xo stopped resolving
 * when the master inventory rework renamed it to regal-36-xo, and the backfill
 * quietly substituted another boat for months without anyone noticing.
 *
 * Static art plus placeholder labels gives the identical picture with nothing
 * behind the blur to find, and nothing to rot.
 */
const TEASERS = [
  { src: "/show/gate-teaser-1-onwater.jpg", w: ["42%", "68%", "54%"] },
  { src: "/show/gate-teaser-2-onwater.jpg", w: ["50%", "80%", "62%"] },
  { src: "/show/gate-teaser-3-onwater.jpg", w: ["38%", "62%", "50%"] },
  { src: "/show/gate-teaser-4.jpg", w: ["47%", "75%", "58%"] },
];

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** A boat card with nothing identifying in it. Purely decorative. */
function TeaserCard({ t }: { t: (typeof TEASERS)[number] }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", aspectRatio: "16/11", background: "linear-gradient(160deg,#e8eef3,#dfe7ee)" }}>
        {/* Eager on purpose: these four are the gate page's above-the-fold hero. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={t.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {/* Withheld lines, drawn as bars rather than blurred words. Blurred text
          still has to BE text: it ships in the source, and if the filter ever
          fails to apply it reads as leftover placeholder copy. A bar cannot do
          either. Widths vary per card so the grid does not look stamped. */}
      <div style={{ padding: "15px 14px 17px", display: "flex", flexDirection: "column", gap: 9 }} aria-hidden="true">
        <div style={{ height: 7, width: t.w[0], borderRadius: 4, background: "rgba(20,46,81,.13)" }} />
        <div style={{ height: 13, width: t.w[1], borderRadius: 5, background: "rgba(20,46,81,.2)" }} />
        <div style={{ height: 8, width: t.w[2], borderRadius: 4, background: "rgba(117,186,228,.42)" }} />
      </div>
    </div>
  );
}

const label: React.CSSProperties = { fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#5f7180" };
const field = (bad: boolean): React.CSSProperties => ({
  width: "100%", margin: "6px 0 0", padding: "13px 15px", fontSize: 16, fontFamily: "inherit", color: "var(--navy)", background: "#fff",
  border: `2px solid ${bad ? "#c0392b" : "rgba(20,46,81,.18)"}`, borderRadius: 12, outline: "none",
});

/**
 * Show-day registration: first name, last name, email, one button. On submit
 * the lead is recorded, the device is marked, and the browser is sent to a
 * fresh /inventory load (Jon: "drops them onto a freshly loaded inventory
 * page"), where the gate sees the mark and shows the lineup.
 */
function RegisterForm() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!first.trim()) return setErr("Enter your first name.");
    if (!last.trim()) return setErr("Enter your last name.");
    if (!EMAIL_RE.test(email.trim())) return setErr("Enter a valid email address.");
    setErr(null);
    setBusy(true);
    track("inventory_gate_registered");

    // Record the lead, but never let our own backend stand between a visitor
    // and the boats: wait for it briefly, then go regardless.
    const write = submitLead({
      type: "inventory-access",
      firstName: first.trim(),
      lastName: last.trim(),
      email: email.trim(),
      // Consent by continuing; the line under the button says so.
      marketingOptIn: true,
      website: hp,
      source: "inventory-gate",
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      submittedAt: new Date().toISOString(),
      ...readAttribution(),
    });
    await Promise.race([write, new Promise((r) => setTimeout(r, 2500))]);

    try { localStorage.setItem(GATE_STORAGE_KEY, GATE_REGISTERED_MARK); } catch { /* private mode: they get in this once */ }
    track("inventory_gate_unlocked", { method: "registered" });
    window.location.assign("/inventory");
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 18 }}>
      <input type="text" name="website" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label htmlFor="gate-first" style={label}>First name</label>
          <input id="gate-first" type="text" value={first} onChange={(e) => { setFirst(e.target.value); setErr(null); }} autoComplete="given-name" style={field(!!err && !first.trim())} />
        </div>
        <div>
          <label htmlFor="gate-last" style={label}>Last name</label>
          <input id="gate-last" type="text" value={last} onChange={(e) => { setLast(e.target.value); setErr(null); }} autoComplete="family-name" style={field(!!err && !last.trim())} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label htmlFor="gate-email" style={label}>Email</label>
        <input id="gate-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }} autoComplete="email" autoCapitalize="none" inputMode="email" style={field(!!err && !EMAIL_RE.test(email.trim()) && !!first.trim() && !!last.trim())} />
      </div>

      {err && (
        <div role="alert" style={{ fontFamily: FONT, color: "#c0392b", fontSize: 13.5, marginTop: 10, fontWeight: 600 }}>{err}</div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="h-lift"
        style={{ width: "100%", marginTop: 16, padding: "15px 20px", fontSize: 16, fontWeight: 700, fontFamily: FONT, color: "var(--navy)", background: "var(--gold)", border: "none", borderRadius: 999, cursor: busy ? "default" : "pointer", opacity: busy ? 0.75 : 1 }}
      >
        {busy ? "Opening the lineup…" : "See the boats →"}
      </button>

      <p style={{ fontFamily: FONT, fontSize: 11.5, lineHeight: 1.5, color: "#7c8b96", margin: "12px 0 0", textAlign: "center" }}>
        By continuing you agree that the show may email you about the show and about Buoy, the boating app
        behind this site. Unsubscribe any time with one click. See our{" "}
        <a href="/privacy" style={{ color: "var(--linkblue)", fontWeight: 600 }}>privacy policy</a>.
      </p>
    </form>
  );
}

export function ShowGate({ children }: { children: React.ReactNode }) {
  // Start LOCKED so the server-rendered HTML is the gate page: an uninvited
  // visitor never sees a flash of the real inventory. A returning guest is
  // unlocked in the effect below before they notice.
  const [locked, setLocked] = useState(true);
  const [ready, setReady] = useState(false); // avoids the gate flashing for known guests
  const [open, setOpen] = useState(false); // show day: registration replaces the code
  const [showEntry, setShowEntry] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Already through, by code or by show-day registration on this device.
    // (The old email-key marker is deliberately NOT honoured.)
    let mark: string | null = null;
    try { mark = localStorage.getItem(GATE_STORAGE_KEY); } catch { /* private mode */ }
    if (mark === GATE_PASSWORD_HASH || mark === GATE_REGISTERED_MARK) { setLocked(false); setReady(true); return; }

    // Show day: no passcode, the registration form takes over.
    if (Date.now() >= SHOW_OPENS) { setOpen(true); setReady(true); return; }

    // Unlock via URL: /inventory?code=THECODE unlocks without typing, so the
    // show can hand a link or QR to whoever it chooses. Same secret as the
    // manual field, so a shared link is exactly as "secure" as a shared code,
    // which is the right level here. This path is for the internal code only.
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      sha256(code.trim().toLowerCase()).then((hash) => {
        if (hash === GATE_PASSWORD_HASH) {
          try { localStorage.setItem(GATE_STORAGE_KEY, GATE_PASSWORD_HASH); } catch { /* private mode */ }
          setLocked(false);
          track("inventory_gate_unlocked", { method: "link" });
        }
        // Strip ?code= from the address bar either way, so it is not left visible
        // or copied into a share by accident.
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        setReady(true);
      });
      return;
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (locked && ready) track("inventory_gate_shown", { phase: open ? "show-day" : "pre-show" });
  }, [locked, ready, open]);

  // Focus the field when it is revealed, never on page load: an auto focus on
  // load would pop the keyboard over the teaser on phones.
  useEffect(() => {
    if (showEntry) inputRef.current?.focus();
  }, [showEntry]);

  function unlock(method: string) {
    track("inventory_gate_unlocked", { method });
    setLeaving(true);
    setTimeout(() => setLocked(false), 480); // let the fade-out play
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const v = value.trim();

    // People will try their ticket email out of habit; tell them the truth
    // instead of a generic wrong-code error.
    if (v.includes("@")) {
      track("inventory_gate_failed", { kind: "email" });
      setError(`The lineup opens for everyone at ${SHOW_OPENS_LABEL}. Access before then needs the show's access code.`);
      setBusy(false);
      inputRef.current?.select();
      return;
    }

    const hash = await sha256(v.toLowerCase());
    if (hash === GATE_PASSWORD_HASH) {
      try { localStorage.setItem(GATE_STORAGE_KEY, GATE_PASSWORD_HASH); } catch { /* private mode */ }
      unlock("typed");
    } else {
      track("inventory_gate_failed", { kind: "code" });
      setError("That code isn't right. Check it and try again.");
      setBusy(false);
      inputRef.current?.select();
    }
  }

  if (!locked) return <>{children}</>;

  return (
    <div style={{ visibility: ready ? "visible" : "hidden", opacity: leaving ? 0 : 1, transition: "opacity .45s ease" }}>
      <AnnouncementBar />
      <Nav active="/inventory" />

      <section style={{ background: "#fff", padding: "clamp(26px,4vw,48px) clamp(18px,3vw,44px) clamp(40px,5vw,72px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>Browse boats</Eyebrow>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.5vw,44px)", lineHeight: 1.08, letterSpacing: "-.015em", color: "var(--navy)", margin: "10px 0 0", textWrap: "balance" }}>
            Feature boats
          </h1>
          <p style={{ fontSize: "clamp(15px,1.6vw,17px)", lineHeight: 1.6, color: "rgba(20,46,81,.72)", margin: "12px 0 0", maxWidth: 640 }}>
            Hundreds of boats in the water at the show.
          </p>

          {/* The four approved teaser boats: real photos, identities withheld. */}
          <div className="gate-teasers" aria-hidden="true" style={{ marginTop: 26 }}>
            {TEASERS.map((t) => <TeaserCard key={t.src} t={t} />)}
          </div>

          <div style={{ maxWidth: 560, margin: "30px auto 0", background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.5)", borderRadius: 16, padding: "clamp(20px,3vw,28px)" }}>
            {open ? (
              <>
                <div aria-hidden style={{ width: 42, height: 42, borderRadius: 12, background: "var(--navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚓</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: "var(--navy)", marginTop: 13 }}>The lineup is open</div>
                <p style={{ fontSize: 14.5, color: "rgba(20,46,81,.72)", lineHeight: 1.55, margin: "7px 0 0" }}>
                  Tell us who you are and the full lineup is yours: every boat at the show, photo galleries,
                  and the dock where each one is tied up.
                </p>
                <RegisterForm />
                <div style={{ textAlign: "center", marginTop: 14 }}>
                  <TicketFunnelButton
                    label="Still need tickets?"
                    source="inventory-gate-open"
                    className=""
                    style={{ background: "transparent", color: "var(--linkblue)", fontWeight: 700, fontSize: 13, padding: 0 }}
                  />
                </div>
              </>
            ) : (
              <>
                <div aria-hidden style={{ width: 42, height: 42, borderRadius: 12, background: "var(--navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔒</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: "var(--navy)", marginTop: 13 }}>Opens September 10 at 9 AM</div>
                <p style={{ fontSize: 14.5, color: "rgba(20,46,81,.72)", lineHeight: 1.55, margin: "7px 0 0" }}>
                  The full lineup goes live for everyone at {SHOW_OPENS_LABEL}. Until then, grab your
                  tickets so you are ready for the docks.
                </p>

                <TicketFunnelButton
                  source="inventory-gate"
                  style={{ display: "block", width: "100%", textAlign: "center", marginTop: 18, padding: "15px 20px", fontSize: 16, fontWeight: 700, color: "var(--navy)", background: "var(--gold)", borderRadius: 999 }}
                />

                {!showEntry ? (
                  <button
                    type="button"
                    onClick={() => { track("inventory_gate_entry_revealed"); setShowEntry(true); }}
                    className="h-lift"
                    style={{ width: "100%", marginTop: 11, padding: "13px 20px", fontSize: 15, fontWeight: 700, fontFamily: FONT, color: "var(--navy)", background: "transparent", border: "1.5px solid rgba(20,46,81,.28)", borderRadius: 999, cursor: "pointer" }}
                  >
                    Have an access code?
                  </button>
                ) : (
                  <form onSubmit={submitCode} style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(20,46,81,.12)" }}>
                    <label htmlFor="show-pw" style={label}>
                      Enter your access code
                    </label>
                    <input
                      id="show-pw"
                      ref={inputRef}
                      type="password"
                      value={value}
                      onChange={(e) => { setValue(e.target.value); if (error) setError(null); }}
                      autoComplete="off"
                      autoCapitalize="none"
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "show-pw-err" : undefined}
                      placeholder="Access code"
                      style={{
                        width: "100%",
                        marginTop: 8,
                        padding: "14px 16px",
                        fontSize: 16,
                        fontFamily: "inherit",
                        color: "var(--navy)",
                        background: "#fff",
                        border: `2px solid ${error ? "#c0392b" : "rgba(20,46,81,.18)"}`,
                        borderRadius: 12,
                        outline: "none",
                        transition: "border-color .15s ease",
                        animation: error ? "gateShake .4s" : undefined,
                      }}
                      onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = "var(--lightblue)"; }}
                      onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = "rgba(20,46,81,.18)"; }}
                    />
                    {error && (
                      <div id="show-pw-err" role="alert" style={{ color: "#c0392b", fontSize: 14, marginTop: 9, fontWeight: 600 }}>
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={busy && !error}
                      className="h-lift"
                      style={{ width: "100%", marginTop: 12, padding: "13px 20px", fontSize: 15, fontWeight: 700, fontFamily: FONT, color: "#fff", background: "var(--navy)", border: "none", borderRadius: 999, cursor: busy && !error ? "default" : "pointer", opacity: busy && !error ? 0.75 : 1 }}
                    >
                      {busy && !error ? "Checking…" : "Unlock the lineup →"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .gate-teasers { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (min-width: 900px) { .gate-teasers { grid-template-columns: repeat(4, 1fr); gap: 16px; } }
        @keyframes gateShake { 10%,90%{transform:translateX(-1px)} 20%,80%{transform:translateX(2px)} 30%,50%,70%{transform:translateX(-4px)} 40%,60%{transform:translateX(4px)} }
        @media (prefers-reduced-motion: reduce) {
          #show-pw { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
