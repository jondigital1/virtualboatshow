"use client";

import { DISPLAY } from "@/components/ui";
import { DocksideWalkthrough, type WalkthroughBoat } from "@/components/DocksideWalkthrough";

/**
 * "Boat Show Price": a deliberately blurred figure with no number behind it.
 *
 * The bars are empty spans, not blurred text — there is no price in the DOM,
 * no title attribute, and nothing to reveal by inspecting, selecting, or
 * saving the page, because no number exists. We hold no price data for any
 * boat; the blur is the content, not a filter over content. Keep it that way:
 * putting a real or placeholder figure in here would turn an honest teaser
 * into something that reads as a trick.
 *
 * The "$" is real text so the block is legibly a price rather than a broken
 * image, and a visually-hidden line carries the same message to screen
 * readers, who would otherwise get a lone dollar sign and silence.
 */
const BARS = [
  { w: 17, h: 40 },
  { w: 16, h: 37 },
  null,
  { w: 17, h: 39 },
  { w: 16, h: 36 },
  { w: 17, h: 38 },
];

function BlurredFigure() {
  return (
    <>
      <div aria-hidden style={{ display: "flex", alignItems: "flex-end", gap: 7, marginBottom: 4 }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 36, fontWeight: 800, lineHeight: 0.92, letterSpacing: "-.02em", color: "var(--navy)" }}>$</span>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 42, filter: "blur(8px)", pointerEvents: "none", userSelect: "none" }}>
          {BARS.map((b, i) =>
            b === null ? (
              <span key={i} style={{ width: 7 }} />
            ) : (
              <span key={i} style={{ display: "block", width: b.w, height: b.h, background: "rgba(20,46,81,.82)", borderRadius: 3 }} />
            )
          )}
        </div>
      </div>
      <span className="sr-only">Price available at the show.</span>
    </>
  );
}

export function BoatShowPrice({ boat, dealer }: { boat: WalkthroughBoat; dealer: string }) {
  return (
    <div style={{ background: "#FFFCF3", border: "1px solid rgba(253,183,23,.55)", borderRadius: 14, padding: 18 }}>
      <BlurredFigure />

      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 15, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--navy)", marginTop: 10 }}>
        Boat Show Price
      </div>
      <span aria-hidden style={{ display: "block", width: 44, height: 3, borderRadius: 2, background: "var(--gold)", margin: "9px 0 10px" }} />

      <p style={{ fontSize: 13.5, color: "rgba(20,46,81,.72)", margin: "0 0 14px", lineHeight: 1.55 }}>
        Special show pricing is available directly from the dealer at the dock.
      </p>

      <DocksideWalkthrough boat={boat} dealer={{ name: dealer }} source="vdp-price-block" />
    </div>
  );
}
