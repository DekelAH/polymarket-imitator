import { EventsGrid } from "@/components/events/EventsGrid";
import { PriceSeeder } from "@/lib/realtime/PriceSeeder";
import { fetchEvents } from "@/lib/api/gamma";

export default async function HomePage() {
  const events = await fetchEvents({ limit: 48 });

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
      <EventsGrid events={events} />
    </>
  );
}
