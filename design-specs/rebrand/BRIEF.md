# AC In-Water Boat Show — Visual Refresh Brief

Source: client review doc "AC Virtual Boat Show Review.docx" (2026-08-25) + 4 mockup figures in this folder.
Status: reviewed with Jon 2026-08-25. This is a one-off proof-of-concept ahead of VBS living inside the Buoy app — quality bar is "as nice as possible."

## The governing brand rule (client's words)

> "The virtual show should look and feel like a digital extension of the Atlantic City In-Water Boat Show — not a separate Buoy marketplace featuring the show. The Boat Show's established brand leads the visitor-facing experience, with Buoy receiving clear, consistent 'Powered by Buoy' recognition as the technology partner."

AC identity leads everywhere; Buoy orange survives only inside Buoy-branded elements ("Powered by Buoy" lockup, partner block, footer credit).

## Palette (client-supplied hex)

| Role | Name | Hex |
|---|---|---|
| Primary / headlines / footer bg | Navy | `#142E51` |
| Secondary accent / links / info tints | Light Blue | `#75BAE4` |
| Accent lines / highlight words / CTA highlights | Gold | `#FDB717` |
| Panels / cards / page ground | White | `#FFFFFF` |
| Buoy elements ONLY | Buoy Orange | (existing token) |

Photography: marina, water, docks, boats, Atlantic City skyline. Campaign identity: **"LET'S BOAT!"** as supporting accent. Gold accent underlines beneath headlines (see figures).

Typography: "official Google fonts from the Boat Show brand sheet" — brand sheet not yet provided. Mockups show a geometric sans (Poppins/Montserrat family look) + script only inside the logo. OPEN QUESTION.

## Header & nav (target)

AC show logo first (horizontal), smaller "Powered by Buoy" lockup second, then:
`Browse Boats | Marine Marketplace | Find Them at the Show | Plan Your Visit | Get Tickets (CTA button)`

- Spelling: standardize **"Marine Marketplace"** (client flagged Marina/Marine inconsistency in their own mockups; body copy + section headline use Marine).
- Mockups also show "Meet the Dealers" in nav; the doc's recommended nav omits it — follow the doc's five items unless Jon decides otherwise.
- Current nav being replaced: Home | View Inventory | Sell Your Boat | Boat Show Map | Exhibitors.
- "Sell Your Boat" leaves primary nav (trade/deal mechanics move deeper into the experience).

## Page flow (target, per figures)

1. **Hero** — spacious, promotional. Headline "EXPLORE THE BOATS BEFORE YOU HIT THE DOCKS." (navy, gold second line), "LET'S BOAT!" campaign line, one short supporting sentence (browse dealers/inventory, save boats, plan the weekend), marina photography with white fade + navy/gold/light-blue wave motif.
2. **Explore the Show** — two equal cards: "BROWSE BOATS AT THE SHOW" and "BROWSE MARINE MARKETPLACE", each with photo + thumbnail strip. Subject-to-change notice bar under the cards.
3. **Find Your Way Around the Show** — official 2026 visitor map dominant (do NOT redesign/reinterpret the map), legend intact, "PLAN AHEAD, MAKE IT A WEEKEND!" card linking to Plan Your Visit.
4. **Powered by Buoy partner block** — Buoy life-ring logo, heading, short tech-partner statement (client supplied exact copy in doc), "LEARN ABOUT BUOY" button. The ONE place Buoy identity leads.
5. **Navy footer** — reversed horizontal show logo, "September 10–13, 2026", "Atlantic City, New Jersey", credit "Official virtual companion • Powered by Buoy".

## Directory pages

**/inventory → "Browse Boats at the Show"** (figure 2): search + filters Brand / Boat Type / Show Status / Location, "Show me boats I can see at the show" toggle, sort. Cards: brand/model, dealer, type, dock/slip location. Keep show-bound vs broader-inventory distinction + visible subject-to-change note. Broader dealer inventory: only after show close, or clearly labeled.

**/vendors → "Marine Marketplace"** (figure 3): parallel treatment, not secondary. Search exhibitors/products/services; filters Category / Exhibitor / Product-Service / Booth #. Cards: exhibitor name/logo, category chip, one-line description, booth number.

**/map → "Find Them at the Show"**: map + directory work together (listings carry dock/slip + booth numbers; map shows where those are).

**Plan Your Visit** (figure 4): NEW page — Hours & Tickets, Directions & Parking, Food & Drinks, Stay & Play cards; Food & Drinks section (The Deck, live entertainment, Vic & Anthony's, Chart House); "Make It a Weekend" closer.

## Copy & claims hit-list (soften, qualify, or relocate)

- "Every Dock. Every Dealer. Every Deal." → out of hero; supporting marketplace position only.
- Boat count: say **250+** (official show number), not 300+.
- Kill/qualify: "Every listing updates live and hourly", "exactly what's floating at the dock", "docks restock themselves", "new metal tied up Sunday", "walk past the lines", "dedicated captain waiting at the slip", locked-in trade values/terms, "best offer comes to you", "every dealer competing".
- Soften sales voice: "steal of the year", "win the weekend" → polished waterfront tone.
- Simple value prop line the client likes: "Browse boats. Save your favorites. Plan your route. See them at the show."
- Trade-in explainers + repeated appointment/deal CTAs move deeper (VDP-level), off the main journey.

## Open questions — status (2026-08-25)

1. Fonts: ANSWERED — match the mockups; Poppins sitewide until brand sheet arrives (Giselle, nice-to-have).
2. Get Tickets: ANSWERED — existing Interactive Ticketing modal is correct (components/IframeModal.tsx).
3. Official 2026 map: WAITING ON GISELLE — low-res mockup crop live at public/show/show-map-2026.png; swap when original arrives.
4. Exhibitor booth #s/categories/logos: WAITING ON GISELLE.
5. Dock/slip assignments: WAITING ON GISELLE.
6. Show gate: ANSWERED — removed 2026-08-25 (component preserved in components/ShowGate.tsx).
7. Photography: WAITING ON GISELLE — mockup crops live in public/show/ as stand-ins.
8. NEW (Jon): per-dealer text/SMS number for listings — WAITING ON GISELLE; sparsely staffed dealerships during show week. Build a "Text the dealer" action on VDPs when data lands.

Full request list: GISELLE-LIST.md / GISELLE-LIST.pdf in this folder.

## Assets in this folder

- `ac-show-logo-full-color.png` — official logo (navy boat + gold/light-blue waves), white background, needs transparent/reversed web versions cut.
- `figure-1-homepage.png` … `figure-4-plan-your-visit.png` — client-approved mockups; treat as the design target.
