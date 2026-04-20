"use client";

import { memo } from "react";
import Link from "next/link";
import { useAtomValue } from "jotai";
import type { PolyEvent, Market, Outcome } from "@/types/polymarket";
import { PriceCell } from "../market/PriceCell";
import { priceAtomFamily } from "@/state/atoms/prices";

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

function noOutcome(m: Market): Outcome | null {
  if (m.outcomes.length !== 2) return null;
  const no = m.outcomes.find((o) => o.name.toLowerCase() === "no") ?? m.outcomes[1];
  return no?.tokenId ? no : null;
}

/** Multi-market only: compact pills; live % only when hovering that pill (named group avoids outer Link `group`). */
function YesPill({ tokenId }: { tokenId: string }) {
  const price = useAtomValue(priceAtomFamily(tokenId));
  return (
    <span className="group/pill relative w-[40px] h-[27px] shrink-0 text-xs font-medium rounded bg-[#1a472a] text-[#4ade80] inline-flex items-center justify-center box-border transition-colors duration-150 hover:bg-[#15803d] hover:text-[#bbf7d0]">
      <span className="group-hover/pill:hidden">Yes</span>
      <span className="hidden group-hover/pill:inline tabular-nums">{`${Math.round(price * 100)}%`}</span>
    </span>
  );
}

function NoPill({ tokenId }: { tokenId: string }) {
  const price = useAtomValue(priceAtomFamily(tokenId));
  return (
    <span className="group/pill relative w-[40px] h-[27px] shrink-0 text-xs font-medium rounded bg-[#4a1a1a] text-[#f87171] inline-flex items-center justify-center box-border transition-colors duration-150 hover:bg-[#b91c1c] hover:text-[#fecaca]">
      <span className="group-hover/pill:hidden">No</span>
      <span className="hidden group-hover/pill:inline tabular-nums">{`${Math.round(price * 100)}%`}</span>
    </span>
  );
}

function YesNoPillsMulti({ yesTokenId, noTokenId }: { yesTokenId: string; noTokenId: string }) {
  return (
    <div className="flex gap-1 shrink-0">
      <YesPill tokenId={yesTokenId} />
      <NoPill tokenId={noTokenId} />
    </div>
  );
}

/** Single-binary card: large buttons — card hover deepens bg; button hover brightens like multi-market pills. */
function YesNoBigButtons() {
  return (
    <div className="flex gap-2">
      <span className="flex-1 h-9 flex items-center justify-center rounded-md text-sm font-semibold bg-[#1a472a]/50 text-[#4ade80] transition-colors duration-150 group-hover/card:bg-[#1a472a] hover:bg-[#15803d] hover:text-[#bbf7d0]">
        Yes
      </span>
      <span className="flex-1 h-9 flex items-center justify-center rounded-md text-sm font-semibold bg-[#4a1a1a]/50 text-[#f87171] transition-colors duration-150 group-hover/card:bg-[#4a1a1a] hover:bg-[#b91c1c] hover:text-[#fecaca]">
        No
      </span>
    </div>
  );
}

/** Multi-market row: outcome label, %, then hover pills. */
function MarketRowMulti({ market }: { market: Market }) {
  const yes = yesOutcome(market);
  const no = noOutcome(market);
  if (!yes?.tokenId || !no?.tokenId) return null;
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-sm text-foreground truncate flex-1 min-w-0">
        {marketRowLabel(market)}
      </span>
      <span className="text-[15px] font-semibold">
        <PriceCell tokenId={yes.tokenId} format="percent" />
      </span>
      <YesNoPillsMulti yesTokenId={yes.tokenId} noTokenId={no.tokenId} />
    </div>
  );
}

/** Single-binary card: leading chance + big Yes/No (no % on button hover). */
function BinaryMarketBody({ market }: { market: Market }) {
  const yes = yesOutcome(market);
  if (!yes?.tokenId) return null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold leading-none">
          <PriceCell tokenId={yes.tokenId} format="percent" />
        </span>
        <span className="text-xs text-muted-foreground">chance</span>
      </div>
      <YesNoBigButtons />
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

  const rows: React.ReactNode = (() => {
    if (markets.length > 1) {
      const top = [...markets]
        .filter((m) => yesOutcome(m) && noOutcome(m))
        .sort((a, b) => (yesOutcome(b)?.price ?? 0) - (yesOutcome(a)?.price ?? 0))
        .slice(0, 2);
      return (
        <>
          {top.map((m) => (
            <MarketRowMulti key={m.id} market={m} />
          ))}
        </>
      );
    }
    if (singleBinary) {
      return <BinaryMarketBody market={singleMarket!} />;
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
    <Link href={`/events/${event.slug}`} className="block group/card">
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
