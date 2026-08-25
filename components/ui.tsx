import type { CSSProperties, ReactNode } from "react";

export const DISPLAY = "var(--font-poppins), sans-serif";
export const MONO = "var(--font-poppins), sans-serif";

export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/** Small uppercase letterspaced eyebrow label above section headings.
 *  Light blue per the AC Boat Show brand system. */
export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 12.5, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--lightblue)", ...style }}>
      {children}
    </div>
  );
}
