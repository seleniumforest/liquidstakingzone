import { BlockWithIndexedTxs, BlocksWatcher, BlocksWatcherContext, IndexerBlock } from 'cosmos-indexer';
import { decodeTxs } from '../decoder';
import { tryParseJson } from '../helpers';
import { prisma } from '../db';
import { msgsMap } from '../messages';
import { } from "../environment";

const processBlock = async (ctx: BlocksWatcherContext, b: IndexerBlock) => {
    let block = b as BlockWithIndexedTxs;

    try {
        let decodedBlock = decodeTxs(ctx, block);

        await prisma.blockHeader.create({
            data: {
                height: block.header.height,
                hash: block.id,
                date: new Date(Date.parse(block.header.time)),
                chainId: block.header.chainId
            }
        });

        let knownMsgsCount = 0;
        let unknownMsgsCount = 0;

        await prisma.transaction.createMany({
            data: decodedBlock.txs.map(tx => ({
                height: block.header.height,
                txhash: tx.hash,
                sender: tx.sender,
                txcode: tx.tx_result.code,
                date: new Date(Date.parse(block.header.time))
            }))
        });

        //insert each msg
        for (const tx of decodedBlock.txs) {
            for (const [index, msg] of tx.tx_result.data.body.messages.entries()) {
                //custom handler function for each Msg Type
                let insertMsgHandler = msgsMap.get(msg.typeUrl);
                if (!insertMsgHandler) {
                    unknownMsgsCount++;
                    continue;
                }

                try {
                    await insertMsgHandler(tx, msg.value, index);
                    knownMsgsCount++;
                }
                catch (e) {
                    console.warn(`Error handing message ${msg.typeUrl} tx ${tx.hash} height ${tx.height} err ${JSON.stringify(e, null, 4)}`);
                }
            }
        };
        console.log(`Saved block ${block.header.height} with total ${block.txs.length} transactions, ${knownMsgsCount} known messages, ${unknownMsgsCount} unknown`)
    } catch (e) {
        console.log(`Error processing block ${block.header.height} ${JSON.stringify(e, null, 4)}`);
    }
}

(async () => {
    let { _max: { height: lastKnownBlock } } = await prisma.blockHeader.aggregate({
        _max: { height: true }
    });
    if (!lastKnownBlock)
        lastKnownBlock = 0;

    let startBlock = lastKnownBlock > 0 ? (lastKnownBlock + 1) : 1;
    let customRpcs = tryParseJson(process.env.CUSTOM_RPCS) as string[] || [];

    console.log(`Starting indexer from block ${startBlock} with custom rpcs ${customRpcs}`);

    await BlocksWatcher
        .create()
        .useNetwork({
            name: "stride",
            fromBlock: startBlock,
            rpcUrls: customRpcs,
            dataToFetch: "INDEXED_TXS",
            onDataRecievedCallback: processBlock,
        })
        .useBatchFetching(10)
        .useChainRegistryRpcs()
        .useBlockCache({
            enabled: true,
            type: "mongodb",
            trimIbcProofs: true,
            url: process.env.DATABASE_RAW_URL
        })
        .run()
})();