import * as dotenv from 'dotenv';
import { getLastBlock, insertBlock, prepareDbToWrite } from '../clickhouse';
import { decodeTxs } from '../decoder';
import { Block, Watcher } from '../integrations/tendermint';
import { Registry, registryTypes } from '../registryTypes';
dotenv.config();

const processBlock = async (block: Block, registry: Registry) => {
    let blockData = decodeTxs(block, registry);
    if (blockData && blockData.header)
        await insertBlock(blockData);
}
(async () => {
    let lastKnownBlock = Number(await prepareDbToWrite());
    let lastStartBlock = lastKnownBlock > 0 ? lastKnownBlock : undefined;

    await Watcher
        .create()
        .addNetwork({ name: "stride", fromBlock: lastStartBlock })
        .useBatchFetching(3)
        .recieve(async (block) => await processBlock(block, registryTypes.universalRegistry))
        .run()
})();