import { BlocksWatcher, IndexedBlock } from 'cosmos-indexer';
import * as dotenv from 'dotenv';
import { insertBlock, prepareDbToWrite } from '../db/';
import { decodeTxs } from '../decoder';
import { tryParseJson } from '../helpers';
dotenv.config();

const processBlock = async (block: IndexedBlock) => {
    let blockData = decodeTxs(block);
    if (blockData && blockData.header)
        await insertBlock(blockData);
}

(async () => {
    let lastKnownBlock = Number(await prepareDbToWrite());
    let startBlock = lastKnownBlock > 0 ? lastKnownBlock : 1;
    let customRpcs = tryParseJson(process.env.CUSTOM_RPCS!) as string[] || [];

    console.log(`Starting indexer from block ${startBlock} with custom rpcs ${customRpcs}`);

    await BlocksWatcher
        .create()
        .addNetwork({ name: "stride", fromBlock: startBlock, rpcUrls: customRpcs, dataToFetch: "INDEXED_TXS" })
        .useBatchFetching(5)
        .useChainRegistryRpcs()
        .onBlockRecieved(async (_ctx, block) => await processBlock(block as IndexedBlock))
        .run()
})();