"use client";

import { memo } from "react";
import type { Market, Outcome } from "@/types/polymarket";
import { ProbabilityBar } from "./ProbabilityBar";
import { PriceCell } from "./PriceCell";
import { YesNoButtons } from "./YesNoButtons";

type MarketRowProps = {
  market: Market;
};

function formatVolume(v: number) {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function findBinary(outcomes: Outcome[]) {
  if (outcomes.length !== 2) return null;
  const yes = outcomes.find((o) => o.name.toLowerCase() === "yes" && o.tokenId);
  const no = outcomes.find((o) => o.name.toLowerCase() === "no" && o.tokenId);
  if (!yes || !no) return null;
  return { yes, no };
}

function MarketRowImpl({ market }: MarketRowProps) {
  const outcomes = market.outcomes.filter((o) => o.tokenId !== null);
  const binary = findBinary(outcomes);

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="text-md font-medium">{market.question}</div>

      {binary ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProbabilityBar tokenId={binary.yes.tokenId!} />
            </div>
            <div className="w-12 text-right">
              <PriceCell tokenId={binary.yes.tokenId!} format="percent" />
            </div>
          </div>
          <YesNoButtons
            yesTokenId={binary.yes.tokenId!}
            noTokenId={binary.no.tokenId!}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {outcomes.map((outcome) => (
            <div key={outcome.tokenId} className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs text-muted-foreground w-20 sm:w-28 shrink-0 truncate">
                {outcome.name}
              </span>
              <div className="flex-1 min-w-0">
                <ProbabilityBar tokenId={outcome.tokenId!} />
              </div>
              <div className="w-12 text-right shrink-0">
                <PriceCell tokenId={outcome.tokenId!} format="percent" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-[13px] text-muted-foreground border-t border-border pt-2">
        {formatVolume(market.volume)} Vol.
      </div>
    </div>
  );
}

export const MarketRow = memo(MarketRowImpl);
