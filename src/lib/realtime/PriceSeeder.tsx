"use client";

import { useEffect } from "react";
import { useStore } from "jotai";
import { createSimulatedFeed } from "./simulatedFeed";
import { priceAtomFamily, priceMetaAtomFamily } from "@/state/atoms/prices";

type InitialPrice = { tokenId: string; price: number };

export function PriceSeeder({ initialPrices }: { initialPrices: InitialPrice[] }) {
  const store = useStore();

  useEffect(() => {
    const tokenIds = initialPrices.map(({ tokenId }) => tokenId);
    const priceMap = Object.fromEntries(initialPrices.map(({ tokenId, price }) => [tokenId, price]));

    // Seed atoms immediately with REST prices
    initialPrices.forEach(({ tokenId, price }) => {
      store.set(priceAtomFamily(tokenId), price);
      store.set(priceMetaAtomFamily(tokenId), { prev: price, current: price, direction: "flat", ts: 0 });
    });

    const feed = createSimulatedFeed({ initialPrices: priceMap, intervalMs: [400, 1200] });
    feed.subscribe(tokenIds);
    feed.start();

    const unsubscribe = feed.onTick(({ tokenId, price, ts }) => {
      const prev = store.get(priceAtomFamily(tokenId));
      store.set(priceAtomFamily(tokenId), price);
      store.set(priceMetaAtomFamily(tokenId), {
        prev,
        current: price,
        direction: prev < price ? "up" : prev > price ? "down" : "flat",
        ts,
      });
    });

    return () => {
      unsubscribe();
      feed.stop();
    };
  
  }, []); 

  return null;
}
