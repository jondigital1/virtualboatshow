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

/** Tap-to-call pill in show light-blue: signals the number dials directly
 *  from a phone. Used wherever a phone number appears. */
export function PhonePill({ phone, style }: { phone: string; style?: CSSProperties }) {
  const digits = String(phone).replace(/[^0-9]/g, "");
  if (!digits) return null;
  return (
    <a
      href={"tel:" + digits}
      className="h-brighten"
      style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--lightblue)", color: "var(--navy)", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".02em", padding: "8px 15px", borderRadius: 999, whiteSpace: "nowrap", ...style }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1z" />
      </svg>
      {phone}
    </a>
  );
}
