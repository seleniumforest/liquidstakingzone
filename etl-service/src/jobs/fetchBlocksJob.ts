import * as dotenv from 'dotenv';
import { insertBlock, prepareDbToWrite } from '../db/';
import { decodeTxs } from '../decoder';
import { Block, BlocksWatcher } from '../externalServices/tendermint';
dotenv.config();

const processBlock = async (block: Block) => {
    let blockData = decodeTxs(block);
    if (blockData && blockData.header)
        await insertBlock(blockData);
}

(async () => {
    let lastKnownBlock = Number(await prepareDbToWrite());
    let startBlock = lastKnownBlock > 0 ? lastKnownBlock : 1;
    let customRpcs = JSON.parse((process.env.CUSTOM_RPCS || []) as string);

    console.log(`Starting indexer from block ${startBlock} with custom rpcs ${customRpcs}`);

    await BlocksWatcher
        .create()
        .addNetwork({ name: "stride", fromBlock: startBlock, rpcUrls: customRpcs })
        .useBatchFetching(3)
        .onRecieve(async (block) => await processBlock(block))
        .run()
})();