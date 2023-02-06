import { Block } from "./externalServices/tendermint/index";
import { decodePubkey, decodeTxRaw } from "@cosmjs/proto-signing";
import { apiToSmallInt, tryParseJson } from './helpers';
import { AuthInfo, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { fromBase64 } from "@cosmjs/encoding";
import { pubkeyToAddress } from "@cosmjs/amino";
import { universalRegistry } from "./constants";

export const decodeTxs = (block: Block, prefix: string = "stride"): DecodedBlock => {
    let decodedTxs: DecodedTx[] = block?.txs.map(tx => {
        let decodedTx = decodeTxRaw(Buffer.from(fromBase64(tx.tx || "")));
        let senderAddr = pubkeyToAddress(decodePubkey(decodedTx.authInfo.signerInfos[0].publicKey!)!, prefix);

        decodedTx.body.messages = decodedTx.body.messages.map(msg => {
            let decodedMsg = universalRegistry.decode(msg);
            
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