"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { DISPLAY, MONO } from "@/components/ui";
import { submitLead } from "@/lib/leads";
import { readAttribution } from "@/lib/attribution";
import { placementFor } from "@/lib/docks";

/**
 * Soft appointment scheduler: a shopper tells us which boat they intend to
 * visit, and we pass that to the dealer.
 *
 * Deliberately NOT an appointment system. No exact times are offered, only a
 * show day and a part of the day, because dealers work the dock rather than a
 * calendar. Nothing here promises a callback, an email, or a held boat.
 *
 * Pricing is never requested, shown, or promised. Show pricing is given at the
 * dock and that is the only thing the copy may say about it.
 *
 * Takes the boat and dealer as props so the shopper never re-picks what they
 * were already looking at. Usable from the boat page, inventory cards, or any
 * future module.
 */

const FONT = "var(--font-poppins), sans-serif";

/** Show days, from lib/show.ts so they roll over with the rest of the show.
 *  Re-exported because several modules already import it from this file. */
import { SHOW_DAYS } from "@/lib/show";
export { SHOW_DAYS };

const DAYPARTS = ["Morning", "Afternoon", "Not sure yet"];

export type WalkthroughBoat = {
  slug: string;
  brand: string;
  model: string;
  year: number | null;
};

export type WalkthroughDealer = { name: string };

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

const field: React.CSSProperties = {
  width: "100%",
  background: "#fff",
  border: "1px solid rgba(20,46,81,.18)",
  borderRadius: 9,
  padding: "11px 13px",
  fontSize: 15,
  color: "var(--navy)",
  fontFamily: "inherit",
};

/**
 * The show day that is happening today, or null outside the show. Compared as
 * a local YYYY-MM-DD string so a visitor in Atlantic City sees their own date,
 * not UTC's.
 */
function todayShowDay(): string | null {
  const now = new Date();
  const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return SHOW_DAYS.some((d) => d.value === local) ? local : null;
}

