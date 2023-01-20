import * as dotenv from 'dotenv';
dotenv.config();
import { Block, RecieveData, Watcher } from "../apiWrapper/index";
import { Registry, registryTypes } from "./registryTypes";
import { insertStrideBlock, prepareDbToWrite } from "./clickhouse";
import { decodeTxs } from './decoder';

const processBlock = async (block: Block, registry: Registry) => {
    let blockData = decodeTxs(block, registry);
    if (blockData && blockData.header)
        await insertStrideBlock(blockData);
}

//entry point
(async () => {
    //let lastSavedBlock = await prepareDbToWrite();
    //if indexer crashes, it can start from lastSavedBlock

    
    await Watcher
        .create()
        .addNetwork({ name: "stride", fromBlock: 1866501 })
        .useBatchFetching(3)
        .recieve(
            RecieveData.HEADERS_AND_TRANSACTIONS,
            async (block) => await processBlock(block, registryTypes.strideRegistry)
           // async (block) => console.log(block.height, block.txs.length)
        )
        .run();
})();

//denom and amount
export type CoinTuple = [string, string];

export type TxEvent = {
    type: string;
    attributes: {
        key?: string | undefined;
        value?: string | undefined;
    }[];
};