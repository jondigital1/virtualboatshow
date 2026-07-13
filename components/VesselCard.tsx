import Link from "next/link";

const DISPLAY = "var(--font-bricolage), sans-serif";
const MONO = "var(--font-space-mono), monospace";

export type Vessel = {
  year: number;
  name: string;
  length: string;
  engine: string;
  condition: string;
  usage: string;
  dockLabel: string;
  msrpFmt: string;
  showFmt: string;
  saveFmt: string;
  bg: string;
  href?: string;
};

/** Inventory card used on Home + inventory grids. `revealed` shows the
 *  Boat Show Price; otherwise it renders the blurred "locked" state. */
export function VesselCard({ v, revealed }: { v: Vessel; revealed: boolean }) {
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
      <div style={{ position: "relative", aspectRatio: "16/11", background: v.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", color: "rgba(10,33,56,.4)" }}>// VESSEL PHOTO</span>
        <span style={{ position: "absolute", top: 11, left: 11, fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", background: "rgba(8,24,41,.9)", color: "#fff", padding: "5px 9px", borderRadius: 6 }}>
          {v.dockLabel}
        </span>
        <span style={{ position: "absolute", top: 11, right: 11, fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", background: "#fff", color: "#0A2138", padding: "5px 9px", borderRadius: 6, border: "1px solid rgba(11,34,56,.1)" }}>
          {v.condition}
        </span>
      </div>
      <div style={{ padding: "17px 17px 19px", display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#8595a0", letterSpacing: ".06em" }}>{v.year}</div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18.5, margin: "3px 0 0", lineHeight: 1.12, letterSpacing: "-.01em" }}>{v.name}</h3>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: "#5a6c78", display: "flex", flexWrap: "wrap", gap: "6px 8px" }}>
          <span>{v.length}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{v.engine}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{v.usage}</span>
        </div>
        <div style={{ marginTop: "auto", paddingTop: 13, borderTop: "1px solid rgba(11,34,56,.08)", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "#9aa7b0", textDecoration: "line-through" }}>MSRP {v.msrpFmt}</div>
            {revealed ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 3 }}>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: "#0A2138" }}>{v.showFmt}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, color: "#178a5a", fontWeight: 700 }}>SAVE {v.saveFmt}</span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".12em", color: "var(--accent)", marginTop: 2 }}>BOAT SHOW PRICE</div>
              </>
            ) : (
              <>
                <div style={{ marginTop: 3, height: 26, display: "flex", alignItems: "center" }}>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: "#0A2138", filter: "blur(7px)", userSelect: "none" }}>$000,000</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 1, background: "var(--accent)" }} />
                  <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", color: "var(--accent)" }}>SHOW PRICE · LOCKED</span>
                </div>
              </>
            )}
          </div>
          <Link
            href={v.href ?? "/#unlock"}
            className="h-brighten"
            style={{ width: 38, height: 38, flex: "0 0 auto", borderRadius: "50%", background: "#F1EEE6", color: "#0A2138", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}
          >
            →
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
