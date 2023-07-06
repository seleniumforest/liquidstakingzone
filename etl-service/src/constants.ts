import { GeneratedType, Registry as CosmjsRegistry } from "@cosmjs/proto-signing";
import { strideProtoRegistry } from "stridejs";
import { strideProtoRegistry as strideOldProtoRegistry } from "stridejsold";
import { cosmosProtoRegistry, ibcProtoRegistry } from "osmojs";
import { Registry as StrideRegistry } from "stridejs/node_modules/@cosmjs/proto-signing";
import { Price } from "./db";
import { getStAssetPriceHistory } from "./externalServices/osmosisImperatorApi";
import { getEvmosPrices, getLunaPrices } from "./externalServices/coinhallApi";

const composeMixedRegistry = () => {
    let allTypes: [string, GeneratedType][] = [];

    //[[oldTypeUrl, newTypeUrl]]
    let remappedTypes = [
        ["/Stridelabs.stride.stakeibc.MsgLiquidStake", "/stride.stakeibc.MsgLiquidStake"],
        ["/Stridelabs.stride.stakeibc.MsgRedeemStake", "/stride.stakeibc.MsgRedeemStake"],
        ["/Stridelabs.stride.stakeibc.MsgRegisterHostZone", "/stride.stakeibc.MsgRegisterHostZone"],
        ["/Stridelabs.stride.stakeibc.MsgClaimUndelegatedTokens", "/stride.stakeibc.MsgClaimUndelegatedTokens"],
        ["/Stridelabs.stride.stakeibc.MsgRebalanceValidators", "/stride.stakeibc.MsgRebalanceValidators"],
        ["/Stridelabs.stride.stakeibc.MsgAddValidator", "/stride.stakeibc.MsgAddValidator"],
        ["/Stridelabs.stride.stakeibc.MsgChangeValidatorWeight", "/stride.stakeibc.MsgChangeValidatorWeight"],
        ["/Stridelabs.stride.stakeibc.MsgDeleteValidator", "/stride.stakeibc.MsgDeleteValidator"],
        ["/Stridelabs.stride.stakeibc.MsgRestoreInterchainAccount", "/stride.stakeibc.MsgRestoreInterchainAccount"],
        ["/Stridelabs.stride.stakeibc.MsgUpdateValidatorSharesExchRate", "/stride.stakeibc.MsgUpdateValidatorSharesExchRate"],
        ["/Stridelabs.stride.stakeibc.MsgClearBalance", "/stride.stakeibc.MsgClearBalance"],
        ["/Stridelabs.stride.stakeibc.MsgSetAirdropAllocations", "/stride.stakeibc.MsgSetAirdropAllocations"],
        ["/Stridelabs.stride.stakeibc.MsgClaimFreeAmount", "/stride.stakeibc.MsgClaimFreeAmount"],
        ["/Stridelabs.stride.stakeibc.MsgCreateAirdrop", "/stride.stakeibc.MsgCreateAirdrop"],
        ["/Stridelabs.stride.stakeibc.MsgDeleteAirdrop", "/stride.stakeibc.MsgDeleteAirdrop"],
        ["/stride.interchainquery.MsgSubmitQueryResponse", "/stride.interchainquery.v1.MsgSubmitQueryResponse"]
      //  '/stride.interchainquery.v1.MsgSubmitQueryResponse'
    ];

    remappedTypes.forEach(([oldTypeUrl, newTypeUrl]) => {
        let targetTypeHandler = strideOldProtoRegistry.find(x => x[0] === newTypeUrl)?.[1]!;
        if (!targetTypeHandler) return;

        allTypes.push([oldTypeUrl, targetTypeHandler]);
    });

    return new CosmjsRegistry(allTypes);
}

export const strideMixedRegistry = composeMixedRegistry();
export const stride041Registry = new CosmjsRegistry(strideOldProtoRegistry);
export const strideLatestRegistry = new CosmjsRegistry(strideProtoRegistry as [string, GeneratedType][]);
export const universalRegistry = new CosmjsRegistry([
    ...cosmosProtoRegistry, 
    ...strideProtoRegistry as [string, GeneratedType][], 
    ...ibcProtoRegistry
]);

export type Registry = CosmjsRegistry | StrideRegistry
export type Zone = "cosmos" | "stars" | "osmo" | "juno" | "terra" | "evmos" | "inj" | "scrt" | "umee" | "comdex";

export type ZoneInfo = {
    zone: Zone,
    decimals: number,
    coingeckoId: string,
    stAssetPool?: number,
    denom: string, 
    stDenom: string,
    registryName: string,
    ticker?: string,
    stAssetPriceFetchFn?: (fromDate: number | undefined) => Promise<Price[]>
}

export const zones: ZoneInfo[] = [
    {
        zone: "cosmos",
        decimals: 6,
        coingeckoId: "cosmos",
        stAssetPool: 803,
        denom: "uatom",
        stDenom: "stuatom",
        registryName: "cosmoshub",
        ticker: "atom",
        stAssetPriceFetchFn: async (from) => getStAssetPriceHistory("cosmos", from)
    },
    {
        zone: "stars",
        decimals: 6,
        coingeckoId: "stargaze",
        stAssetPool: 810,
        denom: "ustars",
        stDenom: "stustars",
        registryName: "stargaze",
        stAssetPriceFetchFn: async (from) => getStAssetPriceHistory("stars", from)
    },
    {
        zone: "osmo",
        decimals: 6,
        coingeckoId: "osmosis",
        stAssetPool: 833,
        denom: "uosmo",
        stDenom: "stuosmo",
        registryName: "osmosis",
        stAssetPriceFetchFn: async (from) => getStAssetPriceHistory("osmo", from)
    },
    {
        zone: "juno",
        decimals: 6,
        coingeckoId: "juno-network",
        stAssetPool: 817,
        denom: "ujuno",
        stDenom: "stujuno",
        registryName: "juno",
        stAssetPriceFetchFn: async (from) => getStAssetPriceHistory("juno", from)
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
        stAssetPriceFetchFn: async (from) => getLunaPrices(from)
    },
    {
        zone: "evmos",
        decimals: 18,
        coingeckoId: "evmos",
        stAssetPool: 922,
        denom: "aevmos",
        stDenom: "staevmos",
        registryName: "evmos",
        stAssetPriceFetchFn: async (from) => getEvmosPrices(from)
    },
    {
        zone: "inj",
        decimals: 18,
        coingeckoId: "injective-protocol",
        //stAssetPool: 922,
        denom: "inj",
        stDenom: "stinj",
        registryName: "injective",
    },
    {
        zone: "scrt",
        decimals: 6,
        coingeckoId: "secret",
        //stAssetPool: 922,
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
        stAssetPriceFetchFn: async (from) => getStAssetPriceHistory("umee", from)
    },
    {
        zone: "comdex",
        decimals: 6,
        coingeckoId: "comdex",
        //stAssetPool: 922,
        denom: "ucmdx",
        stDenom: "stucmdx",
        registryName: "comdex"
    }
]

const minute = 60000;
const hour = minute * 60;
const day = hour * 24;
export const timeSpans = {
    minute, hour, day
}