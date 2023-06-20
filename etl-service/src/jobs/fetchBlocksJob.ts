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

    await BlocksWatcher
        .create()
        .addNetwork({ name: "stride", fromBlock: startBlock, rpcUrls:["https://stride-rpc.quantnode.tech/"] })
        .useBatchFetching(3)
        .onRecieve(async (block) => await processBlock(block))
        .run()
})();