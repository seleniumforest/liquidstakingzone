import { Registry as CosmjsRegistry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";
import { getSigningStrideClientOptions } from "stridejs";
import { Registry as StrideRegistry } from "stridejs/node_modules/@cosmjs/proto-signing";

const { registry: strideTypes } = getSigningStrideClientOptions();

const registryTypes = {
    cosmosRegistry: new CosmjsRegistry(defaultRegistryTypes),
    strideRegistry: strideTypes
}

export type Registry = CosmjsRegistry | StrideRegistry

export { registryTypes };