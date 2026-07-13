"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

/** The Interactive Ticketing purchase flow, opened in an overlay iframe
 *  whenever a "Get Boat Show Tickets" CTA is pressed. */
const TICKETS_URL = "https://secure.interactiveticketing.com/1.43/1f654c/#/select";

type Ctx = { open: () => void; close: () => void };
const TicketCtx = createContext<Ctx>({ open: () => {}, close: () => {} });

/** Call `const { open } = useTickets()` in any client component, then
 *  `onClick={open}` to launch the ticket iframe. */
export const useTickets = () => useContext(TicketCtx);

export function TicketProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Close on Escape and lock body scroll while the modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  return (
    <TicketCtx.Provider value={{ open, close }}>
      {children}
      {isOpen && (
        <div
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Get Boat Show Tickets"
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(5,15,26,.78)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(10px,3vw,32px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", width: "100%", maxWidth: 680, height: "min(90vh, 920px)", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 100px -30px rgba(0,0,0,.6)", display: "flex", flexDirection: "column" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px 12px 18px", background: "#0A2138", color: "#fff", flex: "0 0 auto" }}>
              <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 15 }}>Get Boat Show Tickets</span>
              <button onClick={close} aria-label="Close" style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.08)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>✕</button>
            </div>
            <iframe
              src={TICKETS_URL}
              title="Boat Show Tickets"
              style={{ flex: 1, width: "100%", border: 0 }}
              allow="payment *; clipboard-write"
            />
          </div>
        </div>
      )}
    </TicketCtx.Provider>
  );
}
