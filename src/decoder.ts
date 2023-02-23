import { Block } from "./externalServices/tendermint/index";
import { decodePubkey, decodeTxRaw } from "@cosmjs/proto-signing";
import { apiToSmallInt, tryParseJson } from './helpers';
import { AuthInfo, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { fromBase64, fromBech32 } from "@cosmjs/encoding";
import { pubkeyToAddress } from "@cosmjs/amino";
import { stride041Registry, stride050Registry, strideMixedRegistry, universalRegistry } from "./constants";
import Big from "big.js";

//<KEKW>
const decodeMsg = (msg: any) => {
    for (const reg of [stride050Registry, universalRegistry, stride041Registry, stride050Registry, strideMixedRegistry]) {
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

export const decodeTxs = (block: Block, prefix: string = "stride"): DecodedBlock => {
    let decodedTxs: DecodedTx[] = block?.txs.map(tx => {
        let decodedTx = decodeTxRaw(Buffer.from(fromBase64(tx.tx || "")));
        let senderAddr = pubkeyToAddress(decodePubkey(decodedTx.authInfo.signerInfos[0].publicKey!)!, prefix);

        decodedTx.body.messages = decodedTx.body.messages.map(msg => {
            let decodedMsg = decodeMsg(msg);
            if (!decodedMsg)
                console.warn(`Cannot decode msgType ${msg.typeUrl} in block ${block.height}`)

            return {
                typeUrl: msg.typeUrl,
                value: {
                    ...decodedMsg,
                }
            };
        });;

        let result: DecodedTx = {
            ...tx,
            sender: senderAddr,
            date: block.date,
            tx_result: {
                ...tx.tx_result,
                data: decodedTx,
                events: tx.tx_result.events.map(ev => ({
                    type: ev.type,
                    attributes: ev.attributes.map(attr => ({
                        key: new TextDecoder().decode(fromBase64(attr.key || "")),
                        value: new TextDecoder().decode(fromBase64(attr.value || ""))
                    }))
                })),
                code: apiToSmallInt(tx.tx_result.code),
                log: tryParseJson<EventLog>(tx.tx_result.log) || []
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
        key?: string,
        value?: string
    }[]
}[];

export interface DecodedTx {
    tx?: string;
    sender: string,
    date?: number,
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