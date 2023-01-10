import * as dotenv from 'dotenv'; 
dotenv.config();
import { Block, RecieveData, Watcher } from "../apiWrapper/index";
import { Registry, registryTypes } from "./registryTypes";
import { insertStrideBlock } from "./clickhouse";
import { decodeTxs } from './decoder';

const processBlock = async (block: Block, registry: Registry) => {
    let blockData = decodeTxs(block, registry);
    if (blockData && blockData.header)
        insertStrideBlock(blockData);
}


//entry point
(async () => {
    await Watcher
        .create()
        .addNetwork("stride")
        .recieve(RecieveData.HEADERS_AND_TRANSACTIONS, (block) => processBlock(block, registryTypes.strideRegistry))
        .run();
})();

export type CoinTuple = [string, string];

export type TxEvent = {
    type: string;
    attributes: {
        key?: string | undefined;
        value?: string | undefined;
    }[];
};