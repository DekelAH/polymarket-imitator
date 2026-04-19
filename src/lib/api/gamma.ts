/**
 * Thin client for the Polymarket Gamma REST API.
 *
 * Uses Next's extended `fetch` so responses are cached in the Next Data Cache
 * with stale-while-revalidate semantics. `revalidate: 30` means: serve cached
 * data instantly, refresh in the background at most every 30 seconds.
 *
 * This only caches the slow-moving REST data (event list, titles, volumes).
 * Live prices are handled separately via the realtime layer (Jotai + PriceFeed).
 */

import {
  type GammaEventRaw,
  type PolyEvent,
  parseEvent,
} from "@/types/polymarket";

const GAMMA_BASE = "https://gamma-api.polymarket.com";
const DEFAULT_REVALIDATE_SECONDS = 30;

export type FetchEventsParams = {
  limit?: number;
  offset?: number;
  /** Gamma tag slug, e.g. "crypto", "sports", "politics" */
  tagSlug?: string;
  /** Default true — we almost never want closed events on the homepage. */
  closed?: boolean;
};

function buildUrl(path: string, params: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path, GAMMA_BASE);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }
  return url.toString();
}

/** List currently-open events, newest first. */
export async function fetchEvents(params: FetchEventsParams = {}): Promise<PolyEvent[]> {
  const {
    limit = 24,
    offset = 0,
    tagSlug,
    closed = false,
  } = params;

  const url = buildUrl("/events", {
    limit,
    offset,
    closed,
    order: "volume24hr",
    ascending: false,
    tag_slug: tagSlug,
  });

  const res = await fetch(url, {
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS, tags: ["events"] },
  });

  if (!res.ok) {
    throw new Error(`Gamma /events failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as GammaEventRaw[];
  return data.map(parseEvent);
}

/** Fetch a single event by its slug (e.g. "will-btc-hit-200k-by-eoy"). */
export async function fetchEventBySlug(slug: string): Promise<PolyEvent | null> {
  const url = buildUrl("/events", { slug });

  const res = await fetch(url, {
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS, tags: ["events", `event:${slug}`] },
  });

  if (!res.ok) {
    throw new Error(`Gamma /events?slug failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as GammaEventRaw[];
  const first = data[0];
  return first ? parseEvent(first) : null;
}
