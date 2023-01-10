import * as dotenv from 'dotenv'; 
dotenv.config();
import { Block, RecieveData, Watcher } from "../apiWrapper/index";
import { decodeTxRaw } from "@cosmjs/proto-signing";
import { Registry, registryTypes } from "./registryTypes";
import { insertStrideBlock } from "./clickhouse";
import { AuthInfo, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { getSenderFromEvents } from './helpers';

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

(async () => {
    const processBlock = async (block: Block, registry: Registry) => {
        let blockData = decodeTxs(block, registry);
        if (blockData.header)
            insertStrideBlock(blockData);
    }

    await Watcher
        .create()
        .addNetwork("stride", 1853450)
        .recieve(RecieveData.HEADERS_AND_TRANSACTIONS, (block) => processBlock(block, registryTypes.strideRegistry))
        .run();
})();

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

export type TxEvent = {
    type: string;
    attributes: {
        key?: string | undefined;
        value?: string | undefined;
    }[];
};

export interface DecodedTx {
    sender: string,
    data: DecodedTxRaw;
    code: number;
    log: string;
    events: TxEvent[];
    index: number;
    hash: string;
}