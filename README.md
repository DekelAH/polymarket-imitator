# Polymarket Imitator

A Next.js + TypeScript clone of the Polymarket front-end, built as the PLAEE
frontend engineering assignment. Focus areas: UI/UX fidelity, live price
updates, and clean state management with Jotai — with an emphasis on surgical
re-renders so no full component-tree re-renders occur on every price tick.

---

## Setup

```bash
npm install
npm run dev
# open http://localhost:3000
```

Requirements: Node ≥ 18.18. Tested on Node 22.16.

---

## Tech Stack

- **Next.js 16** (App Router, RSC by default) + React 19
- **TypeScript** (strict)
- **Tailwind CSS v4** + a few `shadcn/ui` primitives (Button, Badge, Skeleton, Tabs)
- **Jotai** for client state (no Redux, per spec)
- **@tanstack/react-query** provider wired, available for future client fetches
- **framer-motion** for price-change flash animations
- **base-ui** for low-level UI primitives

---

## Pages

| Route | Description |
|---|---|
| `/` | Main events grid, all categories, sorted by 24h volume |
| `/politics` | Politics-filtered events (`tag_slug=politics`) |
| `/sports` | Sports-filtered events (`tag_slug=sports`) |
| `/crypto` | Crypto-filtered events (`tag_slug=crypto`) + live coin price ribbon |
| `/events/[slug]` | Event detail: all markets with name, price, probability bar, live-sorted |

---

## Architecture

### RSC vs client boundary

Page shells are React Server Components — `app/page.tsx`, the three category
pages, and `app/events/[slug]/page.tsx` all `await fetchEvents(…)` on the
server. Initial HTML arrives with real data.

Client boundaries are drawn as narrowly as possible around the pieces that
genuinely need interactivity or reactive state:

- **`PriceSeeder`** — mounted once per route inside the server page shell.
  Seeds the Jotai atom pool from the server-fetched REST prices, then runs
  the simulated feed. No UI output of its own.
- **`EventCard`**, **`MarketRow`**, **`EventDetail`** — client because they
  read Jotai atoms; wrapped in `React.memo` with stable props so they only
  re-render when their market structure changes, not on every price tick.
- **`PriceCell`**, **`ProbabilityBar`**, **`YesNoButtons`**, **`YesPill`**,
  **`NoPill`** — the smallest possible client leaves. Each subscribes to a
  single `priceAtomFamily(tokenId)`. A tick on token X re-renders only the
  cells that read that atom.

### State split

| Layer | What lives there | Why |
|---|---|---|
| **Next Data Cache** | Event lists, titles, volumes, outcome structure | Slow-moving; `revalidate: 30` means repeated loads are instant |
| **Jotai `atomFamily`** | One price atom per `tokenId` | Fast-moving; surgical subscriptions — only the cell that reads token X re-renders when X ticks |
| **Jotai `priceMetaAtomFamily`** | `{ prev, current, direction, ts }` per token | Drives the green/red flash animation without extra timers |
| **Derived atom (EventDetail)** | `atom((get) => markets sorted by live price)` | Re-sorts the market list on every tick without re-rendering any row that hasn't changed position |
| **React Query** | Not used in current app | Provider present; available for future client-side fetching without refactoring |

### Why `atomFamily` is the right primitive

The alternative — one `atom<Record<tokenId, number>>` — would force every
price-reading component to re-render on every tick for every token. With 50+
subscribed tokens and ticks every few hundred ms, that would be unusable.

With `atomFamily`, a `PriceCell` for token X subscribes to exactly one `atom(0)`
keyed on X. A tick on token Y never touches that subscription. Verified in
React DevTools profiler: a single tick re-renders only the one `PriceCell`,
one `ProbabilityBar`, and any `YesPill`/`NoPill` that reference the ticked
token — never the enclosing `MarketRow`, `EventCard`, or page.

---

## Folder layout

