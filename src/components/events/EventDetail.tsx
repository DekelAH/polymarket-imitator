"use client";

import { useMemo } from "react";
import { atom, useAtomValue } from "jotai";
import type { Market, PolyEvent } from "@/types/polymarket";
import { MarketRow } from "@/components/market/MarketRow";
import { priceAtomFamily } from "@/state/atoms/prices";

function pickRankTokenId(market: Market): string | null {
  const yes = market.outcomes.find(
    (o) => o.name.toLowerCase() === "yes" && o.tokenId
  );
  if (yes?.tokenId) return yes.tokenId;
  const best = market.outcomes
    .filter((o) => o.tokenId)
    .reduce<Market["outcomes"][number] | null>(
      (b, o) => (!b || o.price > b.price ? o : b),
      null
    );
  return best?.tokenId ?? null;
}

function fallbackRankPrice(market: Market): number {
  const yes = market.outcomes.find((o) => o.name.toLowerCase() === "yes");
  if (yes) return yes.price;
  return market.outcomes.reduce((max, o) => (o.price > max ? o.price : max), 0);
}

const CATEGORY_SLUGS = ["politics", "crypto", "sports"] as const;

function pickCategory(event: PolyEvent): string | null {
  const match = event.tags.find((t) =>
    CATEGORY_SLUGS.includes(t.slug.toLowerCase() as (typeof CATEGORY_SLUGS)[number])
  );
  return match?.label ?? null;
}

export function EventDetail({ event }: { event: PolyEvent }) {
  // Derived atom re-sorts live as each market's rank-token price ticks.
  const sortedMarketsAtom = useMemo(
    () =>
      atom((get) => {
        const ranked = event.markets.map((m) => {
          const tokenId = pickRankTokenId(m);
          const price = tokenId
            ? get(priceAtomFamily(tokenId))
            : fallbackRankPrice(m);
          return { market: m, price };
        });
        ranked.sort((a, b) => b.price - a.price);
        return ranked.map((r) => r.market);
      }),
    [event.markets]
  );

  const sortedMarkets = useAtomValue(sortedMarketsAtom);
  const category = pickCategory(event);

  return (
    <div className="max-w-4xl w-full py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">

      {/* Event header */}
      <div className="flex items-start gap-3 sm:gap-4">
        {event.image || event.icon
          ? <img
            src={event.image ?? event.icon}
            alt=""
            className="w-12 h-12 sm:w-16 sm:h-16 rounded object-cover shrink-0"
          />
          : <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted shrink-0" />
        }
        <div className="flex flex-col gap-1 min-w-0">
          {category && (
            <p className="text-xs sm:text-sm tracking-wide text-muted-foreground truncate">
              {category} · {event.tags[0].label}
            </p>
          )}
          <h1 className="text-lg sm:text-2xl font-semibold leading-snug">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Markets list — sorted by Yes price, descending */}
      <div className="flex flex-col gap-3">
        {sortedMarkets.map((market) => (
          <MarketRow key={market.id} market={market} />
        ))}
      </div>

    </div>
  );
}
