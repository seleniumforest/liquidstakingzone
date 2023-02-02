import * as dotenv from 'dotenv';
import { insertBlock, prepareDbToWrite } from '../clickhouse';
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
    let startBlock = lastKnownBlock > 0 ? lastKnownBlock : undefined;

    await Watcher
        .create()
        .addNetwork({ name: "stride", fromBlock: startBlock })
        .useBatchFetching(3)
        .recieve(async (block) => await processBlock(block, registryTypes.universalRegistry))
        .run()
})();