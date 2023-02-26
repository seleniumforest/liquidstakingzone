import { defaultRegistryUrls } from './constants';
import { ApiManager, BlockHeader, RawTx } from './apiManager';

export interface Network {
    name: string,
    fromBlock?: number,
    rpcUrls?: string[]
}

export class BlocksWatcher {
    chains: Network[] = [];
    //depolyed chain-registry urls
    registryUrls: string[] = [];
    networks: Map<string, ApiManager> = new Map();
    onRecieveCallback: (block: Block) => Promise<void> = () => Promise.reject("No onRecieve callback provided");
    maxBlocksInBatch: number = 1;

    //Builder section
    private constructor(
        registryUrls: string[] = defaultRegistryUrls) {
        this.registryUrls = registryUrls;
    }

    static create(registryUrls: string[] = defaultRegistryUrls): BlocksWatcher {
        let ind = new BlocksWatcher(registryUrls);
        return ind;
    }

    addNetwork(network: Network) {
        this.chains.push(network);
        return this;
    }

    useBatchFetching(maxBlocks: number) {
        this.maxBlocksInBatch = maxBlocks;
        return this;
    }

    onRecieve(handler: (block: Block) => Promise<void>) {
        this.onRecieveCallback = handler;

        return this;
    }

    //Execution section
    async run(): Promise<void> {
        let chainWorkers = this.chains.map(async (network) => {
            while (true) {
                try {
                    let apiManager = await ApiManager.createApiManager(network, this.registryUrls);
                    this.networks.set(network.name, apiManager);
                    console.log(`Running network ${network.name} from block ${network.fromBlock}`)
                    await this.runNetwork(network);
                } catch (err) {
                    await new Promise(res => setTimeout(res, 30000));
                }
            }
        });

        await Promise.allSettled(chainWorkers);
    }

    private async composeBlock(chain: string, height: number): Promise<Block> {
        let api = this.networks.get(chain)!;
        let header = await api.getBlockHeader(height);

        return {
            header,
            txs: header.txCount === 0 ? [] : await api.getTxsInBlock(height),
            height,
            chain,
            date: header.date
        }
    }

    async runNetwork(network: Network): Promise<void> {
        let api = this.networks.get(network.name)!;
        let lastIndexedHeight = network.fromBlock ? (network.fromBlock || 1) : 0;
        let skipGetLatestHeight = false;
        let newHeight: number = -1;
        while (true) {
            if (!skipGetLatestHeight)
                newHeight = await api.getLatestHeight(lastIndexedHeight);

            //no new block commited into network
            if (lastIndexedHeight == newHeight) {
                await new Promise(res => setTimeout(res, 1000))
                continue;
            }

            let height = lastIndexedHeight === 0 ? newHeight : lastIndexedHeight
            let targetBlocks = [...Array(this.maxBlocksInBatch).keys()]
                .map(i => i + height)
                .filter(x => x <= newHeight);

            let blockResults = await Promise.allSettled(
                targetBlocks.map(async (num) => await this.composeBlock(network.name, num))
            );

            let blocks = blockResults
                .map(b => (b as PromiseFulfilledResult<Block>)?.value)
                .sort((a, b) => (Number(a.height) > Number(b.height) ? 1 : -1));

            for (let block of blocks) {
                try {
                    await this.onRecieveCallback(block);
                } catch (e: any) { console.log("Error executing callback " + e?.message + "\n" + e?.stack) }
            }

            lastIndexedHeight = height + targetBlocks.length;
            skipGetLatestHeight = lastIndexedHeight < newHeight ? true : false;
            //await new Promise(res => setTimeout(res, 5000))
        }
    }
}

export interface Block {
    chain: string;
    height: number;
    date?: number;
    header?: BlockHeader;
    txs: RawTx[];
}