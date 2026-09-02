"use client";

/**
 * The two-step push to the ticket window, step one.
 *
 * The show does not control Interactive Ticketing and never sees its orders,
 * so the handoff is the only moment we control. The capture is that moment:
 * the shopper leaves a first name and email for the show's records, and the
 * ticket window opens in the on-site modal instead of sending them away.
 * Matching these emails against the ticketing platform's purchaser export is
 * how the show proves which sales came through this site.
 *
 * Capture grants NO inventory access. The gate stays shut until 10 AM on
 * opening day for everyone but the internal code, per the owners; an
 * unlock-at-capture design shipped briefly on 2026-08-27 and was reversed by
 * Jon the same day.
 *
 * There is no skip link, per Jon (2026-08-27): every path to the ticket
 * window goes through the capture. The abandon rate on this sheet is the
 * number to watch for whether that wall costs ticket sales.
 *
 * The checkbox is REQUIRED, per Jon (2026-08-27): it is an explicit
 * acknowledgment, not an optional opt-in, and it must be an actual click
 * (never pre-ticked). It promises exactly two emails, one when show access
 * goes live and one when Buoy launches, so every funnel lead stores name and
 * email (the consent constraint is satisfied because the box is always
 * ticked) and those two sends are now real commitments someone must make.
 *
 * The form lives in TicketCaptureForm so the popup sheet (TicketFunnelButton)
 * and the /tickets ad landing page share one implementation: same fields,
 * same rules, same copy, no drift.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "@vercel/analytics";
import { useIframeModal } from "@/components/IframeModal";
import { pixel } from "@/components/MetaPixel";
import { submitLead } from "@/lib/leads";
import { readAttribution } from "@/lib/attribution";
import { DISPLAY } from "@/components/ui";

const FONT = "var(--font-poppins), sans-serif";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * The capture form itself: first name, email, the required checkbox, and the
 * continue button. On success it records the lead, fires the funnel events,
 * opens the ticket window in the on-site modal, and calls onSubmitted so a
 * containing sheet can close itself.
 */
export function TicketCaptureForm({ source, onSubmitted, autoFocus = false }: { source: string; onSubmitted?: () => void; autoFocus?: boolean }) {
  const { open: openTickets } = useIframeModal();
  const [first, setFirst] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [hp, setHp] = useState(""); // honeypot
  const [err, setErr] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  // The popup sheet focuses the field (a deliberate open); the landing page
  // does not, so phones do not greet ad clicks with a keyboard.
  useEffect(() => {
    if (autoFocus) firstRef.current?.focus();
  }, [autoFocus]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!first.trim()) return setErr("Enter your first name.");
    if (!EMAIL_RE.test(email.trim())) return setErr("Enter a valid email address.");
    if (!optIn) return setErr("Tick the box to continue to tickets.");

    // Fire and forget: the lead write must never stand between a buyer and
    // the ticket window. The modal does not wait for it.
    void submitLead({
      type: "ticket-intent",
      firstName: first.trim(),
      email: email.trim(),
      marketingOptIn: optIn,
      website: hp,
      source,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      submittedAt: new Date().toISOString(),
      ...readAttribution(),
    });

    track("ticket_funnel_submitted", { source, optIn: String(optIn) });
    // The deepest conversion the pixel can observe: checkout runs in a
    // cross-origin iframe it cannot see into, so ads optimise against this.
    pixel("Lead", { content_name: "ticket-capture", content_category: source });
    onSubmitted?.();
    openTickets();
  }

  return (
    <form onSubmit={submit}>
      {/* Honeypot: humans never see it, bots fill everything. */}
      <input type="text" name="website" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />

      <label htmlFor="tf-first" style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#5f7180" }}>First name</label>
      <input id="tf-first" ref={firstRef} type="text" value={first} onChange={(e) => { setFirst(e.target.value); setErr(null); }} autoComplete="given-name" style={{ width: "100%", margin: "6px 0 12px", padding: "13px 15px", fontSize: 16, fontFamily: "inherit", color: "var(--navy)", background: "#fff", border: "2px solid rgba(20,46,81,.18)", borderRadius: 12, outline: "none" }} />

      <label htmlFor="tf-email" style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#5f7180" }}>Email</label>
      <input id="tf-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }} autoComplete="email" autoCapitalize="none" inputMode="email" style={{ width: "100%", margin: "6px 0 0", padding: "13px 15px", fontSize: 16, fontFamily: "inherit", color: "var(--navy)", background: "#fff", border: `2px solid ${err && !EMAIL_RE.test(email.trim()) && first.trim() ? "#c0392b" : "rgba(20,46,81,.18)"}`, borderRadius: 12, outline: "none" }} />

      <label style={{ display: "flex", gap: 9, alignItems: "flex-start", margin: "14px 0 0", cursor: "pointer" }}>
        <input type="checkbox" checked={optIn} aria-required="true" onChange={(e) => { setOptIn(e.target.checked); setErr(null); }} style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--navy)" }} />
        <span style={{ fontFamily: FONT, fontSize: 12.5, lineHeight: 1.5, color: "rgba(20,46,81,.72)" }}>
          Email me when show access goes live, and when Buoy, the boating app behind this site, launches.
        </span>
      </label>

      {err && (
        <div role="alert" style={{ fontFamily: FONT, color: "#c0392b", fontSize: 13.5, marginTop: 10, fontWeight: 600 }}>{err}</div>
      )}

      <button type="submit" className="h-lift" style={{ width: "100%", marginTop: 14, padding: "14px 20px", fontSize: 16, fontWeight: 700, fontFamily: FONT, color: "var(--navy)", background: "var(--gold)", border: "none", borderRadius: 999, cursor: "pointer" }}>
        Continue to tickets →
      </button>

      <p style={{ fontFamily: FONT, fontSize: 11.5, lineHeight: 1.5, color: "#7c8b96", margin: "12px 0 0", textAlign: "center" }}>
        Required to continue. Unsubscribe any time with one click. See our{" "}
        <a href="/privacy" style={{ color: "var(--linkblue)", fontWeight: 600 }}>privacy policy</a>.
      </p>
    </form>
  );
}

