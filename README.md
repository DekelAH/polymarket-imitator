# Polymarket Imitator

A Next.js + TypeScript clone of the Polymarket front-end, built as the PLAEE frontend
engineering assignment. Focus areas: UI/UX fidelity, live price updates, clean state
management with Jotai, and measurable performance (no full-tree re-renders).

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

- **Next.js 16** (App Router) + React 19
- **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** primitives
- **Jotai** for client state
- **@tanstack/react-query** for any client-side async state
- **framer-motion** for price-change animations
- **lucide-react** for icons

---

## Architecture

> **TODO (owner: you, filled in during Milestone 4):** 3–4 paragraphs covering:
> 1. RSC vs. client boundary — why the homepage and event detail are server
>    components, why `PriceCell` and `CategoryNav` are client components.
> 2. State split — what lives in React Query vs. Jotai vs. RSC cache, and why.
> 3. Jotai `atomFamily` for prices — how one atom per `tokenId` enables
>    surgical re-renders.
> 4. Realtime flow — `PriceFeed` interface, `SimulatedFeed` adapter, the
>    `PriceFeedProvider` bridge, subscription lifecycle.

### Folder layout

```
src/
  app/                    # Next.js routes (App Router)
    page.tsx              # homepage (events grid)
    events/[slug]/        # event detail page
    crypto/ sports/ politics/
  components/
    nav/                  # CategoryNav and friends
    events/               # EventCard, EventsGrid
    market/               # MarketRow, ProbabilityBar, PriceCell
    ui/                   # shadcn primitives
  lib/
    api/gamma.ts          # Polymarket Gamma REST client (server-side)
    realtime/             # PriceFeed interface + SimulatedFeed adapter
  state/atoms/            # Jotai atoms (prices, filters, meta)
  types/polymarket.ts     # API types + parsers
```

---

## Realtime approach

> **TODO (owner: you, filled in during Milestone 2):** describe the
> `PriceFeed` interface, why simulation by default, how the `PriceFeedProvider`
> subscribes/unsubscribes as markets mount/unmount, and how ticks flow into
> `priceAtomFamily(tokenId)` without re-rendering parents.

The assignment explicitly permits a "convincing simulation" in lieu of a real
WebSocket. Shipping with simulation keeps the demo reliable; the `PriceFeed`
interface is designed so a real CLOB WebSocket adapter can be swapped in without
touching any component.

---

## Performance notes

- Event list data is fetched server-side with `next: { revalidate: 30 }` so the
  Next.js Data Cache serves repeated requests without re-hitting Gamma.
- Prices live in `priceAtomFamily(tokenId)` — components only subscribe to the
  atoms they render, so a tick on token X re-renders exactly one `<PriceCell />`.
- `EventCard` and `MarketRow` are `React.memo`'d with stable props.
- Verified with React DevTools profiler — see screenshots in `/docs` (TODO).

---

## Limitations

- No auth, no trading, no order book interaction — this is a UI/UX replica.
- Category filtering is heuristic (matches against Gamma `tags[].slug`).
- Simulated prices random-walk around the last known REST price; they are not
  tied to real market movements when the real-WS flag is off.
- Only binary + small multi-outcome markets are styled; large (>6 outcome)
  markets get a scroll.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |
