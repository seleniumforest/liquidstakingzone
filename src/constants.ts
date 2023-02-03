import { Registry as CosmjsRegistry } from "@cosmjs/proto-signing";
import { strideProtoRegistry } from "stridejs";
import { cosmosProtoRegistry, ibcProtoRegistry } from "osmojs";
import { Registry as StrideRegistry } from "stridejs/node_modules/@cosmjs/proto-signing";

export const universalRegistry = new CosmjsRegistry([
    ...cosmosProtoRegistry, 
    ...strideProtoRegistry, 
    ...ibcProtoRegistry
]);

export type Registry = CosmjsRegistry | StrideRegistry
//export type Zone = "atom" | "stars" | "osmo" | "juno" | "luna";

export const earliestPossibleBlocks = [
    { zone: "cosmos", height: 11925500 },
    { zone: "osmo", height: 5880000 },
    { zone: "juno", height: 4663000 },
    { zone: "stars", height: 4520000 }
];

const minute = 60000;
const hour = minute * 60;
const day = hour * 24;
export const timeSpans = {
    minute, hour, day
}