# Dock assignments — RAW, UNVERIFIED

Provided by Jon 2026-08-25. **Do not build from this file until the conflicts in
the last section are resolved.** Transcribed verbatim, with parsing notes added.
Nothing here has shipped to the site.

## F Dock

Slip numbers appear to run even on one side, odd on the other. All six even-side
entries are contiguous (F2 through F34); the odd side starts at F11, so F1-F9
odd is either unassigned or not yet allocated.

| # | Exhibitor | Slips | Side |
|---|---|---|---|
| 1 | South Jersey Yacht Sales | F2-8 | even |
| 2 | Comstock | F10-12 | even |
| 3 | Seaport Inlet | F14-16 | even |
| 4 | D&R | F18-24 | even |
| 5 | Sandy Hook | 26-32 (F prefix omitted in source) | even |
| 6 | EZ Dock | F34 | even |
| 7 | MarineMax | F11-25 | odd |
| 8 | Formula | F27-33 | odd |
| 9 | Irwin Marine | F35-41 | odd |
| 10 | Riptide Marine | F43-45 | odd |

**Special note from Jon:** EZ Dock knows that if we sell exhibit space to other
entities, he will be the last exhibitor on F Dock.

## E Dock

Each entry carries a slip range and a separate "Linear" range with a footage
total. The two ranges do not overlap for most dealers, so linear frontage is
apparently distinct from the slip assignment. **Semantics unconfirmed.**

| # | Exhibitor | Slips (as written) | Linear | Total |
|---|---|---|---|---|
| 1 | Stone Harbor | E1-11 | E2-12 | 120 ft |
| 2 | Coastal | E13-19 | E22-24 + half of 26 | 50 ft |
| 3 | Sheltered Cove | **F14-20** (conflict) | | 80 ft |
| 4 | Coty | 21-31 (no letter) | 26-38 + one half of 38 | 130 ft |
| 5 | Valhalla | **F33-37** (conflict) | 38-46 + half of 38 | 90 ft |
| 6 | Schrader | **F39-41** (conflict) | | |
| 7 | G Winter / Riverside (shared) | **F43-45** (conflict) | F48-56 | 100 ft |

## Land space

| # | Exhibitor | Location | Size |
|---|---|---|---|
| 1 | NJ Outboards | Block A | 130 x 75 ft |
| 2 | Clarks Landing | Block B | 50 ft wide x 55 ft wide, "High toward Block D (NJO)" |
| 3 | Paradise Grills | Block G | |
| 4 | Red Bank Marina | Booth area 255-261 | 70 ft linear |
| 5 | Total Marine | Booth area 237-242 | 60 ft linear (source says 60", assumed feet) |

## Unresolved — needs Jon or Giselle before this can ship

1. **Four E Dock entries carry an F prefix** (Sheltered Cove, Valhalla,
   Schrader, G Winter/Riverside). Each collides with a real F assignment:
   F14-20 hits Seaport Inlet, F33-37 hits Formula, F39-41 hits Irwin, and
   F43-45 is exactly Riptide's range. They sit under the E/Dock heading, so
   they are almost certainly E, but this must be confirmed, not assumed.
2. **Coty has no dock letter** on either range (21-31, 26-38).
3. **Sandy Hook's slip range omits the F prefix** (26-32).
4. **What does "Linear" mean** for display? Frontage the dealer rents alongside
   their slips, or a second location? It changes whether the site shows one
   location per dealer or two.
5. **Block A vs Block D for NJ Outboards.** Entry 1 puts NJO in Block A; the
   Clarks Landing note says "High toward Block D (NJO)".
6. **Red Bank Marina** is in neither the exhibitor directory nor the boat
   workbook. Irwin Marine Center is the Red Bank dealer and already holds
   F35-41, so this looks like a separate entity that needs an exhibitor record.
7. **Which EZ Dock holds F34?** The exhibitor list carries two: "EZ Dock Mid
   Atlantic" (dealer) and "EZ Docks - Docks Unlimited Marine Construction"
   (vendor).

## Coverage check

All 20 dealers in the feature-boats workbook have an assignment. Three entities
hold space without being boat dealers: EZ Dock (F34), Paradise Grills (Block G),
and Red Bank Marina (booth).