export function TicketFunnelButton({
  label = "Get your show tickets →",
  source,
  style,
  className = "h-lift",
  onOpen,
}: {
  label?: string;
  source: string;
  style?: React.CSSProperties;
  className?: string;
  /** Called when the sheet opens; the nav uses it to close its menu. */
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);

  // Ad landings can deep-link straight into the capture: /inventory?tickets=1
  // auto-opens the sheet. Only the gate's instance responds, so the nav and
  // menu buttons on the same page do not triple-open it.
  useEffect(() => {
    if (source !== "inventory-gate" || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has("tickets")) return;
    url.searchParams.delete("tickets");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    setOpen(true);
    track("ticket_funnel_opened", { source: "inventory-gate-adlink" });
  }, [source]);

  const close = () => {
    track("ticket_funnel_abandoned", { source });
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => { setOpen(true); onOpen?.(); track("ticket_funnel_opened", { source }); }}
        style={{ fontFamily: FONT, cursor: "pointer", border: "none", ...style }}
      >
        {label}
      </button>

      {/* Portaled to <body> so no transformed ancestor can ever cage it. */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Get show tickets"
          style={{ position: "fixed", inset: 0, zIndex: 220, background: "rgba(20,46,81,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}
        >
          <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 18, padding: "clamp(22px,4vw,30px)", boxShadow: "0 30px 80px -25px rgba(20,46,81,.6)", position: "relative" }}>
            <button onClick={close} aria-label="Close" style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(20,46,81,.15)", background: "#fff", color: "var(--navy)", fontSize: 15, cursor: "pointer" }}>✕</button>

            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 21, color: "var(--navy)", paddingRight: 34 }}>Grab your show tickets</div>
            <p style={{ fontFamily: FONT, fontSize: 14, lineHeight: 1.55, color: "rgba(20,46,81,.72)", margin: "8px 0 16px" }}>
              Tickets open in a moment. First, leave your name and email so the show knows you found
              your boats here.
            </p>

            <TicketCaptureForm source={source} onSubmitted={() => setOpen(false)} autoFocus />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