```
src/
  app/                         # Next.js App Router routes
    layout.tsx                 # Shell: header + CategoryNav + responsive gutter
    page.tsx                   # Homepage (server)
    events/[slug]/             # Event detail: page + loading + not-found
    crypto/ sports/ politics/  # Category pages (server)
    loading.tsx                # Skeleton for homepage / category pages
    error.tsx                  # Route-level error boundary

  components/
    events/                    # EventsGrid, EventCard, EventDetail
    market/                    # MarketRow, ProbabilityBar, PriceCell, YesNoButtons
    nav/                       # CategoryNav, Logo, CryptoRibbon
    ui/                        # shadcn primitives (Badge, Button, Skeleton, Tabs)

  lib/
    api/gamma.ts               # Gamma REST client (server-side, ISR-cached)
    providers.tsx              # Jotai + React Query providers
    realtime/
      priceFeed.ts             # PriceFeed interface + PriceTick type
      simulatedFeed.ts         # In-browser price simulator (swappable)
      PriceSeeder.tsx          # Bridge: REST snapshot → Jotai atoms → feed

  state/atoms/prices.ts        # priceAtomFamily + priceMetaAtomFamily
  types/polymarket.ts          # Gamma raw/parsed types + parsers
```

---

## Realtime approach

The spec allows a "convincing simulation" instead of a real WebSocket. This
app ships with simulation but behind a swappable `PriceFeed` interface so a
real WebSocket can drop in without touching any component.

### `PriceFeed` interface

```ts
interface PriceFeed {
  subscribe(tokenIds: string[]): void
  unsubscribe(tokenIds: string[]): void
  onTick(callback: (tick: PriceTick) => void): () => void
  start(): void
  stop(): void
}
```

Any implementation conforming to this interface can replace
`createSimulatedFeed` inside `PriceSeeder.tsx` — no component changes needed.

### `SimulatedFeed`

Each tick, picks a batch of N distinct tokens (≈5% of the subscribed pool,
clamped `[1, 8]`) and nudges each price by a small normally-distributed amount.
10% of ticks are "spikes" with a wider range for visible eye-catching moves.
Prices are clamped to `(0.01, 0.99)`. Batching per-tick keeps all markets
feeling alive even with 50+ tokens — something on screen updates every
400–1200 ms while any individual token sees an update every 4–10 seconds.

### Subscription lifecycle

`PriceSeeder` is mounted once per route in the server page shell:

1. Seeds `priceAtomFamily(tokenId)` + `priceMetaAtomFamily(tokenId)` from the
   REST snapshot so the first paint shows real prices, not zeros.
2. Creates a `SimulatedFeed`, subscribes all tokenIds for the current page,
   calls `feed.start()`.
3. On each `onTick`, writes to the two atoms for the ticked token. Only leaf
   cells subscribed to that token re-render.
4. On route unmount: removes the tick listener and calls `feed.stop()`.

### Price-change highlight

`priceMetaAtomFamily` stores `direction: 'up' | 'down' | 'flat'` recomputed
on every write. `PriceCell` and the Yes/No buttons wrap their price text in a
`motion.span` keyed by `meta.ts`, animating `backgroundColor` from green/red
to transparent over 600ms — the subtle flash bonus called out in the spec, with
no extra timers.

---

## Performance notes

- **Server-side caching**: `next: { revalidate: 30, tags: [...] }` on all
  Gamma fetches. Repeated route visits are served from the Next Data Cache
  instantly; individual events can be invalidated by tag.
- **Per-token atomic state**: Each `PriceCell` / `ProbabilityBar` / `YesPill`
  / `NoPill` reads exactly one `priceAtomFamily` atom. Ticks on other tokens
  do not touch those subscriptions.
- **`React.memo` boundaries**: `EventCard`, `MarketRow`, `PriceCell`,
  `ProbabilityBar`, `YesNoButtons` are all memoised on stable props (tokenIds
  + plain strings). The card grid does not re-render on price ticks.
- **Derived sort atom**: The event detail page uses an `atom((get) => sort(…))`
  inside `useMemo`. The atom, not the component, subscribes to rank tokens so
  the list reorders on ticks without re-rendering rows that haven't moved.

---

## Limitations

- **No real WebSocket.** The spec permits simulation; swapping in the real
  Polymarket WS is a one-file change in `PriceSeeder.tsx`.
- **No auth, trading, or order book.** UI/UX replica only, per spec ("Focus
  on replicating UX accurately, not adding features").
- **Category detection.** Events are matched to categories by
  checking `tags[].slug` against `['politics', 'crypto', 'sports']`.
- **Simulated prices random-walk** from the last REST snapshot — not tied to
  real market movements.
- **Gamma responses can exceed the 2 MB Next Data Cache limit.** A warning
  appears in dev logs; data still serves correctly — it bypasses the cache for
  that request and hits Gamma directly.

---

## Scripts

`npm run dev`
`npm run build`
`npm start`
