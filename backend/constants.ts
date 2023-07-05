export const supportedZones = ["cosmos", "osmo", "juno", "terra", "evmos", "stars", "umee", "inj", "scrt"] as const;

export type Zone = typeof supportedZones[number];

export type ZoneInfo = {
    zone: Zone,
    coingeckoId: string,
    sortOrder: number,
    ticker?: string
}

export const zones: ZoneInfo[] = [
    {
        zone: "cosmos",
        coingeckoId: "cosmos",
        sortOrder: 1,
        ticker: "atom"
    },
    {
        zone: "stars",
        coingeckoId: "stargaze",
        sortOrder: 5
    },
    {
        zone: "osmo",
        coingeckoId: "osmosis",
        sortOrder: 2
    },
    {
        zone: "juno",
        coingeckoId: "juno-network",
        sortOrder: 3
    },
    {
        zone: "terra",
        coingeckoId: "terra-luna-2",
        sortOrder: 4,
        ticker: "luna"
    },
    {
        zone: "evmos",
        coingeckoId: "evmos",
        sortOrder: 6
    },
    {
        zone: "inj",
        coingeckoId: "injective-protocol",
        sortOrder: 7
    },
    {
        zone: "umee",
        coingeckoId: "umee",
        sortOrder: 8
    }
]