import { fetchEvents } from "@/lib/api/gamma";
import { PriceSeeder } from "@/lib/realtime/PriceSeeder";
import { EventsGrid } from "@/components/events/EventsGrid";

export default async function SportsPage() {
  const events = await fetchEvents({ tagSlug: "sports", limit: 48 });

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
      <div className="max-w-screen-2xl mx-auto w-full">
        <div className="px-4 pt-5 pb-2">
          <h1 className="text-lg font-semibold">Sports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Prediction markets on match outcomes, championships, and player performance.
          </p>
        </div>
        <EventsGrid events={events} />
      </div>
    </>
  );
}
