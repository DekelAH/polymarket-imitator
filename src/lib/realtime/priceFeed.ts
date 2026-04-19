export interface PriceFeed {

    subscribe(tokenIds: string[]): void
    unsubscribe(tokenIds: string[]): void
    onTick(callback: (tick: PriceTick) => void): () => void
    start(): void
    stop(): void
}

export type PriceTick = { 
    
    tokenId: string
    price: number
    ts: number 
}
