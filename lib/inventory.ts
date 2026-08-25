/**
 * Live show stats derived from the Buoy API. Replaces the old fabricated
 * SHOW_STATS sample (hardcoded MSRP/price pairs and a made-up dealer count).
 *
 * Usage (client-side only, callers are "use client" pages):
 *   fetchShowStats().then(setStats)
 * When the result is null, HIDE the stat blocks entirely - no zeros, no
 * placeholders. The old SHOW_STATS.dealers figure was fabricated and has no
 * live replacement: remove that stat wherever it rendered.
 */
import { fetchListings } from "@/lib/buoy";

/** Days the show-floor pricing lives (Sept 10-13) - a real event fact. */
export const SHOW_DAYS = 4;

export type ShowStats = {
  /** Listings currently carrying server-computed savings. */
  count: number;
  /** Average dollars off MSRP across those listings. */
  avgSave: number;
  /** Biggest single save, in dollars. */
  maxSave: number;
};

/**
 * Compute savings stats over the live inventory (server-derived savings
 * only - never computed client-side from prices). Returns null when no
 * listing has savings OR the API is unreachable; callers hide the stats.
 */
export async function fetchShowStats(): Promise<ShowStats | null> {
  try {
    const { listings } = await fetchListings({ limit: 100 });
    const saves = (listings ?? [])
      .map((l) => l.savingsCents ?? 0)
      .filter((c) => c > 0)
      .map((c) => Math.round(c / 100));
    if (saves.length === 0) return null;
    return {
      count: saves.length,
      avgSave: Math.round(saves.reduce((a, b) => a + b, 0) / saves.length),
      maxSave: Math.max(...saves),
    };
  } catch {
    return null;
  }
}
