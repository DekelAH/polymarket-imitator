/**
 * Types for the Polymarket Gamma API.
 *
 * The raw API returns some fields as JSON-stringified arrays (e.g. `outcomes`,
 * `outcomePrices`, `clobTokenIds`). The *Raw* types below match the wire format
 * exactly; the plain types are what our app code consumes after parsing.
 */

// ---------- Raw wire shapes (what the API actually returns) ----------

export type GammaTag = {
  id: string;
  label: string;
  slug: string;
};

export type GammaMarketRaw = {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  endDate?: string;
  /** JSON-stringified string[] — e.g. '["Yes","No"]' */
  outcomes: string;
  /** JSON-stringified string[] of decimal prices in [0,1] — e.g. '["0.62","0.38"]' */
  outcomePrices: string;
  /** JSON-stringified string[] of CLOB token IDs, aligned with `outcomes` */
  clobTokenIds?: string;
  volume?: string;
  liquidity?: string;
  active?: boolean;
  closed?: boolean;
  lastTradePrice?: number;
  image?: string;
  icon?: string;
};

export type GammaEventRaw = {
  id: string;
  ticker?: string;
  slug: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  image?: string;
  icon?: string;
  /** Dollar volume as a string — e.g. "1234567.89" */
  volume?: string;
  liquidity?: string;
  closed?: boolean;
  tags?: GammaTag[];
  markets?: GammaMarketRaw[];
};

// ---------- Parsed domain shapes (what UI code uses) ----------

export type Outcome = {
  /** e.g. "Yes" / "No" / candidate name */
  name: string;
  /** Implied probability in [0,1] */
  price: number;
  /** CLOB token id — used as the key for realtime price subscriptions */
  tokenId: string | null;
};

export type Market = {
  id: string;
  question: string;
  slug: string;
  endDate?: string;
  outcomes: Outcome[];
  volume: number;
  active: boolean;
  closed: boolean;
  image?: string;
};

export type PolyEvent = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  icon?: string;
  endDate?: string;
  volume: number;
  closed: boolean;
  tags: GammaTag[];
  markets: Market[];
};

// ---------- Parsers ----------

/** Safe JSON.parse that returns [] on any failure. */
function parseJsonArray<T>(raw: string | undefined): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseNumber(raw: string | number | undefined): number {
  if (typeof raw === "number") return raw;
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function parseMarket(raw: GammaMarketRaw): Market {
  const names = parseJsonArray<string>(raw.outcomes);
  const prices = parseJsonArray<string>(raw.outcomePrices).map(parseNumber);
  const tokens = parseJsonArray<string>(raw.clobTokenIds);

  const outcomes: Outcome[] = names.map((name, i) => ({
    name,
    price: prices[i] ?? 0,
    tokenId: tokens[i] ?? null,
  }));

  return {
    id: raw.id,
    question: raw.question,
    slug: raw.slug,
    endDate: raw.endDate,
    outcomes,
    volume: parseNumber(raw.volume),
    active: raw.active ?? true,
    closed: raw.closed ?? false,
    image: raw.image,
  };
}

export function parseEvent(raw: GammaEventRaw): PolyEvent {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    image: raw.image,
    icon: raw.icon,
    endDate: raw.endDate,
    volume: parseNumber(raw.volume),
    closed: raw.closed ?? false,
    tags: raw.tags ?? [],
    markets: (raw.markets ?? []).map(parseMarket),
  };
}
