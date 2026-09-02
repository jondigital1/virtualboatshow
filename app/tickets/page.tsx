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
 * Three things here exist for paid traffic specifically:
 *  - The advance price is stated at the top, in the same words the ad uses.
 *    A visitor who clicks an offer and cannot find it on the page wonders
 *    whether they clicked the right thing, and leaves.
 *  - The nav is bare. Every link in it is a way to leave before buying.
 *  - There is a photograph. The ad promised boats in the water, so the page
 *    should show them rather than opening with a form on a flat tint.
 */

import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY } from "@/components/ui";
import { TicketCaptureForm } from "@/components/TicketFunnel";
import { showBoats } from "@/lib/showboats";
import { DATES_LONG, YEAR, VENUE, CITY, TICKET_ADVANCE, TICKET_GATE, TICKET_ADVANCE_UNTIL } from "@/lib/show";

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
      <Nav bare />

      <section
        style={{
          position: "relative",
          backgroundImage:
            "linear-gradient(180deg, rgba(20,46,81,.60) 0%, rgba(20,46,81,.82) 45%, rgba(20,46,81,.95) 100%), url('/show/tickets-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "50% 60%",
          padding: "clamp(32px,5vw,64px) clamp(18px,3vw,44px) clamp(48px,6vw,80px)",
        }}
      >
        <div style={{ maxWidth: 540, margin: "0 auto", color: "#fff" }}>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,5vw,44px)", lineHeight: 1.06, letterSpacing: "-.015em", margin: 0, textWrap: "balance" }}>
            Grab your show tickets
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 15.5, lineHeight: 1.6, color: "rgba(255,255,255,.85)", margin: "12px 0 0" }}>
            {DATES_LONG}, {YEAR} at {VENUE}, {CITY}. {showBoats.length} boats confirmed and counting.
          </p>

          {/* The offer, in the same words the ad uses. */}
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", background: "var(--gold)", color: "var(--navy)", borderRadius: 12, padding: "12px 18px", margin: "20px 0 0" }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(19px,2.4vw,23px)", letterSpacing: "-.01em" }}>
              ${TICKET_ADVANCE} through {TICKET_ADVANCE_UNTIL}
            </span>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "rgba(20,46,81,.72)" }}>
              then ${TICKET_GATE}
            </span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "flex", flexDirection: "column", gap: 9 }}>
            {POINTS.map((p) => (
              <li key={p} style={{ fontFamily: FONT, fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,.85)", display: "flex", gap: 9 }}>
                <span aria-hidden style={{ color: "var(--gold)", fontWeight: 800, flex: "0 0 auto" }}>✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div style={{ background: "#fff", border: "1px solid rgba(20,46,81,.12)", borderRadius: 18, padding: "clamp(20px,4vw,28px)", marginTop: 24, boxShadow: "0 30px 70px -35px rgba(0,0,0,.6)" }}>
            <TicketCaptureForm source="tickets-page" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
