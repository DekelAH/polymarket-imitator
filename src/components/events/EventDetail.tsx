"use client";

import type { PolyEvent } from "@/types/polymarket";
import { MarketRow } from "@/components/market/MarketRow";

export function EventDetail({ event }: { event: PolyEvent }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">

      {/* Event header */}
      <div className="flex items-start gap-4">
        {event.image || event.icon
          // eslint-disable-next-line @next/next/no-img-element
          ? <img
              src={event.image ?? event.icon}
              alt=""
              className="w-14 h-14 rounded-full object-cover shrink-0"
            />
          : <div className="w-14 h-14 rounded-full bg-muted shrink-0" />
        }
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold leading-snug">{event.title}</h1>
          {event.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          )}
        </div>
      </div>

      {/* Markets list */}
      <div className="flex flex-col gap-3">
        {event.markets.map((market) => (
          <MarketRow key={market.id} market={market} />
        ))}
      </div>

    </div>
  );
}
