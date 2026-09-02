"use client";

/**
 * Records where the session came from, on the first page of every visit.
 *
 * This has to run at the ROOT. Campaign tags live on the landing URL and are
 * gone the moment someone navigates, so capturing them inside a form is too
 * late: the ticket capture sheet opens on whatever page the visitor has
 * reached by then, not the one the ad delivered them to. Until 2026-09-02 the
 * only caller was the dockside walkthrough form, which meant every ticket lead
 * from a paid click was stored with no campaign attached.
 *
 * That matters more than usual here. Checkout runs on Interactive Ticketing,
 * we cannot place anything on their pages, and the show cannot change their
 * configuration, so no purchase signal ever comes back to us. Matching the
 * emails captured on this site against the platform's purchaser list is the
 * only way to prove which ads sold tickets, and that match is worthless if the
 * lead does not know which ad it came from.
 */

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

export function Attribution() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
