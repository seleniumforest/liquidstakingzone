import * as dotenv from 'dotenv'; 
dotenv.config();
import { Block, RecieveData, Watcher } from "../apiWrapper/index";
import { DecodedTxRaw, decodePubkey, decodeTxRaw } from "@cosmjs/proto-signing";
import { Registry, registryTypes } from "./registryTypes";
import { pubkeyToAddress } from "@cosmjs/amino";
import { insertBlockHeader } from "./clickhouse";

const decodeTxs = (block: Block, registry: Registry) => {
    let decodedTxs: DecodedTx[] = block.txs.map(tx => {
        let decodedTx = decodeTxRaw(Buffer.from(tx.tx || ""));
        let senderAddr = pubkeyToAddress(decodePubkey(decodedTx.authInfo.signerInfos[0].publicKey!)!, "cosmos");

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
            insertBlockHeader(blockData.header);
    }

    await Watcher
        .create()
        .addNetwork("stride")
        .recieve(RecieveData.HEADERS_AND_TRANSACTIONS, (block) => processBlock(block, registryTypes.strideRegistry))
        .run();
})();

interface DecodedTx {
    sender: string,
    data: DecodedTxRaw;
    code: number;
    log: string;
    events: {
        type: string;
        attributes: {
            key?: string | undefined;
            value?: string | undefined;
        }[];
    }[];
    index: number;
    hash: string;
}