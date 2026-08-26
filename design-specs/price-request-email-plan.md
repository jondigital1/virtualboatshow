# Boat Show Price → dealer email: what's left

Goal: the "Request price" CTA on a boat detail page sends an email to that
dealer, with the boater's details, so the dealer can reply directly.

**Status as of 2026-08-25:** the form and the blurred price block are built,
pushed, and building clean. `lib/mail.ts` is written (Resend over REST, no SDK
dependency). Nothing is deployed. The route handler is NOT written yet.

## Jon's inputs — these block everything else

1. **Dealer email addresses.** Fill `data/dealer-emails.json`. Twelve entries,
   one per dealer with boats live. Role addresses (`sales@`, `info@`) over
   individual salespeople, so a lead does not sit unread during show week.
   A dealer left empty cannot receive a lead, by design.
2. **Create `customerinquiry@acvirtualboatshow.com`** as the sending mailbox.
3. **Resend account** at resend.com, then add the API key to the Vercel project
   as `RESEND_API_KEY`. Also set `LEAD_FROM_EMAIL` and `LEAD_COPY_EMAIL`.
4. **DNS: SPF and DKIM for acvirtualboatshow.com.** Resend gives three records
   to add. Without these the mail lands in spam, which is worse than not
   sending, because everyone believes it worked.

## Build work

5. **Write `app/api/leads/route.ts`.** Drafted in full during the 2026-08-25
   session; re-create it. Behaviour:
   - `price-request` type resolves the dealer's addresses from
     `data/dealer-emails.json`, sends via `lib/mail.ts`
   - `reply_to` is the boater's address so the dealer replies straight to them
   - BCC the show inbox, so the lead lives in our record and not only in a
     dealer's mailbox
   - confirmation email to the boater, best-effort
   - returns `{ ok, delivered }`; `delivered: false` when there is no address
     or no API key, and the lead is logged rather than lost
   - field length caps and a `website` honeypot field — the endpoint is public
     and triggers outbound mail
6. **Honeypot input** in `components/BoatShowPrice.tsx` (hidden `website`
   field), and handle `delivered: false` by showing the dealer's phone number.
   Needs the dealer phone passed as a prop.
7. **Test end to end** with a real address before trusting it. Check the mail
   does not land in spam from a cold domain.

## Decisions still open

- Do the other lead types (trade-in, sell-boat, vendor-inquiry, prequalify)
  route to email too, or wait for a CRM? Today they only `console.log`.
- Rate limiting. Serverless has no store; if abuse becomes real, the options
  are Vercel KV or a provider-side cap.

## Not blocking, but queued from the same session

- `vercel --prod --yes` — six commits are pushed and unshipped, including the
  dock list, the exhibitor reconcile, and the price block.
- Giselle's punch list: the empty Sheltered Cove tab, Stone Harbor's missing
  cut markers, and the absent priority column in the Google Sheet.
- Spec tiles on the VDP are capped at four fields because `show-boats.json`
  holds only brand, model, year, and length.
