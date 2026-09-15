"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { submitLead } from "@/lib/leads";
import { readAttribution } from "@/lib/attribution";
import { showDays } from "@/lib/faq";
import { YEAR } from "@/lib/show";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const NEXT = YEAR + 1;
const DISMISS_KEY = `vbs-updates-banner-${NEXT}`;

/**
 * The small sign-up banner on the open lineup (Jon, 2026-09-15). It replaced
 * the inventory gate. Google's guidance on pop-ups names small banners, not
 * full-screen dialogs, as the way to ask for a sign-up, and the gate kept the
 * boats out of the page Google indexes. So this sits in the page flow above the
 * boats, never over them, starts collapsed and can be dismissed.
 *
 * The dates follow the show's rule (Thursday to Sunday after Labor Day, see
 * showDays in lib/faq.ts). No venue is named: nothing sources one for next year.
 *
 * Stored as lead type "next-show-alert". No email is sent on submit.
 */
export function NotifyBanner({ source }: { source: string }) {
  const days = showDays(NEXT);
  const [hidden, setHidden] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [first, setFirst] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const doneRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    try { if (localStorage.getItem(DISMISS_KEY)) setHidden(true); } catch { /* private mode */ }
  }, []);

  // The form is replaced by the thank-you line; move focus there so it is read
  // out and keyboard focus is not lost.
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  if (hidden) return null;

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, "dismissed"); } catch { /* private mode */ }
    track("updates_banner_dismissed", { source });
    setHidden(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!EMAIL_RE.test(email.trim())) return setErr("Enter a valid email address.");
    setErr("");
    setBusy(true);
    const { ok } = await submitLead({
      type: "next-show-alert",
      firstName: first.trim(),
      email: email.trim(),
      // Consent by continuing; the line under the button says so.
      marketingOptIn: true,
      website: hp,
      source,
      pageUrl: window.location.href,
      referrer: document.referrer,
      submittedAt: new Date().toISOString(),
      ...readAttribution(),
    });
    setBusy(false);
    if (!ok) return setErr("That didn't go through. Try again in a moment.");
    try { localStorage.setItem(DISMISS_KEY, "signed-up"); } catch { /* private mode */ }
    track("next_show_alert_submitted", { source });
    setDone(true);
  }

  const input: React.CSSProperties = { flex: "1 1 160px", minWidth: 0, padding: "10px 12px", fontSize: 16, fontFamily: "inherit", color: "var(--navy)", background: "#fff", border: "1px solid rgba(255,255,255,.4)", borderRadius: 8 };

  return (
    <aside
      aria-label={`Updates about the ${NEXT} show`}
      style={{ position: "relative", marginTop: 16, background: "var(--navy)", color: "#fff", borderRadius: 12, padding: "12px 48px 12px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 16px" }}
    >
      {done ? (
        <p ref={doneRef} tabIndex={-1} role="status" style={{ margin: 0, fontSize: 14.5, fontWeight: 600, outline: "none" }}>
          You&rsquo;re on the list. We&rsquo;ll email you about the {NEXT} show.
        </p>
      ) : (
        <>
          <div style={{ flex: "1 1 260px", minWidth: 0, lineHeight: 1.4 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>Get updates about the {NEXT} show</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)" }}>
              September {days.start} to {days.end}, {NEXT}
            </div>
          </div>
          {!expanded ? (
            <button
              type="button"
              onClick={() => { setExpanded(true); track("updates_banner_opened", { source }); }}
              className="h-brighten"
              style={{ background: "var(--gold)", color: "var(--navy)", fontWeight: 700, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
            >
              Get Updates
            </button>
          ) : (
            <form onSubmit={submit} noValidate style={{ flex: "1 1 100%", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <input type="text" name="website" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
              {/* autoFocus is safe here: the form mounts only after a tap on Get Updates. */}
              <input aria-label="First name (optional)" placeholder="First name (optional)" value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" autoFocus style={input} />
              <input aria-label="Email" type="email" inputMode="email" autoCapitalize="none" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} autoComplete="email" style={input} />
              <button
                type="submit"
                disabled={busy}
                className="h-brighten"
                style={{ background: "var(--gold)", color: "var(--navy)", fontWeight: 700, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", padding: "11px 16px", borderRadius: 8, border: "none", cursor: busy ? "default" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap", opacity: busy ? 0.75 : 1 }}
              >
                {busy ? "Signing up…" : "Sign Up"}
              </button>
              {err && <div role="alert" style={{ flex: "1 1 100%", fontSize: 13, fontWeight: 600, color: "#ffd8d3" }}>{err}</div>}
              <p style={{ flex: "1 1 100%", margin: 0, fontSize: 11.5, lineHeight: 1.5, color: "rgba(255,255,255,.7)" }}>
                By signing up you agree that the Atlantic City In-Water Boat Show and Buoy, the boating app behind
                this site, may email you about this show, future shows, and Buoy. Unsubscribe any time with one click.{" "}
                <a href="/privacy" style={{ color: "#fff", fontWeight: 600 }}>Privacy policy</a>.
              </p>
            </form>
          )}
        </>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss updates banner"
        style={{ position: "absolute", top: 4, right: 4, width: 40, height: 40, borderRadius: "50%", border: "none", background: "transparent", color: "#fff", fontSize: 20, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        &times;
      </button>
    </aside>
  );
}
