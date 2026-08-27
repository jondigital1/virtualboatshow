"use client";

/**
 * Access gate for the INVENTORY pages only (wired in app/inventory/layout.tsx).
 *
 * Why it exists: the show owners do not want prospective attendees browsing the
 * full boat list before they have bought a ticket, on the theory that seeing it
 * all online removes the reason to come. So the inventory sits behind a code the
 * show hands to ticket buyers, and the gate itself sells the ticket to anyone
 * who does not have one yet.
 *
 * A SOFT gate, by design and by audience. The code is stored as a SHA-256 hash
 * (not plaintext), so a casual visitor cannot read it in the page source. A
 * determined technical person could still reach the data (the boat list ships
 * in the client bundle, and boat detail pages stay open so share links keep
 * working), but that is not the threat model: the point is to deter normal
 * pre-shopping, not to defend against scrapers.
 *
 * Codes are case-insensitive: this component and the script both lowercase
 * before hashing, so a flyer that styles the code as LetsBoat still unlocks.
 *
 * To change the code: node scripts/set-gate-password.mjs "yournewcode"
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { track } from "@vercel/analytics";
import { DISPLAY, MONO } from "@/components/ui";

// SHA-256 of the current show password. Changed via scripts/set-gate-password.mjs.
const PASSWORD_HASH = "ef48cbbb34d2e019141accae5972292b7de037898c7c282ede77614badee82f3";
const STORAGE_KEY = "ac-show-access-2026";
const TICKETS_URL = "https://secure.interactiveticketing.com/1.43/1f654c/#/select";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function ShowGate({ children }: { children: React.ReactNode }) {
  // Start LOCKED so the server-rendered HTML already covers the page: an
  // uninvited visitor never sees a flash of the real site. A returning guest is
  // unlocked in the effect below before they notice.
  const [locked, setLocked] = useState(true);
  const [ready, setReady] = useState(false); // avoids the gate flashing for known guests
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Already unlocked on this device?
    if (localStorage.getItem(STORAGE_KEY) === PASSWORD_HASH) { setLocked(false); setReady(true); return; }

    // Unlock via URL: the ticketing platform's post-purchase redirect points here
    // as /inventory?code=THECODE, so a buyer lands straight in the open inventory
    // without typing anything. Same secret as the manual field, so a shared link
    // is exactly as "secure" as a shared code, which is the right level here.
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      sha256(code.trim().toLowerCase()).then((hash) => {
        if (hash === PASSWORD_HASH) {
          localStorage.setItem(STORAGE_KEY, PASSWORD_HASH);
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

  // Hold the page still behind the gate, and focus the field.
  useEffect(() => {
    if (locked && ready) {
      track("inventory_gate_shown");
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      inputRef.current?.focus();
      return () => { document.body.style.overflow = prev; };
    }
  }, [locked, ready]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(false);
    const hash = await sha256(value.trim().toLowerCase());
    if (hash === PASSWORD_HASH) {
      localStorage.setItem(STORAGE_KEY, PASSWORD_HASH);
      track("inventory_gate_unlocked", { method: "typed" });
      setLeaving(true);
      setTimeout(() => setLocked(false), 480); // let the fade-out play
    } else {
      track("inventory_gate_failed");
      setError(true);
      setBusy(false);
      inputRef.current?.select();
    }
  }

  return (
    <>
      {children}
      {locked && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Boat show inventory, for ticket holders"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(18px,4vw,40px)",
            background: "#142E51",
            overflowX: "hidden",
            opacity: leaving ? 0 : 1,
            transition: "opacity .45s ease",
            // hide until the effect confirms the guest is not already unlocked,
            // so known guests don't see the gate blink
            visibility: ready ? "visible" : "hidden",
          }}
        >
          {/* warm coral glow, the show's signature accent on dark grounds */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 55% at 50% 8%, rgba(253,183,23,.22), transparent 60%)", pointerEvents: "none" }} />

          <div
            style={{
              position: "relative",
              // Clamp to the visual viewport with 100vw, so the card can never be
              // wider than the phone screen no matter what the containing block does.
              width: "100%",
              maxWidth: "min(520px, calc(100vw - 32px))",
              minWidth: 0,
              background: "var(--cream, #F4F7F9)",
              borderRadius: 26,
              padding: "clamp(30px,5vw,52px) clamp(26px,5vw,48px)",
              boxShadow: "0 40px 90px -30px rgba(0,0,0,.7)",
              transform: leaving ? "translateY(-8px)" : "translateY(0)",
              animation: "gateIn .6s cubic-bezier(.16,1,.3,1) both",
            }}
          >
            {/* brand lockup */}
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <Image src="/buoy-ring-logo.svg" alt="Buoy" width={38} height={38} priority style={{ display: "block" }} />
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, letterSpacing: "-.01em", color: "var(--ink,#142E51)" }}>
                AC In-Water Boat Show
              </span>
            </div>

            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--accent,#F26A3E)", margin: "30px 0 0", fontWeight: 700 }}>
              September 10&ndash;13, 2026 · Atlantic City
            </div>

            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(27px,4.5vw,38px)", lineHeight: 1.06, letterSpacing: "-.02em", color: "var(--ink,#142E51)", margin: "12px 0 0" }}>
              Thanks for stopping by.
            </h1>

            <p style={{ fontSize: 17, lineHeight: 1.55, color: "#3d5260", margin: "16px 0 0" }}>
              Welcome to the Atlantic City Virtual Boat Show. Ticket holders get an early look at every boat headed to this year&rsquo;s docks. The Boat Show Pricing waits for you at the show itself, September 10 to 13, where the deals are made.
            </p>

            {/* PRIMARY: a welcome invites you IN, so tickets lead, not the code.
                Opens in a new tab so the ticketing platform's post-purchase
                redirect can drop the buyer back on the open inventory via the
                ?code= unlock handled in the effect above. */}
            <a
              href={TICKETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="h-lift"
              style={{ display: "block", textAlign: "center", marginTop: 26, padding: "16px 20px", fontSize: 17, fontWeight: 700, color: "var(--ink,#142E51)", background: "var(--accent,#F26A3E)", borderRadius: 999, textDecoration: "none" }}
            >
              Get your show tickets →
            </a>

            {/* SECONDARY: for guests who already bought in. Offered warmly, below
                the invitation, never as the first thing they hit. */}
            <form onSubmit={submit} style={{ marginTop: 24, paddingTop: 22, borderTop: "1px solid rgba(20,46,81,.12)" }}>
              <label htmlFor="show-pw" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#5f7180", fontWeight: 700 }}>
                Already have tickets? Enter your code
              </label>
              <input
                id="show-pw"
                ref={inputRef}
                type="password"
                value={value}
                onChange={(e) => { setValue(e.target.value); if (error) setError(false); }}
                autoComplete="off"
                autoCapitalize="none"
                aria-invalid={error}
                aria-describedby={error ? "show-pw-err" : undefined}
                placeholder="Enter your access code"
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "16px 18px",
                  fontSize: 17,
                  fontFamily: "inherit",
                  color: "var(--ink,#142E51)",
                  background: "#fff",
                  border: `2px solid ${error ? "#c0392b" : "rgba(20,46,81,.18)"}`,
                  borderRadius: 14,
                  outline: "none",
                  transition: "border-color .15s ease",
                  animation: error ? "gateShake .4s" : undefined,
                }}
                onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = "var(--accent,#F26A3E)"; }}
                onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = "rgba(20,46,81,.18)"; }}
              />
              {error && (
                <div id="show-pw-err" role="alert" style={{ color: "#c0392b", fontSize: 14.5, marginTop: 10, fontWeight: 600 }}>
                  That code isn&apos;t right. Check your ticket confirmation and try again.
                </div>
              )}

              <button
                type="submit"
                disabled={busy && !error}
                className="h-lift"
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: "14px 20px",
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  color: "var(--ink,#142E51)",
                  // Quiet outline, not the coral fill: tickets are the loud
                  // action, unlocking is the secondary one.
                  background: "transparent",
                  border: "1.5px solid rgba(20,46,81,.28)",
                  borderRadius: 999,
                  cursor: busy && !error ? "default" : "pointer",
                  opacity: busy && !error ? 0.75 : 1,
                }}
              >
                {busy && !error ? "Checking…" : "Unlock inventory →"}
              </button>
            </form>

            {/* powered-by-Buoy footer, matching the site chrome */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 30, paddingTop: 20, borderTop: "1px solid rgba(20,46,81,.1)" }}>
              <Image src="/buoy-ring-logo.svg" alt="" width={18} height={18} style={{ display: "block", opacity: 0.75 }} />
              <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#7c8b96", fontWeight: 700 }}>
                The digital companion, powered by Buoy
              </span>
            </div>
          </div>

          <style>{`
            @keyframes gateIn { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; } }
            @keyframes gateShake { 10%,90%{transform:translateX(-1px)} 20%,80%{transform:translateX(2px)} 30%,50%,70%{transform:translateX(-4px)} 40%,60%{transform:translateX(4px)} }
            @media (prefers-reduced-motion: reduce) {
              [aria-modal="true"] > div { animation: none !important; }
              #show-pw { animation: none !important; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
