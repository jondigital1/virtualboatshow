import Link from "next/link";
import { Fragment } from "react";
import { BlurredPrice } from "@/components/BlurredPrice";

const DISPLAY = "var(--font-bricolage), sans-serif";
const MONO = "var(--font-space-mono), monospace";

/** Display view-model for the inventory card. Built from live Buoy data
 *  (see toV in @/lib/buoy). Empty-string / absent fields do not render. */
export type Vessel = {
  year: number;
  name: string;
  /** e.g. "45'" - "" hides the segment. */
  length: string;
  /** "" hides the segment. */
  engine: string;
  /** "New"/"Used" badge - "" hides it. */
  condition: string;
  /** "New" or "120 hrs" - "" hides the segment. */
  usage: string;
  /** Location badge (live data has no physical dock) - "" hides it. */
  dockLabel: string;
  /** Struck MSRP, server-derived only - absent/empty hides MSRP + SAVE. */
  msrpFmt?: string;
  /** Boat Show Price - ignored when por is true. */
  showFmt: string;
  /** Server-derived savings - absent/empty hides the SAVE tag. */
  saveFmt?: string;
  /** Price on request: renders "Price on request" instead of a price. */
  por?: boolean;
  /** Real listing photo; bg stays as the no-photo fallback. */
  photoUrl?: string | null;
  bg: string;
  href?: string;
};

/** Inventory card used on Home + inventory grids. The struck MSRP is the only
 *  legible price; the Boat Show Price is blurred (see BlurredPrice), reserved for
 *  the appointment and the docks. */
export function VesselCard({ v }: { v: Vessel; revealed?: boolean }) {
  const specs = [v.length, v.engine, v.usage].filter(Boolean);
  return (
    <div
      className="card-lift"
      style={{
        background: "#fff",
        border: "1px solid rgba(11,34,56,.1)",
        borderRadius: 18,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16/11", background: v.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {v.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.photoUrl}
            alt={`${v.year || ""} ${v.name}`.trim()}
            loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", color: "rgba(10,33,56,.4)" }}>// VESSEL PHOTO</span>
        )}
        {v.dockLabel ? (
          <span style={{ position: "absolute", top: 11, left: 11, fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", background: "rgba(8,24,41,.9)", color: "#fff", padding: "5px 9px", borderRadius: 6 }}>
            {v.dockLabel}
          </span>
        ) : null}
        {v.condition ? (
          <span style={{ position: "absolute", top: 11, right: 11, fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", background: "#fff", color: "#0A2138", padding: "5px 9px", borderRadius: 6, border: "1px solid rgba(11,34,56,.1)" }}>
            {v.condition}
          </span>
        ) : null}
      </div>
      <div style={{ padding: "17px 17px 19px", display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
        <div>
          {v.year ? <div style={{ fontFamily: MONO, fontSize: 11, color: "#8595a0", letterSpacing: ".06em" }}>{v.year}</div> : null}
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18.5, margin: "3px 0 0", lineHeight: 1.12, letterSpacing: "-.01em" }}>{v.name}</h3>
        </div>
        {specs.length > 0 && (
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: "#5a6c78", display: "flex", flexWrap: "wrap", gap: "6px 8px" }}>
            {specs.map((s, i) => (
              <Fragment key={i}>
                {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                <span>{s}</span>
              </Fragment>
            ))}
          </div>
        )}
        <div style={{ marginTop: "auto", paddingTop: 13, borderTop: "1px solid rgba(11,34,56,.08)" }}>
          <div>
            {v.msrpFmt ? (
              <div style={{ fontFamily: MONO, fontSize: 11, color: "#9aa7b0", textDecoration: "line-through" }}>MSRP {v.msrpFmt}</div>
            ) : null}
            {v.por ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 3 }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 19, color: "#0A2138" }}>Price on request</span>
              </div>
            ) : (
              <BlurredPrice value={v.showFmt} />
            )}
          </div>
          <Link
            href={v.href ?? "/inventory"}
            className="h-brighten"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, background: "var(--accent)", color: "#0A2138", fontWeight: 700, fontSize: 13.5, padding: 11, borderRadius: 10 }}
          >
            Vessel Details →
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Simple advertisement placeholder box (replaces the drag-to-fill image
 *  slots from the prototype). Swap the inner content for a real <img> or ad tag. */
export function AdSlot({ label, tag = "ADVERTISEMENT", height, accent = false }: { label: string; tag?: string; height?: number; accent?: boolean }) {
  return (
    <div
      style={{
        position: "relative",
        border: accent ? "1px dashed rgba(242,106,62,.4)" : "1px dashed rgba(11,34,56,.24)",
        borderRadius: 14,
        overflow: "hidden",
        background: accent ? "linear-gradient(180deg,#fbf3ef,#fbfaf5)" : "#fbfaf5",
        height: height ?? 114,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "absolute", top: 8, left: 10, fontFamily: MONO, fontSize: 9, letterSpacing: ".14em", color: accent ? "var(--accent)" : "rgba(11,34,56,.45)", background: "rgba(255,255,255,.85)", padding: "2px 7px", borderRadius: 4 }}>
        {tag}
      </div>
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: "rgba(11,34,56,.4)", textAlign: "center", padding: "0 16px" }}>{label}</span>
    </div>
  );
}
