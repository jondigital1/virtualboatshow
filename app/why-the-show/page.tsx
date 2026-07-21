"use client";

import Link from "next/link";
import { useState } from "react";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, MONO, fmt, Eyebrow } from "@/components/ui";
import { useIframeModal } from "@/components/IframeModal";
import { SHOW_STATS } from "@/lib/inventory";

const PAD = "clamp(64px,8vw,112px) clamp(18px,5vw,56px)";
const avg = "$" + fmt(SHOW_STATS.avgSave);
const max = "$" + fmt(SHOW_STATS.maxSave);

const MECHANICS: [string, string, string][] = [
  ["01", "Dealers compete in the open", "Twenty dealers, one marina, their best boats ten feet apart. When a buyer can walk to the next slip in seconds, the price has to move to keep you."],
  ["02", "Show-only pricing kicks in", "Builders release national boat-show pricing and rebates that only surface during show season. It’s the one window where the factory helps the dealer sharpen the deal."],
  ["03", "The clock is on your side", "Current-model and end-of-season units have to move before winter storage and floorplan interest eat the margin. At the show, a dealer would rather deal than dry-store."],
  ["04", "Your trade gets bid up", "Every dealer at the show wants your current boat as inventory. Instead of one lowball offer, your trade gets shopped to the whole marina at once."],
];

const CULTURE: [string, string][] = [
  ["Boats in the water, not on blocks.", "Sea trials happen on site, so you feel the hull before you sign."],
  ["Every regional dealer, one sky.", "Four days a year the whole fleet is docked in one place for you to compare."],
  ["The whole crew turns out.", "First-timers and lifelong owners walk the same planks, trading advice."],
];

const STEPS: [string, string][] = [
  ["Reserve your ticket", "One click unlocks live pricing two days before the gates open. You arrive already knowing the boats."],
  ["Walk every deck in an afternoon", "Twenty dealers line one marina. Compare hulls side by side, no driving between lots required."],
  ["Lock in show pricing", "The number on the tag is the show floor. No haggling, no waiting for a manager to “check.”"],
  ["Trade & finance on the spot", "Bid up your current boat and sign lender-ready terms right at the slip."],
  ["Sea trial & take the keys", "Run it on the bay, then leave as an owner. That’s the whole weekend."],
];

const COMPARE: [string, string, string][] = [
  ["Pricing", "Published show-floor pricing, no haggle", "List price, then negotiate"],
  ["Selection", "20 dealers docked side by side", "One brand, one showroom"],
  ["Your time", "Every deck in a single afternoon", "Weeks of driving lot to lot"],
  ["Your trade", "Bid on by the whole marina", "One take-it-or-leave-it offer"],
  ["Sea trial", "On the bay, right there", "Scheduled for another day"],
  ["Rebates", "Show-season factory rebates stack", "Rarely on the table"],
];

const MYTHS: [string, string][] = [
  ["“I’ll get a better price if I just wait a few months.”", "Show pricing is the floor, not the starting point. When the docks clear, prices reset to list and the factory rebates disappear until next season."],
  ["“A boat show is just for looking around.”", "You can walk aboard, sea trial, trade in, finance, and close in a single visit. Plenty of boaters arrive to browse and leave as owners."],
  ["“It’ll be too crowded to find the right boat.”", "Browse the full live inventory before you arrive and build a shortlist. You walk in knowing exactly which slips to hit first."],
];

const FAQS: [string, string][] = [
  ["Are boat show prices really cheaper?", "Yes, and it is not a marketing line. Dealers arrive with show-only factory pricing and rebates, they are competing ten feet from each other, and they would rather deal than dry-store a boat for winter. All three forces push the number down at once, which is why the tag at the show is almost always the lowest you will see all year."],
  ["Can I actually buy a boat at the show, or is it just browsing?", "You can do the whole thing on site: walk aboard, sea trial on the bay, appraise your trade, sign lender-ready financing, and drive home an owner. Plenty of boaters show up planning to look and leave with a hull. Nothing about the show is browse-only."],
  ["Will I get a better deal if I just wait a few months?", "Show pricing is the floor, not the opening bid. Once the docks clear, prices reset to list and the show-season rebates disappear until next year. Waiting almost always costs more, not less."],
  ["Do I have to haggle?", "No. Show-floor pricing is published up front, so you see the real number the moment you walk up. There is no back-and-forth with a manager and no pressure to negotiate your way to a fair price."],
  ["What if I have a boat to trade in?", "Bring it into the conversation early. Because every dealer at the show wants inventory, your trade gets shopped to the whole marina instead of one lowball desk. You can value it on this site before you arrive so you know what it is worth."],
  ["Is financing available on site?", "Yes. Lenders are at the show and terms are handled right at the slip, so you can go from picking a boat to signing without leaving the docks. Getting pre-qualified beforehand just makes the day faster."],
  ["Will it be too crowded to find the right boat?", "Do your homework first. Browse the full live inventory on this site, build a shortlist, and note which slips to hit. You walk in knowing exactly where to go, so the crowd works for you instead of against you."],
];

