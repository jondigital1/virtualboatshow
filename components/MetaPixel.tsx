"use client";

/**
 * Meta pixel, for the Facebook ticket ads.
 *
 * WHAT IT CAN AND CANNOT SEE. Checkout happens inside an iframe pointed at
 * secure.interactiveticketing.com, and a pixel cannot read across that origin.
 * So there is no Purchase event and there never will be unless Interactive
 * Ticketing agrees to place this pixel id on their confirmation page. The
 * deepest signal we own is Lead, fired when someone completes the capture form
 * and the ticket window opens. Campaigns must optimise for Lead, not Purchase.
 *
 * Lead is fired ONLY by the ticket capture. The dockside walkthrough form is
 * also a lead in the ordinary sense, but firing the same event there would let
 * Meta optimise toward whichever is cheaper to produce, and walkthrough
 * requests are not ticket sales.
 *
 * The id is public: it ships in the page source of every site running a pixel,
 * so it is a constant here rather than an environment variable.
 *
 * Production only. Local runs submit the capture form during testing, and
 * those submissions would otherwise land in the real dataset as conversions.
 */

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export const META_PIXEL_ID = "980094031711632";

const ENABLED = process.env.NODE_ENV === "production";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a Meta standard event. Safe to call anywhere: it is a no-op when the
 * pixel is switched off or has not finished loading, so callers never have to
 * guard it.
 */
export function pixel(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}

export function MetaPixel() {
  const pathname = usePathname();
  const mounted = useRef(false);

  // The init snippet fires the first PageView itself. Client-side navigation
  // does not reload the page, so every route change after that needs its own,
  // or the whole site looks like one long visit to the landing page.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    pixel("PageView");
  }, [pathname]);

  if (!ENABLED) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
