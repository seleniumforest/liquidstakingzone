import { Registry as CosmjsRegistry } from "@cosmjs/proto-signing";
import { strideProtoRegistry } from "stridejs";
import { cosmosProtoRegistry, ibcProtoRegistry } from "osmojs";
import { Registry as StrideRegistry } from "stridejs/node_modules/@cosmjs/proto-signing";

export const registryTypes = {
    cosmosRegistry: new CosmjsRegistry(cosmosProtoRegistry),
    strideRegistry: new CosmjsRegistry(strideProtoRegistry),
    universalRegistry: new CosmjsRegistry([...cosmosProtoRegistry, ...strideProtoRegistry, ...ibcProtoRegistry])
}

export type Registry = CosmjsRegistry | StrideRegistry