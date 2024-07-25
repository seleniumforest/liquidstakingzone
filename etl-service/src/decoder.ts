import { decodePubkey, decodeTxRaw } from "@cosmjs/proto-signing";
import { tryParseJson } from './helpers';
import { AuthInfo, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { fromBech32 } from "@cosmjs/encoding";
import { pubkeyToAddress } from "@cosmjs/amino";
import { stride041Registry, strideLatestRegistry, strideMixedRegistry, universalRegistry } from "./constants";
import Big from "big.js";
import { BlockWithIndexedTxs, BlocksWatcherContext } from "cosmos-indexer";
import { Block } from "@cosmjs/stargate";

//<KEKW>
const decodeMsg = (msg: any) => {
    for (const reg of [strideLatestRegistry, universalRegistry, stride041Registry, strideMixedRegistry]) {
        try {
            let decoded = reg.decode(msg);
            if (decoded && validateMsg(msg.typeUrl, decoded))
                return decoded;
        } catch { }
    }
}

//add all types and use runtime validation lib
const validateMsg = (type: string, msg: any) => {
    switch (type) {
        case "/Stridelabs.stride.stakeibc.MsgLiquidStake":
        case "/stride.stakeibc.MsgLiquidStake":
            if (fromBech32(msg.creator).data.length === 20 &&
                Big(msg.amount.toString()).gt(Big(0)))
                return true;
            return false;
        case "/stride.stakeibc.MsgRedeemStake":
        case "/Stridelabs.stride.stakeibc.MsgRedeemStake":
            if (fromBech32(msg.creator).data.length === 20 &&
                Big(msg.amount.toString()).gt(Big(0)))
                return true;
            return false;
    }

    return true;
}
//</KEKW>

function tryGetSenderFromPublicKey(tx: DecodedTxRaw) {
    try {
        return pubkeyToAddress(decodePubkey(tx.authInfo.signerInfos[0].publicKey!)!, "stride")
    } catch { }
}

function tryGetSenderFromEvents(events: EventLog) {
    try {
        return events
            .find(x => x.type === "message" && x.attributes.some(y => y.key === "sender" && y.value.startsWith("stride")))
            ?.attributes.find(x => x.key === "sender")?.value
    } catch { }
}

export const decodeTxs = (_ctx: BlocksWatcherContext, block: BlockWithIndexedTxs): DecodedBlock => {
    let decodedTxs: DecodedTx[] = block?.txs
        .map(tx => {
            let decodedTx = tx;
            let senderAddr = tryGetSenderFromEvents(tx.events as any) || tryGetSenderFromPublicKey(decodedTx.tx) || "";

            decodedTx.tx.body.messages = decodedTx.tx.body.messages.map(msg => {
                let decodedMsg = decodeMsg(msg);
                if (!decodedMsg)
                    console.warn(`Cannot decode msgType ${msg.typeUrl} in block ${block.header.height}`)

                return {
                    typeUrl: msg.typeUrl,
                    value: {
                        ...decodedMsg,
                    }
                };
            });

            let result: DecodedTx = {
                height: tx.height.toString(),
                hash: tx.hash,
                index: tx.txIndex,
                sender: senderAddr,
                date: Date.parse(block.header.time),
                tx_result: {
                    ...tx.tx,
                    data: decodedTx.tx,
                    events: tx.events.map(ev => ({
                        type: ev.type,
                        attributes: ev.attributes.map(x => ({
                            key: x.key,
                            value: x.value
                        }))
                    })),
                    code: tx.code,
                    log: tryParseJson<EventLog>(tx.rawLog) || []
                }
            }

            return result;
        })

    return {
        ...block,
        txs: decodedTxs
    }
}

//[0] is denom and [1] is amount
export type CoinTuple = [string, string];

export interface DecodedTxRaw {
    readonly authInfo: AuthInfo;
    readonly body: DecodedTxBody;
    readonly signatures: readonly Uint8Array[];
}

export interface DecodedTxBody extends Omit<TxBody, "messages"> {
    messages: { typeUrl: string, value: any }[]
}

export interface DecodedBlock extends Omit<Block, "txs"> {
    txs: DecodedTx[]
}

export type EventLog = {
    type: string,
    attributes: {
        key: string,
        value: string
    }[]
}[];

export interface DecodedTx {
    sender: string,
    date: number,
    tx_result: {
        code: number;
        log: EventLog;
        data: DecodedTxRaw;
        events: EventLog;
    };
    height: string;
    index: number;
    hash: string;
}

export type TxEvent = {
    type: string;
    attributes: {
        key?: string | undefined;
        value?: string | undefined;
    }[];
};