export default function WhyTheShow() {
  const { open: openTickets } = useIframeModal();
  const [faqOpen, setFaqOpen] = useState(0);

  return (
    <>
      <AnnouncementBar />
      <Nav active="/why-the-show" />

      {/* HERO */}
      <section style={{ position: "relative", background: "#0A2138", color: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-25%", right: "-8%", width: "62%", height: "150%", background: "radial-gradient(circle at 68% 34%, rgba(242,106,62,.15), transparent 60%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1000, margin: "0 auto", padding: "clamp(52px,7vw,104px) clamp(18px,5vw,56px)", textAlign: "center" }}>
          <Eyebrow>Field Guide · The Research</Eyebrow>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(38px,6vw,78px)", lineHeight: 0.98, letterSpacing: "-.03em", margin: "18px auto 0", maxWidth: "16ch" }}>The best boat deal of the year lasts four days.</h1>
          <p style={{ fontSize: "clamp(16px,1.3vw,20px)", lineHeight: 1.6, color: "rgba(255,255,255,.82)", margin: "24px auto 0", maxWidth: "60ch" }}>Ask anyone who owns a boat and they’ll tell you the same thing: you buy at the show. It’s not a rumor, it’s how the industry works. Here’s the research on why the docks beat the showroom, and how easy it is to walk away with the keys.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 13, marginTop: 32, justifyContent: "center" }}>
            <button onClick={() => openTickets()} className="h-lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 16, padding: "16px 26px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Get Boat Show Tickets →</button>
            <Link href="#mechanics" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.07)", color: "#fff", fontWeight: 600, fontSize: 16, padding: "16px 26px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,.32)" }}>See why it’s cheaper</Link>
          </div>
        </div>
      </section>

      {/* HEADLINE NUMBER */}
      <section style={{ background: "#F4F1EA", padding: PAD }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>The headline number</Eyebrow>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(72px,15vw,180px)", lineHeight: 0.9, letterSpacing: "-.04em", color: "var(--accent)", margin: "18px 0 0" }}>{avg}</div>
          <p style={{ fontSize: "clamp(16px,1.3vw,20px)", lineHeight: 1.6, color: "#4c6270", margin: "20px auto 0", maxWidth: "52ch" }}>Average knocked off MSRP across the boats headed to this year’s docks. The biggest single save on the current list is <strong style={{ color: "#0A2138" }}>{max}</strong>.</p>
          <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".08em", color: "#8595a0", marginTop: 18, textTransform: "uppercase" }}>Priced from live show inventory on this site</div>
        </div>
      </section>

      {/* STATS ROW */}
      <section style={{ background: "#0A2138", color: "#fff", padding: PAD }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>The numbers behind the steal</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 24, marginTop: 34 }}>
            {[
              [String(SHOW_STATS.dealers), "Dealers competing head-to-head on one marina."],
              [avg, "Average off MSRP across live show inventory."],
              [String(SHOW_STATS.days), "Days the show-floor pricing actually lives."],
              [max, "Biggest single save on this year’s dock list."],
            ].map(([n, label]) => (
              <div key={label} style={{ borderTop: "2px solid rgba(255,255,255,.14)", paddingTop: 18 }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(40px,5vw,64px)", lineHeight: 1, color: "var(--accent)", letterSpacing: "-.02em" }}>{n}</div>
                <div style={{ fontSize: 15, lineHeight: 1.5, color: "rgba(255,255,255,.72)", marginTop: 12, maxWidth: "22ch" }}>{label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: MONO, fontSize: 11.5, lineHeight: 1.6, color: "rgba(255,255,255,.45)", margin: "34px 0 0", maxWidth: "80ch" }}>Figures reflect live show inventory listed on this site. Actual savings vary by hull, model year, and dealer. The point holds: the number is never lower than it is at the show.</p>
        </div>
      </section>

      {/* MECHANICS */}
      <section id="mechanics" style={{ background: "#F4F1EA", padding: PAD, scrollMarginTop: 70 }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>The mechanics</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0", maxWidth: "20ch" }}>Why the show is genuinely cheaper.</h2>
          <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "#4c6270", margin: "20px 0 0", maxWidth: "62ch" }}>It isn’t a gimmick or a sale banner. Four real forces line up for one weekend a year, and every one of them pushes the price in your favor.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,270px),1fr))", gap: 18, marginTop: 44 }}>
            {MECHANICS.map(([n, h, body]) => (
              <div key={n} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 20, padding: "30px 26px" }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: "var(--accent)", lineHeight: 1 }}>{n}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 21, margin: "16px 0 10px", letterSpacing: "-.01em" }}>{h}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.58, color: "#5a6c78", margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CULTURE */}
      <section style={{ background: "#E9EEEE", padding: PAD }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>The culture</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0", maxWidth: "18ch" }}>This is where boaters actually buy.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: "clamp(24px,4vw,56px)", marginTop: 24, alignItems: "start" }}>
            <div>
              <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.65, color: "#4c6270", margin: 0 }}>A boat show isn’t a lot with balloons. It’s the one weekend a year the whole community shows up on the same docks: captains comparing notes, families climbing aboard their first cabin, dealers with their flagships in the water instead of up on blocks.</p>
              <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.65, color: "#4c6270", margin: "16px 0 0" }}>You can step onto a boat, run it on the bay, and stand next to the person who’ll service it, all before lunch. That energy is exactly why the deals live here. Nobody wants to be the one who walked the docks and went home empty-handed.</p>
              <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", color: "var(--accent)", marginTop: 22, textTransform: "uppercase" }}>Farley State Marina · Atlantic City</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {CULTURE.map(([h, body]) => (
                <div key={h} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 16, padding: "20px 22px" }}>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, margin: 0, letterSpacing: "-.01em" }}>{h}</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#5a6c78", margin: "6px 0 0" }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EASY PART, ticket to title */}
      <section style={{ background: "#F4F1EA", padding: PAD }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Eyebrow>The easy part</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 0", maxWidth: "16ch" }}>From ticket to title in one weekend.</h2>
          <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "#4c6270", margin: "20px 0 40px", maxWidth: "56ch" }}>What normally takes six weekends of driving from showroom to showroom collapses into a single walk down the docks. Here’s the whole path.</p>
          <div>
            {STEPS.map(([h, body], i) => (
              <div key={h}>
                <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                  <div style={{ flex: "0 0 auto", width: 44, height: 44, borderRadius: "50%", background: "#0A2138", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 18 }}>{i + 1}</div>
                  <div style={{ paddingTop: 2 }}>
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, margin: 0, letterSpacing: "-.01em" }}>{h}</h3>
                    <p style={{ fontSize: 15.5, lineHeight: 1.55, color: "#5a6c78", margin: "6px 0 0" }}>{body}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && <div style={{ marginLeft: 21, height: 26, borderLeft: "2px dashed rgba(11,34,56,.2)" }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HEAD TO HEAD */}
      <section style={{ background: "#0A2138", color: "#fff", padding: PAD }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Eyebrow>Head to head</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,50px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 34px", color: "#fff" }}>The show vs. any other day.</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "rgba(255,255,255,.5)", textTransform: "uppercase", padding: "0 12px 14px 0", fontWeight: 400 }}>What you get</th>
                  <th style={{ textAlign: "left", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "var(--accent)", textTransform: "uppercase", padding: "0 12px 14px", fontWeight: 700 }}>At the show</th>
                  <th style={{ textAlign: "left", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: "rgba(255,255,255,.5)", textTransform: "uppercase", padding: "0 0 14px 12px", fontWeight: 400 }}>Ordinary showroom</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([label, show, other]) => (
                  <tr key={label} style={{ borderTop: "1px solid rgba(255,255,255,.12)" }}>
                    <td style={{ padding: "16px 12px 16px 0", fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, verticalAlign: "top", whiteSpace: "nowrap" }}>{label}</td>
                    <td style={{ padding: "16px 12px", fontSize: 14.5, lineHeight: 1.5, verticalAlign: "top" }}>
                      <span style={{ color: "var(--accent)", marginRight: 7 }}>✓</span>{show}
                    </td>
                    <td style={{ padding: "16px 0 16px 12px", fontSize: 14.5, lineHeight: 1.5, color: "rgba(255,255,255,.6)", verticalAlign: "top" }}>{other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* MYTHS */}
      <section style={{ background: "#F4F1EA", padding: PAD }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Eyebrow>Setting the record straight</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.03, letterSpacing: "-.02em", margin: "14px 0 40px", maxWidth: "18ch" }}>What people get wrong.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 18 }}>
            {MYTHS.map(([myth, reality]) => (
              <div key={myth} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 20, padding: "28px 26px" }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", color: "#c0392b", textTransform: "uppercase" }}>The myth</div>
                <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, lineHeight: 1.3, letterSpacing: "-.01em", margin: "10px 0 20px", color: "#0A2138" }}>{myth}</p>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", color: "#178a5a", textTransform: "uppercase" }}>The reality</div>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "#5a6c78", margin: "10px 0 0" }}>{reality}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#E9EEEE", padding: PAD }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Eyebrow>Still deciding?</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.04, letterSpacing: "-.02em", margin: "14px 0 0" }}>Why shop the show, answered.</h2>
          <p style={{ fontSize: 16, color: "#4c6270", margin: "14px 0 36px", maxWidth: "56ch" }}>The honest questions boaters ask before they commit a weekend to the docks.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map(([q, a], i) => {
              const isOpen = faqOpen === i;
              return (
                <div key={q} style={{ background: "#fff", border: "1px solid rgba(11,34,56,.1)", borderRadius: 16, overflow: "hidden" }}>
                  <button onClick={() => setFaqOpen(isOpen ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "20px clamp(18px,2vw,26px)" }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(16px,1.5vw,19px)", color: "#0A2138", letterSpacing: "-.01em" }}>{q}</span>
                    <span style={{ flex: "0 0 auto", width: 27, height: 27, borderRadius: "50%", background: isOpen ? "var(--accent)" : "rgba(11,34,56,.06)", color: isOpen ? "#0A2138" : "#4c6270", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, lineHeight: 1, transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform .25s, background .2s" }}>+</span>
                  </button>
                  <div style={{ maxHeight: isOpen ? 400 : 0, overflow: "hidden", transition: "max-height .32s ease" }}>
                    <p style={{ margin: 0, padding: "0 clamp(18px,2vw,26px) 22px", fontSize: 15.5, lineHeight: 1.62, color: "#4c6270" }}>{a}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 34 }}>
            <button onClick={() => openTickets()} className="link-ink" style={{ fontWeight: 700, fontSize: 15, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Ready to walk the docks? Get your Boat Show tickets →</button>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: "#050F1A", color: "#fff", padding: "clamp(74px,10vw,132px) clamp(18px,5vw,56px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,106,62,.16), transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <Eyebrow>Four days. Once a year.</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(32px,5vw,64px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: "16px 0 0", color: "#fff" }}>Don’t be the one who waited.</h2>
          <p style={{ fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6, color: "rgba(255,255,255,.75)", margin: "20px auto 32px", maxWidth: "52ch" }}>The steal of the year is on the docks September 10-13. Reserve your ticket, unlock live pricing early, and walk in ready to close.</p>
          <div style={{ display: "flex", gap: 13, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => openTickets()} className="h-lift" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 16, padding: "16px 28px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Get Boat Show Tickets →</button>
            <Link href="/inventory" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.07)", color: "#fff", fontWeight: 600, fontSize: 16, padding: "16px 28px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,.32)" }}>Browse the inventory first</Link>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".08em", color: "rgba(255,255,255,.45)", marginTop: 28, textTransform: "uppercase" }}>Golden Nugget Casino Hotel · Farley State Marina, Atlantic City</div>
        </div>
      </section>

      <Footer />
    </>
  );
}
