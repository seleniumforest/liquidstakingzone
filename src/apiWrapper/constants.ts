export const isFulfilled = <T,>(p:PromiseSettledResult<T>): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';
export const isRejected = <T,>(p:PromiseSettledResult<T>): p is PromiseRejectedResult => p.status === 'rejected';

export enum RecieveData { 
    HEIGHT,
    HEADERS,
    HEADERS_AND_TRANSACTIONS
}

export const defaultRegistryUrls = [
    "https://registry.ping.pub/",
    "https://proxy.atomscan.com/directory/"
]

export enum WatcherEvents {
    BLOCK_RECIEVED = "block-recieved"
}