"use client";

import { memo } from "react";
import type { Market } from "@/types/polymarket";
import { ProbabilityBar } from "./ProbabilityBar";
import { PriceCell } from "./PriceCell";

type MarketRowProps = {
  market: Market;
};

function formatVolume(v: number) {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function MarketRowImpl({ market }: MarketRowProps) {
  const outcomes = market.outcomes.filter((o) => o.tokenId !== null);

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="text-sm font-medium">{market.question}</div>

      <div className="flex flex-col gap-2">
        {outcomes.map((outcome) => (
          <div key={outcome.tokenId} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">
              {outcome.name}
            </span>
            <div className="flex-1">
              <ProbabilityBar tokenId={outcome.tokenId!} />
            </div>
            <div className="w-12 text-right">
              <PriceCell tokenId={outcome.tokenId!} format="percent" />
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground border-t border-border pt-2">
        {formatVolume(market.volume)} Vol.
      </div>
    </div>
  );
}

export const MarketRow = memo(MarketRowImpl);
