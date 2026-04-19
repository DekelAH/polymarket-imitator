"use client";

import { PriceCell } from "@/components/market/PriceCell";
import type { PolyEvent } from "@/types/polymarket";

const COIN_KEYWORDS = ["BTC", "ETH", "SOL", "XRP", "BNB", "DOGE", "bitcoin", "ethereum", "solana"];

function findCoinToken(event: PolyEvent): { label: string; tokenId: string } | null {
  const keyword = COIN_KEYWORDS.find((k) =>
    event.title.toUpperCase().includes(k.toUpperCase())
  );
  if (!keyword) return null;

  for (const market of event.markets) {
    const yesOutcome = market.outcomes.find(
      (o) => o.tokenId && o.name.toLowerCase() === "yes"
    );
    if (yesOutcome?.tokenId) {
      return { label: keyword.toUpperCase(), tokenId: yesOutcome.tokenId };
    }
  }
  return null;
}

export function CryptoRibbon({ events }: { events: PolyEvent[] }) {
  const coins = events
    .map(findCoinToken)
    .filter((c): c is { label: string; tokenId: string } => c !== null)
    .slice(0, 6);

  if (coins.length === 0) return null;

  return (
    <div className="border-b border-border bg-card/50">
      <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center gap-6 overflow-x-auto">
        {coins.map(({ label, tokenId }) => (
          <div key={tokenId} className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <PriceCell tokenId={tokenId} format="cents" />
          </div>
        ))}
      </div>
    </div>
  );
}
