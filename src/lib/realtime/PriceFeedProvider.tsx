"use client";

import { useEffect } from "react";
import { createSimulatedFeed } from "./simulatedFeed";
import { useStore } from "jotai";
import { priceAtomFamily, priceMetaAtomFamily } from "@/state/atoms/prices";

type InitialPrice = {
  tokenId: string
  price: number
}

export function PriceFeedProvider({ children, initialPrices = [] }: {

  children: React.ReactNode,
  initialPrices?: InitialPrice[]
}) {

  const store = useStore()

  useEffect(() => {
    const tokenIds = initialPrices.map(({ tokenId }) => tokenId)
    const feed = createSimulatedFeed(
      {
        initialPrices: initialPrices.reduce((acc, { tokenId, price }) => {
          acc[tokenId] = price
          return acc
        }, {} as Record<string, number>),
        intervalMs: [400, 1200]
      }
    )
    feed.subscribe(tokenIds)
    feed.start()
    const unsubscribe = feed.onTick(({ tokenId, price, ts }) => {
      const prevPrice = store.get(priceAtomFamily(tokenId))
      store.set(priceAtomFamily(tokenId), price)
      store.set(priceMetaAtomFamily(tokenId), {
        prev: prevPrice,
        current: price,
        direction: prevPrice < price ? 'up' : prevPrice > price ? 'down' : 'flat',
        ts
      })
    })
    return () => {
      unsubscribe()
      feed.stop()
    }
  }, [])


  return <>{children}</>;
}
