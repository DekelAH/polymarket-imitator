import { atom } from "jotai";
import { atomFamily } from "jotai-family";

export type PriceMeta = { 

    prev:number
    current:number
    direction: 'up' | 'down' | 'flat'
    ts: number
}

export const priceAtomFamily = atomFamily(() => atom(0))
export const priceMetaAtomFamily = atomFamily(() => atom<PriceMeta>({ prev: 0, current: 0, direction: 'flat', ts: 0 }))