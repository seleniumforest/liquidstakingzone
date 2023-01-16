import * as dotenv from 'dotenv';
dotenv.config();
import { Block, RecieveData, Watcher } from "../apiWrapper/index";
import { Registry, registryTypes } from "./registryTypes";
import { insertStrideBlock } from "./clickhouse";
import { decodeTxs } from './decoder';

const processBlock = async (block: Block, registry: Registry) => {
    let blockData = decodeTxs(block, registry);
    if (blockData && blockData.header)
        await insertStrideBlock(blockData);
}

//entry point
(async () => {
    await Watcher
        .create()
        .addNetwork("stride", 1934121)
        .useBatchFetching(20)
        .recieve(
            RecieveData.HEADERS_AND_TRANSACTIONS,
            //async (block) => await processBlock(block, registryTypes.strideRegistry)
            async (block) => console.log(block.height, block.txs.length)
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