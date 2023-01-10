import { Block } from "../apiWrapper/index";
import { decodeTxRaw } from "@cosmjs/proto-signing";
import { Registry } from "./registryTypes";
import { getSenderFromEvents } from './helpers';
import { AuthInfo, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";

const decodeTxs = (block: Block, registry: Registry): DecodedBlock => {
    let decodedTxs: DecodedTx[] = block.txs.map(tx => {
        let decodedTx = decodeTxRaw(Buffer.from(tx.tx || ""));
        let senderAddr = getSenderFromEvents(tx.events);

        decodedTx.body.messages = decodedTx.body.messages.map(msg => {
            let decodedMsg = registry.decode(msg);

            return {
                typeUrl: msg.typeUrl,
                value: {
                    ...decodedMsg,
                }
            };
        });;

        let result: DecodedTx = {
            sender: senderAddr,
            data: decodedTx,
            code: tx.code,
            log: tx.log,
            events: tx.events,
            index: tx.index,
            hash: tx.hash
        }

        return result;
    })

    return {
        ...block,
        txs: decodedTxs
    }
}

export { 
    decodeTxs
}

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

export interface DecodedTx {
    sender: string,
    data: DecodedTxRaw;
    code: number;
    log: string;
    events: TxEvent[];
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