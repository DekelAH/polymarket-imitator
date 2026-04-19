import { PriceFeed, PriceTick } from "./priceFeed";


export function createSimulatedFeed(opts?: {

    initialPrices?: Record<string, number>
    intervalMs?: [number, number]

}): PriceFeed {

    const [minMs, maxMs] = opts?.intervalMs ?? [400, 1200]
    const prices = new Map<string, number>()
    const listeners = new Set<(tick: PriceTick) => void>()
    let timerId: ReturnType<typeof setTimeout> | null = null

    function tick(): void {

        const tokenId = Array.from(prices.keys())[Math.floor(Math.random() * prices.size)]
        if (!tokenId) return

        const currentPrice = prices.get(tokenId) ?? 0.5
        const isSpike = Math.random() < 0.1

        const nudge = isSpike ? (Math.random() - 0.5) * 0.1
            : ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * 0.03
        const newPrice = Math.min(0.99, Math.max(0.01, currentPrice + nudge))

        prices.set(tokenId, newPrice)
        listeners.forEach(listener => listener({ tokenId, price: newPrice, ts: Date.now() }))
        timerId = setTimeout(tick, minMs + Math.random() * (maxMs - minMs))
    }

    return {

        subscribe: (tokenIds: string[]): void => {
            tokenIds.forEach(tokenId => {
                prices.set(tokenId, opts?.initialPrices?.[tokenId] ?? 0.5)
            })
        },
        unsubscribe: (tokenIds: string[]): void => {
            tokenIds.forEach(tokenId => {
                prices.delete(tokenId)
            })
        },
        onTick: (callback: (tick: PriceTick) => void): () => void => {
            listeners.add(callback)
            return () => listeners.delete(callback)
        },
        start: (): void => {
            if (timerId !== null) return
            timerId = setTimeout(tick, minMs + Math.random() * (maxMs - minMs))
        },
        stop: (): void => {
            if (timerId) clearTimeout(timerId)
            timerId = null
        }
    }
}