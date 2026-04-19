/**
 * TEMPORARY smoke-test page.
 *
 * Proves the data pipeline works end-to-end:
 *   RSC → fetchEvents() → Gamma API → parseEvent() → rendered HTML.
 *
 * This file will be replaced in Milestone 3 with the real EventsGrid layout.
 */

import { fetchEvents } from "@/lib/api/gamma";

export default async function HomePage() {
  const events = await fetchEvents({ limit: 10 });

  return (
    <main className="mx-auto max-w-3xl p-8 font-sans">
      <h1 className="text-2xl font-semibold mb-4">
        Smoke test: Polymarket Gamma API
      </h1>
      <p className="text-sm text-neutral-500 mb-6">
        If you can see event titles below, the data layer works. This page is
        scaffolding only — it will be rebuilt as the Polymarket-style grid.
      </p>

      <ol className="space-y-3">
        {events.map((e) => (
          <li key={e.id} className="border rounded-md p-3">
            <div className="font-medium">{e.title}</div>
            <div className="text-xs text-neutral-500 mt-1">
              {e.markets.length} market{e.markets.length === 1 ? "" : "s"} ·
              {" "}vol ${Math.round(e.volume).toLocaleString()} ·
              {" "}tags: {e.tags.map((t) => t.label).join(", ") || "—"}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
