# Lead routing plan

Written 2026-08-26. Replaces `price-request-email-plan.md`, which described a
Request Price CTA that has since been removed on client instruction.

**Show opens 2026-09-10.** Everything below should be done well before then,
because the failure mode is silent: a shopper completes the form, sees a
confident confirmation, and the dealer never hears about it.

## Status — updated 2026-08-26

DONE and verified in production:

- Resend account, domain `acvirtualboatshow.com` verified on the root.
- DNS in **Cloudflare** (GoDaddy is registrar only — edits made in GoDaddy's
  panel do nothing). SPF merged for Google Workspace and Resend in a single
  record, DKIM for both selectors, DMARC at `p=none`.
- Google Workspace mail live on the domain; `customerinquiry@` sends and
  receives.
- Vercel env: `RESEND_API_KEY`, `LEAD_FROM_EMAIL`, `LEAD_COPY_EMAIL`.
- `app/api/leads/route.ts` delivers walkthrough leads, with reply-to set to
  the shopper and a fallback to the show inbox when a dealer has no address.
- End-to-end test through the live endpoint: SPF, DKIM, and DMARC all PASS,
  message delivered to the inbox, not spam.

STILL TO DO: dealer addresses, Supabase storage, consent checkbox, privacy
policy, the cron digest, and the other five lead types.

Tighten DMARC from `p=none` to `p=quarantine` after a week or two of clean
reports, not before.

## What exists today

- `components/DocksideWalkthrough.tsx` — the CTA, modal, and validation. Live.
- `app/walkthrough/confirmed/page.tsx` — confirmation page. Live.
- `lib/attribution.ts` — UTM capture in sessionStorage. Live.
- `lib/mail.ts` — Resend REST wrapper, no dependency. Written, never called.
- `data/dealer-emails.json` — 12 empty entries awaiting addresses.
- `app/api/leads/route.ts` — **logs and returns ok. Nothing is delivered.**

Six analytics events already fire via `@vercel/analytics`: cta_clicked,
scheduler_opened, started, submitted, abandoned, confirmation_viewed.

## Stack decisions

Paid Vercel, Supabase, and GitHub are already in place, so the only new
service is the email provider.

- **Store:** Supabase Postgres.
- **Send:** Resend (free tier covers projected volume; the 100/day cap is the
  one pressure point during show week, ~$20/mo lifts it).
- **Digest:** Vercel Cron, available on the paid plan.
- Postmark is the upgrade path if deliverability disappoints. `lib/mail.ts`
  isolates the provider so swapping means rewriting one function.

## 1. Supabase: schema and access

One table. Non-identifying columns are always written; contact fields are
populated ONLY when the shopper ticks the consent box.

```
leads
  id                uuid primary key default gen_random_uuid()
  created_at        timestamptz default now()
  type              text        -- 'dockside-walkthrough', etc.
  boat_slug         text
  boat_year         int
  boat_make         text
  boat_model        text
  dealer_name       text
  show_location     text        -- berth from lib/docks.ts
  show_day          date
  daypart           text
  source            text        -- 'vdp-price-block' | 'inventory-card' | ...
  page_url          text
  referrer          text
  utm_source        text
  utm_medium        text
  utm_campaign      text
  utm_term          text
  utm_content       text
  contact_hash      text        -- HMAC(email, server secret); dedupe only
  delivered         boolean
  delivery_error    text
  -- consent-gated, null unless marketing_opt_in is true:
  marketing_opt_in  boolean default false
  first_name        text
  last_name         text
  email             text
  phone             text
```

**RLS is not optional here.** The Supabase anon key ships to the browser.
Enable RLS on `leads` and add NO policy for anon or authenticated roles, so
the table is unreachable from the client. All writes go through the API route
using the service-role key, which must live in a Vercel env var and never in
anything prefixed `NEXT_PUBLIC_`.

Add a `lead_stats` view (counts grouped by boat, dealer, day, source) with no
contact columns. That is what any future dealer-facing reporting reads.

## 2. API route

Rewrite `app/api/leads/route.ts` to, in order:

1. Validate and cap field lengths (already done for price-request; keep it).
2. Honeypot check (`website` field) — accept and drop silently.
3. **Insert the Supabase row FIRST.** If the email later fails, the lead still
   exists and can be replayed. Email is notification, not the record.
4. Look up dealer addresses in `data/dealer-emails.json`.
5. Send via `lib/mail.ts` with **`replyTo` set to the shopper**, so the dealer
   answers by hitting reply and no CRM integration is needed.
6. Update `delivered` / `delivery_error` on the row.
7. Send the shopper their confirmation email.
8. Return `{ ok, delivered }`.

**Stop logging PII.** The current `console.log` writes name, email, and phone
into Vercel function logs, which are retained and which nobody thinks of as a
database. Log boat and dealer only.

## 3. Email content

Subject: `Dockside walkthrough — {Year Make Model}`

The body says a shopper intends to visit that boat, on that day, in that part
of the day, and gives their contact details. It must NOT say anything about
price, quotes, holds, or reservations. Show pricing is given at the dock; that
is the only claim the site makes anywhere.

Where a dealer supplies a CRM lead-intake address, also send an **ADF/XML**
copy. That is how DealerSocket, VinSolutions, CDK, and Dominion ingest leads
without a per-dealer API. Near-universal in automotive, less consistent in
marine, so treat it as per-dealer and optional.

## 4. Consent checkbox

One line in the modal: "Send me show updates and boats like this."

Unticked, the row stores the anonymous event only. Ticked, it stores a real
contact record with provable consent. This is how the boater-side dataset
grows legitimately instead of by default.

## 5. Privacy policy — currently missing

The site collects name, email, and phone and has **no privacy policy at all**;
there is no such page and no footer link. That needs fixing before the show,
and the consent checkbox needs something to point at. Minimum: what is
collected, why, that it is shared with the dealer whose boat was selected, how
long it is kept, and how to request deletion.

## 6. Daily digest (Vercel Cron)

A scheduled function during show week: query Supabase for tomorrow's leads per
dealer and send one summary each at 7am. During the show a dealer will stop
reading twenty separate pings; the digest is what actually gets used.

## 7. Other lead types

Five types still only log: `vendor-inquiry`, `trade-in`, `sell-boat`,
`prequalify`, `ticket-unlock`. The `/vendors` partnership form is a live
business form silently dropping submissions. Route them through the same path
once the walkthrough flow works.

## Inputs needed from Jon

- Dealer email addresses (`data/dealer-emails.json`, 12 empty).
- CRM lead-intake addresses where dealers have them.
- `RESEND_API_KEY` in Vercel env.
- SPF and DKIM records on acvirtualboatshow.com, or mail lands in spam.
- Supabase service-role key and project URL in Vercel env.
- A secret for the contact HMAC.

## Verify before the show

Submit a real walkthrough end to end and confirm: a Supabase row exists, the
dealer receives the email, reply-to reaches the shopper, the confirmation
email arrives, and `delivered` is true. Then check the same for a bad dealer
address, and confirm the lead still lands in Supabase with an error recorded.
