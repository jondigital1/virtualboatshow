# Resume checkpoint — 2026-08-25 (Jon traveling; next work session at the airport)

Site is fully deployed and healthy at acvirtualboatshow.com. Everything committed & pushed.
Daily 8:08 AM sync is armed with tools pre-approved (ran once manually; approvals stored).

## NEXT UP (Jon's words): ticket-gated inventory rework
"Users will only have access to inventory if they purchase tickets. So we won't need the
buy tickets link on the VDPs."

Scope to work out together when he's back:
- Re-gate /inventory and /boats/* behind ticket purchase (ShowGate component still exists
  at components/ShowGate.tsx; IframeModal already detects the ticketing return-to-our-domain
  redirect as the purchase-complete signal, which was the original unlock design).
- Remove the Get Tickets CTA from VDPs (redundant once only ticket-holders can reach them).
- Questions to raise before building:
  1. Tension with the client review: the virtual show was made public/indexable on client
     request (gate removed 2026-08-25). Confirm the client is on board with re-gating.
  2. Just-shipped features that assume public boat pages: sitemap.xml lists all 86 boats;
     per-boat share cards drive traffic to VDPs. Decide behavior for gated visitors
     (teaser page with photo + "unlock with tickets"? full block?). A teaser VDP preserves
     the dealer-sharing loop and SEO while gating details.
  3. Unlock mechanics: cookie/localStorage after ticket purchase return? Duration? Manual
     code fallback (ShowGate password mode) for people who bought tickets elsewhere?

## Standing state (do not relitigate)
- 86 curated boats, full galleries (cache-busting numbering), descriptions on all, no
  prices, no favorites feature. No em dashes anywhere outward-facing (importer sanitizes).
- Per-boat share cards live; sitemap (92 URLs) + robots live; Vercel Analytics installed
  (Jon to confirm dashboard toggle). Sponsors page + homepage strip live. Plan page
  redesigned (navy utility strip, photo tiles, editable hotel dates, big iframe modal).
- Leads decision still parked: inquiry form logs only. Email wiring ready to go when Jon
  supplies a Resend API key (or picks another destination).
- Waiting on Giselle: booth #s, dock/slips, per-dealer SMS numbers, photography, fonts.
