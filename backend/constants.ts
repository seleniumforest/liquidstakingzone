export const supportedZones = ["atom", "osmo", "juno", "luna", "evmos", "stars"] as const;

export type Zone = typeof supportedZones[number];

export type ZoneInfo = {
    zone: Zone,
    decimals: number,
    coingeckoId: string,
    stAssetPool: number
}

export const zones: ZoneInfo[] = [
    {
        zone: "atom",
        decimals: 6,
        coingeckoId: "cosmos",
        stAssetPool: 803
    },
    {
        zone: "stars",
        decimals: 6,
        coingeckoId: "stargaze",
        stAssetPool: 810
    },
    {
        zone: "osmo",
        decimals: 6,
        coingeckoId: "osmosis",
        stAssetPool: 833
    },
    {
        zone: "juno",
        decimals: 6,
        coingeckoId: "juno-network",
        stAssetPool: 817
    },
    {
        zone: "luna",
        decimals: 6,
        coingeckoId: "terra-luna-2",
        stAssetPool: 913
    },
    {
        zone: "evmos",
        decimals: 18,
        coingeckoId: "evmos",
        stAssetPool: 922
    }
]