import { fetchEvents } from "@/lib/api/gamma";
import { PriceSeeder } from "@/lib/realtime/PriceSeeder";
import { EventsGrid } from "@/components/events/EventsGrid";
import { CryptoRibbon } from "@/components/nav/CryptoRibbon";

export default async function CryptoPage() {
  const events = await fetchEvents({ tagSlug: "crypto", limit: 48 });

  const initialPrices = events.flatMap((e) =>
    e.markets.flatMap((m) =>
      m.outcomes
        .filter((o) => o.tokenId !== null)
        .map((o) => ({ tokenId: o.tokenId as string, price: o.price }))
    )
  );

  return (
    <>
      <PriceSeeder initialPrices={initialPrices} />
      <div className="pt-5 pb-2">
        <h1 className="text-lg font-semibold">Crypto</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Prediction markets on crypto prices, protocols, and ecosystem events.
        </p>
      </div>
      <EventsGrid events={events} />
    </>
  );
}