export function DocksideWalkthrough({
  boat,
  dealer,
  source,
  variant = "primary",
}: {
  boat: WalkthroughBoat;
  dealer: WalkthroughDealer;
  /** Where the CTA was clicked from, for funnel reporting. */
  source: string;
  variant?: "primary" | "compact";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstField = useRef<HTMLInputElement>(null);

  // Today, if today is one of the show days. During the show almost everyone
  // opening this is already on site or coming the same day, so the form opens
  // on today rather than on "Choose a day".
  const today = todayShowDay();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    day: today ?? "",
    daypart: "Not sure yet",
  });

  // Abandonment: opened, touched a field, then left without submitting.
  const submitted = useRef(false);
  useEffect(() => {
    if (!open) return;
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function openScheduler() {
    track("dockside_cta_clicked", { boat: boat.slug, dealer: dealer.name, source });
    setOpen(true);
    track("dockside_scheduler_opened", { boat: boat.slug, dealer: dealer.name, source });
  }

  function close() {
    if (!submitted.current && started) {
      track("dockside_scheduler_abandoned", { boat: boat.slug, dealer: dealer.name, source });
    }
    setOpen(false);
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!started) {
      setStarted(true);
      track("dockside_scheduler_started", { boat: boat.slug, dealer: dealer.name, source });
    }
    setForm((s) => ({ ...s, [k]: e.target.value }));
    if (err) setErr("");
  };

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim()) return setErr("Enter your first name.");
    if (form.phone.replace(/\D/g, "").length < 10) return setErr("Enter a mobile number we can reach you on.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return setErr("Enter a valid email address.");
    if (!form.day) return setErr("Pick the day you plan to attend.");

    setBusy(true);
    const placement = placementFor(dealer.name);
    const { ok } = await submitLead({
      type: "dockside-walkthrough",
      ...form,
      // Consent by continuing; the sentence above the button says so.
      marketingOptIn: true,
      // Boat and dealer travel with the lead so appointments can be reported
      // per boat and per dealer later. Stock number, HIN, and dealer ID are
      // deliberately absent: show boats carry none of them.
      boatId: boat.slug,
      year: boat.year,
      make: boat.brand,
      model: boat.model,
      dealerName: dealer.name,
      showLocation: placement ? `${placement.dock} ${placement.where}`.trim() : null,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      source,
      submittedAt: new Date().toISOString(),
      ...readAttribution(),
    });
    setBusy(false);

    if (!ok) return setErr("Something went wrong. Try again in a moment.");
    submitted.current = true;
    track("dockside_scheduler_submitted", {
      boat: boat.slug,
      dealer: dealer.name,
      day: form.day,
      daypart: form.daypart,
      source,
    });
    // Only non-personal values travel in the URL.
    router.push(`/walkthrough/confirmed?boat=${encodeURIComponent(boat.slug)}&day=${encodeURIComponent(form.day)}&part=${encodeURIComponent(form.daypart)}`);
  }

  const btnStyle: React.CSSProperties =
    variant === "compact"
      ? { fontSize: 11.5, padding: "10px 14px" }
      : { fontSize: 12, padding: "13px 18px", width: "100%", justifyContent: "center" };

  return (
    <>
      <button
        onClick={openScheduler}
        className="h-brighten"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: "var(--navy)",
          color: "#fff",
          fontWeight: 700,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          ...btnStyle,
        }}
      >
        Plan a dockside walkthrough <span aria-hidden>&rarr;</span>
      </button>

      {/* Portaled to <body>: ancestors like .card-lift carry hover transforms,
          and a transformed ancestor turns position:fixed into a caged
          absolute — which trapped this dialog inside inventory cards. */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
          style={{ position: "fixed", inset: 0, zIndex: 220, background: "rgba(20,46,81,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dw-title"
            style={{ background: "#fff", borderRadius: 16, width: "min(100%, 460px)", maxHeight: "calc(100dvh - 32px)", overflowY: "auto", padding: "22px 22px 24px", boxShadow: "0 30px 70px -30px rgba(20,46,81,.6)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(20,46,81,.55)" }}>
                  {dealer.name}
                </div>
                <h2 id="dw-title" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 21, lineHeight: 1.15, color: "var(--navy)", margin: "6px 0 0" }}>
                  {today ? "Meet them at the boat" : "Plan a dockside walkthrough"}
                </h2>
                <p style={{ fontSize: 13.5, color: "rgba(20,46,81,.72)", margin: "8px 0 0", lineHeight: 1.5 }}>
                  {today
                    ? `${dealer.name} gets your name and the boat, and will look for you at ${placementFor(dealer.name)?.dock ?? "their display"}. No appointment time needed.`
                    : `Let ${dealer.name} know you are coming to see the ${[boat.year, boat.brand, boat.model].filter(Boolean).join(" ")}.`}
                </p>
              </div>
              <button onClick={close} aria-label="Close" style={{ background: "none", border: "none", fontSize: 24, lineHeight: 1, color: "rgba(20,46,81,.5)", cursor: "pointer", padding: 0 }}>&times;</button>
            </div>

            <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={label} htmlFor="dw-first">First name</label>
                  <input id="dw-first" ref={firstField} style={field} value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
                </div>
                <div>
                  <label style={label} htmlFor="dw-last">Last name <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                  <input id="dw-last" style={field} value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
                </div>
              </div>

              <div>
                <label style={label} htmlFor="dw-phone">Mobile <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(so they can find you at the dock)</span></label>
                <input id="dw-phone" type="tel" style={field} value={form.phone} onChange={set("phone")} autoComplete="tel" />
              </div>

              <div>
                <label style={label} htmlFor="dw-email">Email</label>
                <input id="dw-email" type="email" style={field} value={form.email} onChange={set("email")} autoComplete="email" />
              </div>

              <div>
                <label style={label} htmlFor="dw-day">{today ? "Which day" : "Day you plan to attend"}</label>
                <select id="dw-day" style={{ ...field, appearance: "none", WebkitAppearance: "none" }} value={form.day} onChange={set("day")}>
                  {!today && <option value="">Choose a day</option>}
                  {SHOW_DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              <div>
                <span style={label}>Time of day</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {DAYPARTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => set("daypart")({ target: { value: p } } as React.ChangeEvent<HTMLInputElement>)}
                      style={{
                        flex: "1 1 auto",
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: 600,
                        padding: "10px 12px",
                        borderRadius: 9,
                        cursor: "pointer",
                        background: form.daypart === p ? "var(--navy)" : "var(--bluetint)",
                        color: form.daypart === p ? "#fff" : "var(--navy)",
                        border: form.daypart === p ? "1px solid var(--navy)" : "1px solid rgba(20,46,81,.18)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <p style={{ fontSize: 12.5, color: "rgba(20,46,81,.72)", lineHeight: 1.5, margin: 0 }}>
                By requesting a walkthrough you agree that this dealer may contact you about this boat, by phone
                or email. The Atlantic City In-Water Boat Show and Buoy, the boating app behind this site, keep
                only your name and email, never your phone number, and may email you about this show, future
                shows, and Buoy. We never sell your details. Unsubscribe any time with one click. <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--linkblue)", fontWeight: 600 }}>Privacy</a>
              </p>

              {err && <div style={{ fontSize: 13, color: "#b3261e" }}>{err}</div>}

              <button
                type="submit"
                disabled={busy}
                className="h-brighten"
                style={{ background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", padding: "13px 18px", borderRadius: 8, border: "none", cursor: busy ? "default" : "pointer", fontFamily: "inherit", marginTop: 2 }}
              >
                {busy ? "Sending…" : "Tell the dealer I'm coming"}
              </button>

              <p style={{ fontFamily: FONT, fontSize: 11.5, color: "rgba(20,46,81,.55)", margin: 0, lineHeight: 1.5 }}>
                No exact appointment time is needed. Special show pricing is available directly from the dealer at the dock.
              </p>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
