"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, MONO, Eyebrow } from "@/components/ui";
import { useIframeModal } from "@/components/IframeModal";
import { boatBySlug, boatTitle } from "@/lib/showboats";
import { placementFor } from "@/lib/docks";
import { SHOW_DAYS } from "@/components/DocksideWalkthrough";

const FONT = "var(--font-poppins), sans-serif";

/**
 * Dockside walkthrough confirmation.
 *
 * Reads the boat, day, and daypart from the query string; no personal details
 * are ever put in the URL. Deliberately makes no promise that the dealer will
 * call, email, or hold the boat, and never mentions a price beyond pointing at
 * the dock.
 */
function Confirmed() {
  const params = useSearchParams();
  const slug = params.get("boat") ?? "";
  const day = params.get("day") ?? "";
  const part = params.get("part") ?? "";
  const { open: openTickets } = useIframeModal();

  const boat = slug ? boatBySlug(slug) : undefined;
  const dealer = boat?.dealers[0];
  const placement = dealer ? placementFor(dealer.name) : undefined;
  const dayLabel = SHOW_DAYS.find((d) => d.value === day)?.label ?? "";

  useEffect(() => {
    track("dockside_confirmation_viewed", { boat: slug, dealer: dealer?.name ?? "", day });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const partLine =
    part === "Morning" ? "the morning" : part === "Afternoon" ? "the afternoon" : "the day";

  return (
    <section style={{ background: "#fff", padding: "clamp(28px,4vw,56px) clamp(18px,3vw,44px) clamp(48px,6vw,76px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Eyebrow>Dockside walkthrough</Eyebrow>
        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4vw,46px)", lineHeight: 1.05, letterSpacing: "-.018em", margin: "12px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>
          You&rsquo;re on the list
        </h1>
        <p style={{ fontSize: 16.5, color: "rgba(20,46,81,.75)", margin: "14px 0 0", lineHeight: 1.6 }}>
          Your dockside walkthrough has been requested.
        </p>

        <div style={{ background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.45)", borderRadius: 16, padding: "20px 22px", marginTop: 26 }}>
          {boat ? (
            <>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: "var(--navy)", lineHeight: 1.2 }}>{boatTitle(boat)}</div>
              {dealer && <div style={{ fontSize: 15, color: "rgba(20,46,81,.75)", marginTop: 6 }}>{dealer.name}</div>}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
                {placement && (
                  <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", background: "#fff", border: "1px solid rgba(117,186,228,.5)", color: "var(--linkblue)", borderRadius: 999, padding: "7px 13px" }}>
                    {placement.dock === "Land" ? placement.where : `${placement.dock} · ${placement.where}`}
                  </span>
                )}
                {dayLabel && (
                  <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", background: "#fff", border: "1px solid rgba(117,186,228,.5)", color: "var(--linkblue)", borderRadius: 999, padding: "7px 13px" }}>
                    {dayLabel}{part && part !== "Not sure yet" ? ` · ${part}` : ""}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 15, color: "rgba(20,46,81,.75)" }}>Your request has been sent to the dealer.</div>
          )}
        </div>

        <p style={{ fontSize: 15.5, color: "rgba(20,46,81,.78)", margin: "22px 0 0", lineHeight: 1.65 }}>
          No exact appointment time is required. Visit the dealer any time during {partLine} on your selected show day.
        </p>
        <p style={{ fontSize: 15.5, color: "var(--navy)", fontWeight: 600, margin: "12px 0 0", lineHeight: 1.65 }}>
          Special show pricing is available directly from the dealer at the dock.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 26 }}>
          <Link href="/map" className="h-brighten" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", padding: "14px 20px", borderRadius: 8 }}>
            View show map <span aria-hidden>&rarr;</span>
          </Link>
          <button onClick={() => openTickets()} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", color: "var(--navy)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", padding: "14px 20px", borderRadius: 8, border: "1.5px solid rgba(20,46,81,.25)", cursor: "pointer", fontFamily: "inherit" }}>
            Get tickets <span aria-hidden>&rarr;</span>
          </button>
        </div>

        <div style={{ borderTop: "1px solid rgba(20,46,81,.12)", marginTop: 34, paddingTop: 22 }}>
          <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(20,46,81,.55)" }}>Planning your visit</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 18, marginTop: 14 }}>
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>Where</div>
              <div style={{ fontSize: 14, color: "rgba(20,46,81,.7)", marginTop: 4, lineHeight: 1.55 }}>
                Farley State Marina<br />600 Huron Ave, Atlantic City, NJ
              </div>
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>When</div>
              <div style={{ fontSize: 14, color: "rgba(20,46,81,.7)", marginTop: 4, lineHeight: 1.55 }}>
                September 10&ndash;13, 2026
              </div>
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>Getting there</div>
              <Link href="/plan" style={{ display: "inline-block", fontSize: 14, color: "var(--linkblue)", fontWeight: 600, marginTop: 4 }}>
                Directions, parking and stays <span aria-hidden>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {boat && (
          <Link href={`/boats/${boat.slug}`} style={{ display: "inline-block", marginTop: 28, fontFamily: FONT, fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--linkblue)" }}>
            <span aria-hidden>&larr;</span> Back to the boat
          </Link>
        )}
      </div>
    </section>
  );
}

export default function WalkthroughConfirmed() {
  return (
    <>
      <AnnouncementBar />
      <Nav active="/inventory" />
      <Suspense fallback={<div style={{ minHeight: 420 }} />}>
        <Confirmed />
      </Suspense>
      <Footer />
    </>
  );
}
