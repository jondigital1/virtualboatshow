"use client";

import { useState } from "react";
import { DISPLAY, MONO, Eyebrow } from "@/components/ui";
import { DOCKS, LAND, PLACEMENTS, type Dock } from "@/lib/docks";

const FONT = "var(--font-poppins), sans-serif";

const range = (a: number, b: number) => (a === b ? `${a}` : `${a}-${b}`);

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid rgba(20,46,81,.12)",
  borderRadius: 16,
  padding: "18px 20px 14px",
};

const headStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 10,
  paddingBottom: 11,
  borderBottom: "1px solid rgba(20,46,81,.1)",
};

function Group({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div style={cardStyle}>
      <div style={headStyle}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 17, color: "var(--navy)", textTransform: "uppercase", letterSpacing: ".02em" }}>{title}</span>
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: "rgba(20,46,81,.55)" }}>{count}</span>
      </div>
      {children}
    </div>
  );
}

/** Walk order: ascending slip number, which interleaves the even and odd sides
 *  the way you would actually pass them walking down the dock. */
function DockGroup({ dock }: { dock: Dock }) {
  const berths = dock.berths.slice().sort((a, b) => a.start - b.start);
  return (
    <Group title={dock.label} count={berths.length}>
      {berths.map((b, i) => (
        <div key={b.name} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, padding: "10px 0", borderTop: i ? "1px solid rgba(20,46,81,.07)" : "none" }}>
          <span style={{ fontSize: 14, color: "var(--navy)", lineHeight: 1.35 }}>{b.name}</span>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: "rgba(20,46,81,.6)", whiteSpace: "nowrap" }}>{range(b.start, b.end)}</span>
        </div>
      ))}
    </Group>
  );
}

export function DockList() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const rows = PLACEMENTS.filter((p) => !term || p.name.toLowerCase().includes(term));

  return (
    <div style={{ marginTop: 34 }}>
      <Eyebrow>Where to find them</Eyebrow>
      <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(22px,2.6vw,32px)", lineHeight: 1.06, letterSpacing: "-.01em", margin: "12px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>
        Dock &amp; slip assignments
      </h2>
      <p style={{ fontSize: 15, color: "rgba(20,46,81,.72)", margin: "12px 0 0", maxWidth: "62ch", lineHeight: 1.6 }}>
        Every dealer&rsquo;s position on the docks and in the land displays. Slips run even on one side of each dock and odd on the other, so numbers that look like they overlap are facing each other across the walkway.
      </p>

      <div className="dock-grid">
        {DOCKS.map((d) => (
          <DockGroup key={d.id} dock={d} />
        ))}
        <Group title="Land displays" count={LAND.length}>
          {LAND.map((l, i) => (
            <div key={l.name} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, padding: "10px 0", borderTop: i ? "1px solid rgba(20,46,81,.07)" : "none" }}>
              <span style={{ fontSize: 14, color: "var(--navy)", lineHeight: 1.35 }}>{l.name}</span>
              <span style={{ fontFamily: MONO, fontSize: 12.5, color: "rgba(20,46,81,.6)", whiteSpace: "nowrap", textAlign: "right" }}>{l.where}</span>
            </div>
          ))}
        </Group>
      </div>

      <div style={{ ...cardStyle, marginTop: 16 }}>
        <label htmlFor="dock-search" style={{ fontFamily: MONO, fontWeight: 600, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(20,46,81,.55)" }}>
          Find an exhibitor
        </label>
        <input
          id="dock-search"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Start typing a name"
          style={{ width: "100%", marginTop: 9, background: "var(--bluetint)", border: "1px solid rgba(20,46,81,.14)", borderRadius: 10, padding: "12px 14px", fontSize: 15, color: "var(--navy)", fontFamily: "inherit" }}
        />
        <div className="dock-results">
          {rows.map((p, i) => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid rgba(20,46,81,.07)" }}>
              <span style={{ flex: 1, fontSize: 14, color: "var(--navy)", minWidth: 0 }}>{p.name}</span>
              <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.5)", color: "var(--linkblue)", borderRadius: 999, padding: "4px 10px", whiteSpace: "nowrap" }}>
                {p.dock}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: "rgba(20,46,81,.6)", minWidth: 88, textAlign: "right", whiteSpace: "nowrap" }}>{p.where}</span>
            </div>
          ))}
          {!rows.length && (
            <div style={{ fontSize: 14, color: "rgba(20,46,81,.6)", padding: "12px 0" }}>No exhibitor by that name.</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bluetint)", border: "1px solid rgba(117,186,228,.35)", borderRadius: 10, padding: "11px 16px", marginTop: 16 }}>
        <span aria-hidden style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--lightblue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flex: "0 0 auto" }}>i</span>
        <span style={{ fontSize: 13.5, color: "rgba(20,46,81,.75)" }}>Assignments are subject to change. Please check with show staff for the most up-to-date information.</span>
      </div>
    </div>
  );
}
