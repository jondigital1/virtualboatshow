"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "@vercel/analytics";
import { DISPLAY, MONO } from "@/components/ui";
import { submitLead } from "@/lib/leads";
import { readAttribution } from "@/lib/attribution";

/**
 * Check Availability: a shopper asks the dealer whether a boat from the 2026
 * lineup is still available. It replaced the dockside walkthrough once the
 * show was over (Jon, 2026-09-15); components/DocksideWalkthrough.tsx is kept
 * for the next show.
 *
 * Every field is optional, but a name or an email has to be filled in before
 * it sends (Jon). The request goes to the dealer by email, with reply-to set to
 * the shopper when they left an address, and a copy to the show's inquiry
 * inbox; when the dealer has no address on file it goes to that inbox alone,
 * to be passed on (app/api/leads/route.ts). The confirmation says only what
 * actually happened, and offers the dealer's store line whenever the request
 * did not go straight to the dealer or the shopper left no way to reply.
 * A phone number is emailed, never stored. Pricing is never requested, shown
 * or promised.
 */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type AvailabilityBoat = { slug: string; brand: string; model: string; year: number | null };

type Sent = { reachable: boolean; delivered: boolean; toDealer: boolean };

const label: React.CSSProperties = {
  display: "block",
  fontFamily: MONO,
  fontWeight: 600,
  fontSize: 10.5,
  letterSpacing: ".09em",
  textTransform: "uppercase",
  color: "rgba(20,46,81,.55)",
  marginBottom: 5,
};

const optional: React.CSSProperties = { fontWeight: 400, textTransform: "none", letterSpacing: 0 };

const field: React.CSSProperties = {
  width: "100%",
  background: "#fff",
  border: "1px solid rgba(20,46,81,.18)",
  borderRadius: 9,
  padding: "11px 13px",
  fontSize: 16,
  color: "var(--navy)",
  fontFamily: "inherit",
};

const para: React.CSSProperties = { fontSize: 14.5, color: "rgba(20,46,81,.8)", lineHeight: 1.55, margin: 0 };

