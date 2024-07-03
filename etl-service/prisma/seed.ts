import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.zonesInfo.createMany({
        data: [
            {
                //zone is used as zone's name, but basically it's bech32 prefix
                zone: "cosmos",
                decimals: 6,
                coingeckoId: "cosmos",
                stAssetPool: 803,
                denom: "uatom",
                stDenom: "stuatom",
                registryName: "cosmoshub",
                ticker: "atom",
            },
            {
                zone: "stars",
                decimals: 6,
                coingeckoId: "stargaze",
                stAssetPool: 810,
                denom: "ustars",
                stDenom: "stustars",
                registryName: "stargaze",
            },
            {
                zone: "osmo",
                decimals: 6,
                coingeckoId: "osmosis",
                stAssetPool: 833,
                denom: "uosmo",
                stDenom: "stuosmo",
                registryName: "osmosis",
            },
            {
                zone: "juno",
                decimals: 6,
                coingeckoId: "juno-network",
                stAssetPool: 817,
                denom: "ujuno",
                stDenom: "stujuno",
                registryName: "juno",
            },
            {
                zone: "terra",
                decimals: 6,
                coingeckoId: "terra-luna-2",
                stAssetPool: 913,
                denom: "uluna",
                stDenom: "stuluna",
                registryName: "terra2",
                ticker: "luna",
            },
            {
                zone: "evmos",
                decimals: 18,
                coingeckoId: "evmos",
                stAssetPool: 922,
                denom: "aevmos",
                stDenom: "staevmos",
                registryName: "evmos",
            },
            {
                zone: "inj",
                decimals: 18,
                coingeckoId: "injective-protocol",
                denom: "inj",
                stDenom: "stinj",
                registryName: "injective",
            },
            {
                zone: "scrt",
                decimals: 6,
                coingeckoId: "secret",
                denom: "uscrt",
                stDenom: "stuscrt",
                registryName: "secretnetwork",
            },
            {
                zone: "umee",
                decimals: 6,
                coingeckoId: "umee",
                stAssetPool: 1035,
                denom: "uumee",
                stDenom: "stuumee",
                registryName: "umee",
            },
            {
                zone: "comdex",
                decimals: 6,
                coingeckoId: "comdex",
                denom: "ucmdx",
                stDenom: "stucmdx",
                registryName: "comdex",
            },
            {
                zone: "somm",
                decimals: 6,
                coingeckoId: "sommelier",
                stAssetPool: 1120,
                denom: "usomm",
                stDenom: "stusomm",
                registryName: "sommelier",
            },
            {
                zone: "dydx",
                decimals: 18,
                coingeckoId: "dydx-chain",
                stAssetPool: 1423,
                denom: "adydx",
                stDenom: "stadydx",
                registryName: "dydx",
            },
            {
                zone: "saga",
                decimals: 6,
                coingeckoId: "saga-2",
                stAssetPool: 1674,
                denom: "usaga",
                stDenom: "stusaga",
                registryName: "saga",
            },
            {
                zone: "dym",
                decimals: 18,
                coingeckoId: "dymension",
                stAssetPool: 1566,
                denom: "adym",
                stDenom: "stadym",
                registryName: "dymension",
            },
            {
                zone: "tia",
                decimals: 6,
                coingeckoId: "celestia",
                stAssetPool: 1428,
                denom: "utia",
                stDenom: "stutia",
                registryName: "celestia",
            },
            {
                zone: "haqq",
                decimals: 18,
                coingeckoId: "islamic-coin",
                stAssetPool: 1428,
                denom: "aislm",
                stDenom: "staislm",
                registryName: "haqq",
            }
        ],
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });