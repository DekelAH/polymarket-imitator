"use client";

import { memo } from "react";
import Link from "next/link";
import type { PolyEvent, Market, Outcome } from "@/types/polymarket";
import { PriceCell } from "../market/PriceCell";

type EventCardProps = {
  event: PolyEvent;
};

function formatVolume(v: number) {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

/** Label used on the left of each row inside a multi-market event card. */
function marketRowLabel(m: Market) {
  return m.groupItemTitle || m.question;
}

/** Returns the "Yes" outcome of a binary market, or null if not binary/missing token. */
function yesOutcome(m: Market): Outcome | null {
  if (m.outcomes.length !== 2) return null;
  const yes = m.outcomes.find((o) => o.name.toLowerCase() === "yes") ?? m.outcomes[0];
  return yes?.tokenId ? yes : null;
}

function YesNoButtons() {
  return (
    <div className="flex gap-1 shrink-0">
      <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#1a472a] text-[#4ade80]">Yes</span>
      <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#4a1a1a] text-[#f87171]">No</span>
    </div>
  );
}

/** One row inside a multi-market card: "Gavin Newsom  27%  [Yes] [No]". */
function MarketRow({ market }: { market: Market }) {
  const yes = yesOutcome(market);
  if (!yes?.tokenId) return null;
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-sm text-foreground truncate flex-1 min-w-0">
        {marketRowLabel(market)}
      </span>
      <span className="text-[15px] font-semibold">
        <PriceCell tokenId={yes.tokenId} format="percent" />
      </span>
      <YesNoButtons />
    </div>
  );
}

/** One row for a single multi-outcome market (e.g. "Thunder  28%"). */
function OutcomeRow({ outcome }: { outcome: Outcome }) {
  if (!outcome.tokenId) return null;
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-sm text-foreground truncate flex-1 min-w-0">{outcome.name}</span>
      <span className="text-[15px] font-semibold">
        <PriceCell tokenId={outcome.tokenId} format="percent" />
      </span>
    </div>
  );
}

function EventCardImpl({ event }: EventCardProps) {
  const markets = event.markets ?? [];
  const singleMarket = markets.length === 1 ? markets[0] : null;
  const singleBinary = singleMarket && yesOutcome(singleMarket);

  // Case A: many markets (politics / elections / fed) — one row per market
  // Case B: single binary market — one row with the market question
  // Case C: single multi-outcome market (sports championship) — top outcomes of that market
  const rows: React.ReactNode = (() => {
    if (markets.length > 1) {
      const top = [...markets]
        .filter((m) => yesOutcome(m))
        .sort((a, b) => (yesOutcome(b)?.price ?? 0) - (yesOutcome(a)?.price ?? 0))
        .slice(0, 2);
      return (
        <>
          {top.map((m) => (
            <MarketRow key={m.id} market={m} />
          ))}
        </>
      );
    }
    if (singleBinary) {
      return <MarketRow market={singleMarket!} />;
    }
    if (singleMarket) {
      const top = [...singleMarket.outcomes]
        .sort((a, b) => b.price - a.price)
        .slice(0, 2);
      return (
        <>
          {top.map((o) => (
            <OutcomeRow key={o.tokenId ?? o.name} outcome={o} />
          ))}
        </>
      );
    }
    return null;
  })();

  return (
    <Link href={`/events/${event.slug}`} className="block group">
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 h-full transition-colors hover:border-border/80 hover:bg-card/80 cursor-pointer">
        <div className="flex items-center gap-2">
          {event.image || event.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.image ?? event.icon}
              alt=""
              className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">
            {event.title}
          </p>
        </div>

        <div className="flex flex-col flex-1">{rows}</div>

        <div className="text-[13px] text-muted-foreground border-t border-border pt-2">
          {formatVolume(event.volume)} Vol.
        </div>
      </div>
    </Link>
  );
}

export const EventCard = memo(EventCardImpl);
