# Resume checkpoint — 2026-08-26, ~3am (long session: airport, flight, layover, home)

Show opens **2026-09-10**. Fifteen days.

Site deployed and healthy at acvirtualboatshow.com. Everything committed and pushed;
production matches master. **Vercel now deploys on push to master** — no more
`vercel --prod`. Daily 8:08 AM sync armed.

## What changed this session

Roughly a dozen commits. The big ones:

- **Boats data.** Dock and slip assignments live on /map (three grouped columns, no
  search — 23 rows do not need a filter). Length parser rewritten: it had been taking
  the first two-digit number followed by ft anywhere in the listing HTML, so 85 of 86
  lengths were wrong (Formula 360 CBR read 92ft, Monterey 34 Elite read 2ft). Now
  derived from the model designation, which is how the industry names boats.
- **VDP rework.** Title full width, four conditional spec tiles, dealer logos (12/12
  resolve). All outbound links removed — nothing on a boat page sends a visitor away.
- **Dockside walkthrough scheduler.** Replaced the Request Price CTA per client spec.
  Reusable component on boat pages and inventory cards, its own confirmation route,
  six analytics events, UTM capture that survives to submit.
- **Lead pipeline, end to end and verified.** Supabase stores, Resend delivers, SPF +
  DKIM + DMARC all passing. Reply-to is the shopper, so no per-dealer CRM integration
  is needed. Consent checkbox gates whether contact details are stored at all, with a
  Postgres CHECK constraint enforcing it independently of the code.
- **Privacy policy** written against the real data flow, linked from footer and consent
  box. Cloudflare email obfuscation turned off so the contact address is readable.
- **Sync backstop.** The Google Sheet is now cross-checked against what actually
  shipped, on every path including "no changes detected".

## NEXT UP — blocked on other people

1. **Dealer email addresses.** `data/dealer-emails.json`, 12 empty. Until they land,
   every lead routes to customerinquiry@ flagged `[No dealer address]` for manual
   forwarding. Jon said these arrive 2026-08-26. Ask for two per dealer: a monitored
   inbox, and a CRM lead-intake address if they have one (ADF/XML is how DealerSocket,
   VinSolutions, CDK and Dominion ingest leads without a per-dealer API).
2. **Giselle's punch list.** Reconciliation report written and still unsent. Sheltered
   Cove's Sheet tab is empty while 11 of their boats publish; Stone Harbor's tab marks
   no cuts so 10 extra rows appear; the Sheet has no priority column, so hero ordering
   would be lost if it ever became the publishing source.

## NEEDS A DECISION FROM JON

**Ticket gating is still in limbo and now actively contradicts shipped work.** The gate
was removed 2026-08-25 on client request to make the show public and indexable. Since
then: sitemap lists all 86 boats, per-boat share cards drive traffic to VDPs, and the
entire walkthrough flow assumes public boat pages. The blurred Boat Show Price arguably
works *better* public — "the number only exists on the dock" is a reason to buy a
ticket, the opposite of hiding the boats.

Kill it formally or schedule it, but decide before spending anything more on SEO.
`components/ShowGate.tsx` still exists if it comes back.

## Buildable when there is time

- **Cron digest** — one 7am email per dealer during show week. Needs addresses first.
- Tuckerton Marine has JJ Boatworks' phone (609-344-0749); the directory confirms it
  belongs to JJ Boatworks. One of them is wrong and there is no correct value on file.
- Bajio Sunglasses: 907 (Alaska) area code on a Florida address, straight from the
  directory. Probably a typo in the source.
- "Linear" frontage figures in the dock notes are still unexplained and deliberately
  unmodelled.
- Red Bank Marina holds booths 255-261 but has no exhibitor record anywhere.
- EZ Dock appears twice in `lib/exhibitors.ts` (a dealer and a vendor entry); unclear
  which holds F34.
- 21 exhibitors are on the site but absent from the 2026 directory doc. Kept and
  flagged in that file's header, pending show-staff confirmation.

## Standing state (do not relitigate)

- 86 curated boats, full galleries, descriptions on all. **No prices anywhere** and no
  Request Price CTA — dealers do not want show pricing distributed electronically. The
  only permitted line is "Special show pricing is available directly from the dealer at
  the dock."
- No em dashes in outward-facing copy (importer sanitizes).
- **DNS is authoritative in Cloudflare. GoDaddy is registrar only** — edits made in
  GoDaddy's panel do nothing. Cloudflare also proxies the domain.
- Vercel env vars are marked **Sensitive**, so values cannot be read back by CLI or
  dashboard. Verify storage through `vercel logs --json` and the `stored` field, not
  local queries.
- Supabase project `virtualboatshow`, separate from anything Buoy. RLS enabled with **no
  policies** — that is deliberate, not an oversight; the anon key ships to browsers and
  only the service-role key writes.
- Use an obviously fake `source` value on any test submission so cleanup stays a
  one-liner.
- Two pre-existing lint errors in `app/inventory/page.tsx` lines 31-32
  (`useMemo(allBrands, [])`). Not introduced by this session; build passes.
- Waiting on Giselle beyond the punch list: photography, fonts, per-dealer SMS numbers.
