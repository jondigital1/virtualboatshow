/**
 * The Boat Show Price, blurred. The ONLY price shown online is the struck MSRP
 * (rendered by the caller, above this). The deal itself is never legible on the
 * web: it is reserved for the docks, and the blur is the hook that drives the
 * appointment. You can see there is a number; you book to read it.
 *
 * This is a casual deterrent by design, like the rest of this site. The real
 * figure is still in the client (the marketplace API returns it), so the blur is
 * visual, not cryptographic. For this audience and this purpose, that is the
 * right level.
 */
const DISPLAY = "var(--font-bricolage), sans-serif";
const MONO = "var(--font-space-mono), monospace";

export function BlurredPrice({ value, large = false }: { value: string; large?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: large ? 11 : 9.5, letterSpacing: ".1em", color: "var(--accent)", fontWeight: 700 }}>
        BOAT SHOW PRICE
      </div>
      {/* aria-hidden: a screen reader should not read the number a sighted user
          cannot. The accessible statement is the caption below. */}
      <div
        aria-hidden
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: large ? 30 : 22,
          color: "#0A2138",
          lineHeight: 1.05,
          marginTop: large ? 5 : 2,
          width: "fit-content",
          filter: `blur(${large ? 10 : 7}px)`,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {value}
      </div>
      <div style={{ fontFamily: MONO, fontSize: large ? 12 : 9.5, letterSpacing: ".02em", color: "#3d5260", marginTop: large ? 9 : 5 }}>
        Shown at your appointment
      </div>
    </div>
  );
}
