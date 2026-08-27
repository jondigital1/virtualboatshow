"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { track } from "@vercel/analytics";
/** Default target: the Interactive Ticketing purchase flow. Calling
 *  open() with no args uses this, so the ticket CTAs stay a bare open(). */
import { TICKETS_URL } from "@/lib/gate";

type ModalState = { url: string; title: string } | null;
type Ctx = { open: (url?: string, title?: string) => void; close: () => void };

const ModalCtx = createContext<Ctx>({ open: () => {}, close: () => {} });

/** `const { open } = useIframeModal()`, then `onClick={() => open(url, title)}`
 *  (or bare `open()` for the ticketing flow). */
export const useIframeModal = () => useContext(ModalCtx);

export function IframeModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>(null);
  // Shown after the TICKETING modal closes (any path: ✕, backdrop, Escape, or
  // the auto-close on purchase return). We cannot know from out here whether
  // the buyer finished, so the card must read true for buyers AND abandoners:
  // no "thanks for purchasing", and no access promises. Everyone here came
  // through the capture sheet, so the one true promise is the opening-day
  // email: the lineup opens to all at 10 AM on Sept 10 and we email them the
  // moment it does. Emails do NOT unlock the gate; that design was reversed
  // by Jon on 2026-08-27 and must not sneak back in through this copy.
  const [thanks, setThanks] = useState(false);
  const stateRef = useRef<ModalState>(null);
  stateRef.current = state;
  const open = useCallback(
    (url: string = TICKETS_URL, title: string = "Get Boat Show Tickets") => setState({ url, title }),
    []
  );
  const close = useCallback(() => {
    if (stateRef.current?.url === TICKETS_URL) setThanks(true);
    setState(null);
  }, []);
  const isOpen = !!state;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-close when the purchase completes.
  //
  // The checkout is a cross-origin third party (Interactive Ticketing), so we
  // cannot read "did they finish" from inside the frame. The reliable signal is
  // the RETURN: when the platform redirects to a URL on OUR domain after
  // purchase, the frame becomes same-origin and readable. That navigation is the
  // "done" event. It needs the platform's post-purchase return URL pointed at
  // acvirtualboatshow.com (the same setting that lets a ticket buyer land on the
  // unlocked inventory) — without it, we cannot detect completion and the buyer
  // closes the modal with the ✕.
  const onFrameLoad = useCallback(() => {
    const el = iframeRef.current;
    if (!el) return;
    try {
      const href = el.contentWindow?.location.href;
      // Readable === same-origin === the flow came back to our site. The initial
      // ticketing load throws here (cross-origin) and is correctly ignored.
      if (href && href.startsWith(window.location.origin)) {
        track("ticket_purchase_return", { via: "redirect" });
        close();
      }
    } catch {
      /* still on the ticketing domain, not finished */
    }
  }, [close]);

  // Bonus path: if the platform ever posts a completion message, honor it. Gated
  // to their origin and a clear signal, so it cannot fire mid-checkout.
  useEffect(() => {
    if (!isOpen) return;
    const onMsg = (e: MessageEvent) => {
      if (!e.origin.includes("interactiveticketing.com")) return;
      const d = e.data as unknown;
      const type = typeof d === "object" && d ? String((d as Record<string, unknown>).type ?? "") : "";
      if (/^(purchase[_-]?complete|order[_-]?complete|checkout[_-]?complete|success)$/i.test(type)) {
        track("ticket_purchase_return", { via: "message" });
        close();
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [isOpen, close]);

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

  // Same Escape + scroll-lock treatment for the thank-you card.
  useEffect(() => {
    if (!thanks) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setThanks(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [thanks]);

  return (
    <ModalCtx.Provider value={{ open, close }}>
      {children}
      {state && (
        <div
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={state.title}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(5,15,26,.78)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(10px,3vw,32px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", width: "100%", maxWidth: "min(1240px, 96vw)", height: "min(92vh, 1040px)", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 100px -30px rgba(0,0,0,.6)", display: "flex", flexDirection: "column" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px 12px 18px", background: "#142E51", color: "#fff", flex: "0 0 auto" }}>
              <span style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: 15 }}>{state.title}</span>
              <button onClick={close} aria-label="Close" style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.08)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>✕</button>
            </div>
            <iframe
              ref={iframeRef}
              onLoad={onFrameLoad}
              src={state.url}
              title={state.title}
              style={{ flex: 1, width: "100%", border: 0 }}
              allow="payment *; clipboard-write"
            />
          </div>
        </div>
      )}
      {thanks && (
        <div
          onClick={() => setThanks(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Thank you"
          style={{ position: "fixed", inset: 0, zIndex: 210, background: "rgba(5,15,26,.78)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(10px,3vw,32px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", width: "100%", maxWidth: 520, background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 100px -30px rgba(0,0,0,.6)" }}
          >
            <div style={{ position: "relative", height: "clamp(150px,24vw,200px)" }}>
              <Image src="/show/hero-marina-aerial.jpg" alt="Boats docked at the marina" fill sizes="520px" style={{ objectFit: "cover" }} />
              <button onClick={() => setThanks(false)} aria-label="Close" style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,.35)", background: "rgba(5,15,26,.45)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ padding: "26px clamp(20px,5vw,36px) 32px", textAlign: "center", fontFamily: "var(--font-poppins), sans-serif" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 18 }}>
                <Image src="/ac-logo-horizontal.png" alt="Atlantic City In-Water Boat Show" width={172} height={47} style={{ width: "clamp(140px,40vw,172px)", height: "auto" }} />
                <span aria-hidden style={{ width: 1, alignSelf: "stretch", background: "rgba(20,46,81,.16)" }} />
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1, gap: 3, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: ".2em", color: "rgba(20,46,81,.55)" }}>POWERED BY</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Image src="/buoy-ring-logo.svg" alt="" width={16} height={16} style={{ display: "block" }} />
                    <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: ".04em", color: "var(--navy)" }}>BUOY</span>
                  </span>
                </span>
              </div>
              <span className="gold-rule" style={{ margin: "0 auto 16px" }} />
              <h2 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 800, fontSize: "clamp(22px,4.5vw,28px)", color: "var(--navy)", margin: "0 0 12px", lineHeight: 1.2 }}>
                See you at the docks!
              </h2>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "rgba(20,46,81,.78)" }}>
                The full boat lineup opens to everyone on <strong style={{ color: "var(--navy)" }}>September 10 at 10 AM</strong>, and we will email you the moment it goes live.
              </p>
              <button onClick={() => setThanks(false)} style={{ marginTop: 20, background: "var(--navy)", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", padding: "13px 26px", borderRadius: 8, border: 0, cursor: "pointer" }}>
                See you at the show
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalCtx.Provider>
  );
}
