// import * as dotenv from 'dotenv';
// dotenv.config();
// import { Block, Watcher } from "./integrations/tendermint/index";
// import { Registry, registryTypes } from "./registryTypes";
// import { insertBlock } from "./clickhouse";
// import { decodeTxs } from './decoder';
// import { fetchTokenPriceHistory, runPriceUpdateJob } from './integrations/coingecko';
// import { runHostZoneWatcher } from './integrations/hostZones';
// import { fromBase64 } from '@cosmjs/encoding';

// const processBlock = async (block: Block, registry: Registry) => {
//     let blockData = decodeTxs(block, registry);
//     if (blockData && blockData.header)
//         await insertBlock(blockData);
// }

// const hostZoneWatcherJob = async() => await runHostZoneWatcher();
// const priceUpdateJob = async () => await runPriceUpdateJob();
// const fetchBlocksJob = async () =>
//     await Watcher
//         .create()
//         .addNetwork({ name: "stride" })
//         .useBatchFetching(3)
//         .recieve(
//             //async (block) => await processBlock(block, registryTypes.strideRegistry)
//              async (block) => console.log(block.height, block.txs.length)
//         )
//         .run();

// //entry point
// (async () => {
//     //let lastSavedBlock = await prepareDbToWrite();
//     //if indexer crashes, it can start from lastSavedBlock
//     await Promise.allSettled([
//         hostZoneWatcherJob(),
//         //priceUpdateJob(),
//         //fetchBlocksJob()
//     ]);
// })();