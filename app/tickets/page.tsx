"use client";

/**
 * Ad landing page: the capture form on its own URL, nothing else to click.
 *
 * Paid ticket-intent traffic lands here so the click goes straight to the
 * form instead of hunting a button on the gate page. Step two is unchanged
 * everywhere: the Interactive Ticketing checkout opens in the on-site iframe
 * modal after the form submits. Leads from here carry source "tickets-page"
 * so the two ad landings (/tickets vs /inventory) can be compared by submit
 * rate in both Vercel events and the leads table.
 *
 * Deliberately spare below the form: no boat links, no competing CTAs. The
 * nav is escape enough for someone who wants to browse first.
 */

import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, Eyebrow } from "@/components/ui";
import { TicketCaptureForm } from "@/components/TicketFunnel";
import { showBoats } from "@/lib/showboats";

const FONT = "var(--font-poppins), sans-serif";

const POINTS: string[] = [
  "250+ boats in the water, four days on the docks",
  "The full online boat lineup opens September 10 at 10 AM, and we email you the moment it does",
  "Special show pricing is available directly from the dealer at the dock",
];

export default function TicketsLanding() {
  // Counted as a funnel open so /tickets and the popup sheet compare cleanly:
  // opened-to-submitted rate means the same thing on both landings.
  useEffect(() => {
    track("ticket_funnel_opened", { source: "tickets-page" });
  }, []);

  return (
    <>
      <AnnouncementBar />
      <Nav />

      <section style={{ background: "var(--bluetint)", padding: "clamp(30px,5vw,64px) clamp(18px,3vw,44px) clamp(56px,7vw,90px)", minHeight: "62vh" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <Eyebrow>Atlantic City In-Water Boat Show</Eyebrow>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,5vw,42px)", lineHeight: 1.06, letterSpacing: "-.015em", color: "var(--navy)", margin: "10px 0 0", textWrap: "balance" }}>
            Grab your show tickets
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 15.5, lineHeight: 1.6, color: "rgba(20,46,81,.75)", margin: "12px 0 0" }}>
            September 10 to 13, 2026 at Farley State Marina. {showBoats.length} feature boats confirmed
            and counting.
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
            {POINTS.map((p) => (
              <li key={p} style={{ fontFamily: FONT, fontSize: 14, lineHeight: 1.55, color: "rgba(20,46,81,.75)", display: "flex", gap: 9 }}>
                <span aria-hidden style={{ color: "var(--gold)", fontWeight: 800, flex: "0 0 auto" }}>✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div style={{ background: "#fff", border: "1px solid rgba(20,46,81,.12)", borderRadius: 18, padding: "clamp(20px,4vw,28px)", marginTop: 22, boxShadow: "0 24px 60px -40px rgba(20,46,81,.55)" }}>
            <TicketCaptureForm source="tickets-page" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
