import type { CSSProperties, ReactNode } from "react";

export const DISPLAY = "var(--font-bricolage), sans-serif";
export const MONO = "var(--font-space-mono), monospace";

export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/** Small uppercase mono eyebrow label used above section headings. */
export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)", ...style }}>
      {children}
    </div>
  );
}