export function CheckAvailability({
  boat,
  dealer,
  dealerPhone,
  source,
  variant = "primary",
}: {
  boat: AvailabilityBoat;
  dealer: string;
  /** The dealer's store line, offered in the confirmation when it helps. */
  dealerPhone?: string;
  /** Where the button was clicked from, for funnel reporting. */
  source: string;
  /** "bar": half of the phone action bar on boat pages, label allowed to wrap. */
  variant?: "primary" | "compact" | "bar";
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", website: "" });
  const firstField = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Refs, not state, so the Escape listener registered on open always reads
  // the current values.
  const startedRef = useRef(false);
  const submittedRef = useRef(false);
  const title = [boat.year, boat.brand, boat.model].filter(Boolean).join(" ");

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // Back to the button that opened the dialog, so a shopper keeps their
      // place in the lineup.
      trigger?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // The form is replaced by the confirmation; move focus to its heading so it
  // is read out and keyboard focus is not lost.
  useEffect(() => {
    if (sent) headingRef.current?.focus();
  }, [sent]);

  function openForm() {
    track("availability_cta_clicked", { boat: boat.slug, dealer, source });
    setOpen(true);
  }

  function close() {
    if (!submittedRef.current && startedRef.current) track("availability_abandoned", { boat: boat.slug, dealer, source });
    setOpen(false);
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!startedRef.current) {
      startedRef.current = true;
      track("availability_started", { boat: boat.slug, dealer, source });
    }
    setForm((s) => ({ ...s, [k]: e.target.value }));
    if (err) setErr("");
  };

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    if (!name && !email) return setErr("Enter your name or your email so the dealer knows who is asking.");
    if (email && !EMAIL_RE.test(email)) return setErr("That email address doesn't look right. Check it, or leave it blank.");

    setBusy(true);
    const res = await submitLead({
      type: "availability-request",
      name,
      email,
      phone,
      website: form.website, // honeypot
      // Consent by continuing; the sentence above the button says so.
      marketingOptIn: true,
      boatId: boat.slug,
      year: boat.year,
      make: boat.brand,
      model: boat.model,
      dealerName: dealer,
      pageUrl: window.location.href,
      referrer: document.referrer,
      source,
      submittedAt: new Date().toISOString(),
      ...readAttribution(),
    });
    setBusy(false);

    if (!res.ok) return setErr("Something went wrong. Try again in a moment.");
    submittedRef.current = true;
    const result: Sent = {
      reachable: Boolean(email || phone),
      delivered: res.delivered !== false,
      toDealer: res.toDealer !== false,
    };
    track("availability_submitted", { boat: boat.slug, dealer, source, hasEmail: Boolean(email), hasPhone: Boolean(phone), delivered: result.delivered, toDealer: result.toDealer });
    setSent(result);
  }

  const btnStyle: React.CSSProperties =
    variant === "bar"
      ? { fontSize: 11.5, padding: "10px 8px", flex: "1 1 0", minWidth: 0, minHeight: 48, justifyContent: "center", whiteSpace: "normal", textAlign: "center", lineHeight: 1.2, letterSpacing: ".04em" }
      : variant === "compact"
        ? { fontSize: 11.5, padding: "10px 14px", flex: "1 1 auto", justifyContent: "center" }
        : { fontSize: 12, padding: "13px 18px", width: "100%", justifyContent: "center" };

  const phoneLink = dealerPhone ? (
    <a href={`tel:${dealerPhone.replace(/\D/g, "")}`} style={{ color: "var(--linkblue)", fontWeight: 700 }}>{dealerPhone}</a>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={openForm}
        className="h-brighten"
        style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--navy)", color: "#fff", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", ...btnStyle }}
      >
        Check Availability <span aria-hidden>&rarr;</span>
      </button>

      {/* Portaled to <body>: ancestors like .card-lift carry hover transforms,
          and a transformed ancestor turns position:fixed into a caged
          absolute, which would trap this dialog inside an inventory card. */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
          style={{ position: "fixed", inset: 0, zIndex: 220, background: "rgba(20,46,81,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ca-title"
            style={{ background: "#fff", borderRadius: 16, width: "min(100%, 440px)", maxHeight: "calc(100dvh - 32px)", overflowY: "auto", padding: "22px 22px 24px", boxShadow: "0 30px 70px -30px rgba(20,46,81,.6)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(20,46,81,.55)" }}>{dealer}</div>
                <h2 id="ca-title" ref={headingRef} tabIndex={-1} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 21, lineHeight: 1.15, color: "var(--navy)", margin: "6px 0 0", outline: "none" }}>
                  {!sent ? "Check availability" : sent.delivered ? "Request sent" : "Please call the dealer"}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                style={{ width: 44, height: 44, margin: "-10px -12px 0 0", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", background: "none", border: "none", fontSize: 26, lineHeight: 1, color: "rgba(20,46,81,.5)", cursor: "pointer", padding: 0 }}
              >
                &times;
              </button>
            </div>

            {sent ? (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {sent.delivered ? (
                  <>
                    <p style={para}>
                      Your question about the {title} is on its way to {dealer}
                      {sent.reachable ? ", with the details you left so they can reply." : "."}
                    </p>
                    {!sent.reachable ? (
                      <p style={para}>
                        You didn&rsquo;t leave an email or phone number, so {phoneLink ? <>call {dealer} at {phoneLink}</> : <>contact {dealer} directly</>} if you want to hear back.
                      </p>
                    ) : !sent.toDealer && phoneLink ? (
                      <p style={para}>For a quicker answer, you can also call {dealer} at {phoneLink}.</p>
                    ) : null}
                  </>
                ) : (
                  <p style={para}>
                    We couldn&rsquo;t send your question to {dealer} just now. {phoneLink ? <>Call them at {phoneLink} about the {title}.</> : <>Please contact them directly about the {title}.</>}
                  </p>
                )}
                <button type="button" onClick={close} className="h-brighten" style={{ marginTop: 8, width: "100%", background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", padding: "13px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={send} noValidate style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
                <p style={{ fontSize: 13.5, color: "rgba(20,46,81,.72)", margin: 0, lineHeight: 1.5 }}>
                  Ask {dealer} whether the {title} is still available. Leave an email or phone number so they can reply.
                </p>

                {/* Honeypot: people never see it, bots fill everything. */}
                <input type="text" name="website" value={form.website} onChange={set("website")} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />

                <div>
                  <label style={label} htmlFor="ca-name">Name <span style={optional}>(optional)</span></label>
                  <input id="ca-name" ref={firstField} style={field} value={form.name} onChange={set("name")} autoComplete="name" />
                </div>
                <div>
                  <label style={label} htmlFor="ca-email">Email <span style={optional}>(optional)</span></label>
                  <input id="ca-email" type="email" inputMode="email" autoCapitalize="none" style={field} value={form.email} onChange={set("email")} autoComplete="email" />
                </div>
                <div>
                  <label style={label} htmlFor="ca-phone">Phone <span style={optional}>(optional)</span></label>
                  <input id="ca-phone" type="tel" style={field} value={form.phone} onChange={set("phone")} autoComplete="tel" />
                </div>

                <p style={{ fontSize: 12.5, color: "rgba(20,46,81,.72)", lineHeight: 1.5, margin: 0 }}>
                  By sending this you agree that this dealer may contact you about this boat, by phone or email. A
                  copy of your request goes to the show&rsquo;s inquiry inbox. The Atlantic City In-Water Boat Show and
                  Buoy, the boating app behind this site, save only your name and email, never your phone number, and
                  may email you about this show, future shows, and Buoy. We never sell your details. Unsubscribe any
                  time with one click. <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--linkblue)", fontWeight: 600 }}>Privacy</a>
                </p>

                {err && <div role="alert" style={{ fontSize: 13, color: "#b3261e", fontWeight: 600 }}>{err}</div>}

                <button
                  type="submit"
                  disabled={busy}
                  className="h-brighten"
                  style={{ background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", padding: "13px 18px", borderRadius: 8, border: "none", cursor: busy ? "default" : "pointer", fontFamily: "inherit", marginTop: 2, opacity: busy ? 0.75 : 1 }}
                >
                  {busy ? "Sending…" : "Send to the dealer"}
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
