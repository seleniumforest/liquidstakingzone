import { Block, RecieveData, Watcher } from "../apiWrapper/index";
import { MongoClient } from "mongodb";
import { DecodedTxRaw, decodePubkey, decodeTxRaw } from "@cosmjs/proto-signing";
import registryTypes from "./registryTypes";
import { pubkeyToAddress } from "@cosmjs/amino";
import {
    getSigningStrideClientOptions,
    strideAccountParser,
} from "stridejs";

const { registry, aminoTypes } = getSigningStrideClientOptions();
const url = "mongodb://localhost:27017/";

const decodeTxs = (block: Block) => {
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

const writeToMongo = async (decodedTx: any) => {
    let client = await MongoClient.connect(url);
    let db = client.db("indexerdb");
    let collection = db.collection("transactions");
    let result = await collection.insertOne(decodedTx);

    return result.insertedId;
}

(async () => {
    const processBlock = async (block: Block) => {
        let blockData = decodeTxs(block);
        let result = await writeToMongo(blockData);
        console.log(result)
    }

    await Watcher
        .create()
        .addNetwork("stride")
        .recieve(RecieveData.HEADERS_AND_TRANSACTIONS, processBlock)
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