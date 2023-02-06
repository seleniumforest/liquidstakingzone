import { Registry as CosmjsRegistry } from "@cosmjs/proto-signing";
import { strideProtoRegistry } from "stridejs";
import { strideProtoRegistry as strideOldProtoRegistry } from "stridejsold";
import { cosmosProtoRegistry, ibcProtoRegistry } from "osmojs";

import { Registry as StrideRegistry } from "stridejs/node_modules/@cosmjs/proto-signing";

const composeRegistry = () => {
    let allTypes = [
        ...cosmosProtoRegistry, 
        ...strideProtoRegistry, 
        ...ibcProtoRegistry
    ];

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

export const universalRegistry = composeRegistry();

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