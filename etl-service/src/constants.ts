import { GeneratedType, Registry as CosmjsRegistry } from "@cosmjs/proto-signing";
import { strideProtoRegistry } from "stridejs";
import { strideProtoRegistry as strideOldProtoRegistry } from "stridejsold";
import { cosmosProtoRegistry, ibcProtoRegistry } from "osmojs";
import { Registry as StrideRegistry } from "stridejs/node_modules/@cosmjs/proto-signing";
import { getStAssetPriceHistory } from "./externalServices/osmosisImperatorApi";
import { getEvmosPrices, getLunaPrices } from "./externalServices/coinhallApi";
import { PriceHistory } from "@prisma/client";

const composeMixedRegistry = () => {
    let allTypes: [string, GeneratedType][] = [];

    //[[oldTypeUrl, newTypeUrl]]
    let remappedTypes = [
        ["/Stridelabs.stride.stakeibc.MsgLiquidStake", "/stride.stakeibc.MsgLiquidStake"],
        ["/Stridelabs.stride.stakeibc.MsgRedeemStake", "/stride.stakeibc.MsgRedeemStake"],
        ["/Stridelabs.stride.stakeibc.MsgRegisterHostZone", "/stride.stakeibc.MsgRegisterHostZone"]
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
export type Zone = "cosmos" | "stars" | "osmo" | "juno" | "terra" | "evmos" |
    "inj" | "scrt" | "umee" | "comdex" | "somm" | "dydx" | "saga" | "dym" | "tia";

type PriceFetcherFn = (fromDate: number | undefined) => Promise<Omit<PriceHistory, "id">[]>;

export const priceSources: Map<string, PriceFetcherFn> = new Map([
    ["cosmos", async (from) => getStAssetPriceHistory("cosmos", from)],
    ["stars", async (from) => getStAssetPriceHistory("stars", from)],
    ["osmo", async (from) => getStAssetPriceHistory("osmo", from)],
    ["juno", async (from) => getStAssetPriceHistory("juno", from)],
    ["terra", async (from) => getLunaPrices(from)],
    ["evmos", async (from) => getEvmosPrices(from)],
    ["umee", async (from) => getStAssetPriceHistory("umee", from)],
    ["somm", async (from) => getStAssetPriceHistory("somm", from)],
    ["dydx", async (from) => getStAssetPriceHistory("dydx", from)],
    ["saga", async (from) => getStAssetPriceHistory("saga", from)],
    ["dym", async (from) => getStAssetPriceHistory("dym", from)],
    ["tia", async (from) => getStAssetPriceHistory("tia", from)]
]);

export const NetworkStartDate = 1662318000451;
export const FirstStrideBlockTimestampMs = 1662292800000;
export const EpochDuration = 21600000;

const minute = 60000;
const hour = minute * 60;
const day = hour * 24;
export const TimeSpansMs = {
    minute, hour, day
}