import { notFound } from "next/navigation";
import { fetchEventBySlug } from "@/lib/api/gamma";
import { PriceSeeder } from "@/lib/realtime/PriceSeeder";
import { EventDetail } from "@/components/events/EventDetail";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);

  if (!event) notFound();

  const initialPrices = event.markets.flatMap((m) =>
    m.outcomes
      .filter((o) => o.tokenId !== null)
      .map((o) => ({ tokenId: o.tokenId as string, price: o.price }))
  );

  return (
    <>
      <PriceSeeder initialPrices={initialPrices} />
      <EventDetail event={event} />
    </>
  );
}
