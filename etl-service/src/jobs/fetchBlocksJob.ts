import { BlocksWatcher, BlocksWatcherContext, IndexedBlock, IndexerBlock } from 'cosmos-indexer';
import { insertBlock, prepareDbToWrite } from '../db/';
import { decodeTxs } from '../decoder';
import { tryParseJson } from '../helpers';

const processBlock = async (ctx: BlocksWatcherContext, b: IndexerBlock) => {
    let block = b as IndexedBlock;
    let blockData = decodeTxs(ctx, block);
    if (blockData && blockData.header)
        await insertBlock(ctx, blockData);
}

(async () => {
    let lastKnownBlock = Number(await prepareDbToWrite());
    let startBlock = lastKnownBlock > 0 ? lastKnownBlock : 1;
    let customRpcs = tryParseJson(process.env.CUSTOM_RPCS!) as string[] || [];

    console.log(`Starting indexer from block ${startBlock} with custom rpcs ${customRpcs}`);

    await BlocksWatcher
        .create()
        .useNetwork({
            name: "stride",
            //fromBlock: startBlock,
            rpcUrls: customRpcs,
            dataToFetch: "INDEXED_TXS",
            onDataRecievedCallback: processBlock,
        })
        .useBatchFetching(5)
        .useChainRegistryRpcs()
        .run()
})();