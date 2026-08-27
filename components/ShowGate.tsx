"use client";

/**
 * Access gate for the INVENTORY pages only (wired in app/inventory/layout.tsx).
 *
 * Why it exists: the show owners do not want prospective attendees browsing the
 * full boat list before the show, on the theory that seeing it all online
 * removes the reason to come. Virtual inventory access opens to everyone at
 * 9 AM on opening day. Until then the inventory sits behind an access code the
 * show hands out at its own discretion, and the gate sells show tickets.
 *
 * IMPORTANT, per the owners: buying a ticket does NOT unlock the inventory
 * early, so no copy here may promise access "now" or tie the code to a ticket
 * purchase. The card names the exact opening moment instead.
 *
 * The locked view is the client-approved "teaser" render from the Gate Options
 * mock: four real boat photos in real inventory cards with the names blurred
 * out, then an "Opens September 10 at 9 AM" card carrying the tickets CTA and
 * the code entry. It renders in the normal page chrome, not as a modal, so a
 * visitor (and a search crawler) lands on a page that sells the show rather
 * than a wall. At 9 AM Eastern on September 10 the gate lifts by itself.
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
import { track } from "@vercel/analytics";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, Eyebrow } from "@/components/ui";
import { showBoats, type ShowBoat } from "@/lib/showboats";
import { placementFor } from "@/lib/docks";

const FONT = "var(--font-poppins), sans-serif";

// SHA-256 of the current show password. Changed via scripts/set-gate-password.mjs.
const PASSWORD_HASH = "ef48cbbb34d2e019141accae5972292b7de037898c7c282ede77614badee82f3";
const STORAGE_KEY = "ac-show-access-2026";
const TICKETS_URL = "https://secure.interactiveticketing.com/1.43/1f654c/#/select";

// The gate lifts when virtual inventory access opens: 9 AM Eastern on opening
// day, per the show owners. Change only this constant if that ever moves.
const SHOW_OPENS = Date.parse("2026-09-10T09:00:00-04:00");

// The four boats from the approved mock. Photos show, names stay blurred.
const TEASER_SLUGS = ["cobia-320-cc", "regal-36xo", "pursuit-s-358", "albemarle-30-express"];

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function teaserBoats(): ShowBoat[] {
  const picked = TEASER_SLUGS
    .map((s) => showBoats.find((b) => b.slug === s))
    .filter((b): b is ShowBoat => Boolean(b && b.photos.length > 0));
  // If a mock boat ever drops out of the sheet, backfill so the grid stays full.
  for (const b of showBoats) {
    if (picked.length >= 4) break;
    if (b.photos.length > 0 && !picked.includes(b)) picked.push(b);
  }
  return picked.slice(0, 4);
}

/** A real inventory card with the identity blurred out. Purely decorative. */
function TeaserCard({ b }: { b: ShowBoat }) {
  const placement = b.dealers[0] ? placementFor(b.dealers[0].name) : undefined;
  const berth = placement
    ? placement.dock === "Land"
      ? `${placement.where} · land display`
      : `${placement.dock} · ${placement.where}`
    : "Dock & slip announced before the show";
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(20,46,81,.1)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", aspectRatio: "16/11", background: "linear-gradient(160deg,#e8eef3,#dfe7ee)" }}>
        {/* Eager on purpose: these four are the gate page's above-the-fold hero. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={b.photos[0]} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ padding: "13px 14px 15px", display: "flex", flexDirection: "column", gap: 5, userSelect: "none" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(20,46,81,.55)", filter: "blur(3.5px)" }}>
          {b.brand}{b.year ? ` · ${b.year}` : ""}
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 17, lineHeight: 1.15, letterSpacing: "-.01em", color: "var(--navy)", filter: "blur(5px)" }}>
          {b.model}
        </div>
        <div style={{ fontSize: 12.5, color: "#5a6c78", filter: "blur(4px)" }}>📍 {berth}</div>
      </div>
    </div>
  );
}

export function ShowGate({ children }: { children: React.ReactNode }) {
  // Start LOCKED so the server-rendered HTML is the gate page: an uninvited
  // visitor never sees a flash of the real inventory. A returning guest is
  // unlocked in the effect below before they notice.
  const [locked, setLocked] = useState(true);
  const [ready, setReady] = useState(false); // avoids the gate flashing for known guests
  const [showCode, setShowCode] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Show day: the lineup opens to everyone when the show does.
    if (Date.now() >= SHOW_OPENS) { setLocked(false); setReady(true); return; }
    // Already unlocked on this device?
    if (localStorage.getItem(STORAGE_KEY) === PASSWORD_HASH) { setLocked(false); setReady(true); return; }

    // Unlock via URL: /inventory?code=THECODE unlocks without typing, so the
    // show can hand out a link or QR to whoever it chooses to let in early.
    // Same secret as the manual field, so a shared link is exactly as "secure"
    // as a shared code, which is the right level here. Do NOT wire this into
    // the ticketing platform's post-purchase redirect: buying a ticket does
    // not come with early inventory access.
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

  useEffect(() => {
    if (locked && ready) track("inventory_gate_shown");
  }, [locked, ready]);

  // Focus the code field when it is revealed, never on page load: an auto
  // focus on load would pop the keyboard over the teaser on phones.
  useEffect(() => {
    if (showCode) inputRef.current?.focus();
  }, [showCode]);

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

  if (!locked) return <>{children}</>;

  const boats = teaserBoats();

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
            {showBoats.length} confirmed so far, and 250+ boats in the water at the show.
          </p>

          {/* The four approved teaser boats: real photos, identities blurred. */}
          <div className="gate-teasers" aria-hidden="true" style={{ marginTop: 26 }}>
            {boats.map((b) => <TeaserCard key={b.slug} b={b} />)}
          </div>

          <div style={{ maxWidth: 560, margin: "30px auto 0", background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.5)", borderRadius: 16, padding: "clamp(20px,3vw,28px)" }}>
            <div aria-hidden style={{ width: 42, height: 42, borderRadius: 12, background: "var(--navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔒</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: "var(--navy)", marginTop: 13 }}>Opens September 10 at 9 AM</div>
            <p style={{ fontSize: 14.5, color: "rgba(20,46,81,.72)", lineHeight: 1.55, margin: "7px 0 0" }}>
              The full lineup, with every photo, dock and slip, and dockside walkthrough booking, goes
              live for everyone at 9 AM on opening day. Until then, grab your tickets so you are ready
              for the docks.
            </p>

            <a
              href={TICKETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="h-lift"
              style={{ display: "block", textAlign: "center", marginTop: 18, padding: "15px 20px", fontSize: 16, fontWeight: 700, fontFamily: FONT, color: "var(--navy)", background: "var(--gold)", borderRadius: 999, textDecoration: "none" }}
            >
              Get your show tickets →
            </a>

            {!showCode ? (
              <button
                type="button"
                onClick={() => setShowCode(true)}
                className="h-lift"
                style={{ width: "100%", marginTop: 11, padding: "13px 20px", fontSize: 15, fontWeight: 700, fontFamily: FONT, color: "var(--navy)", background: "transparent", border: "1.5px solid rgba(20,46,81,.28)", borderRadius: 999, cursor: "pointer" }}
              >
                Have an access code?
              </button>
            ) : (
              <form onSubmit={submit} style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(20,46,81,.12)" }}>
                <label htmlFor="show-pw" style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#5f7180" }}>
                  Enter your access code
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
                    That code isn&apos;t right. Check it and try again.
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
