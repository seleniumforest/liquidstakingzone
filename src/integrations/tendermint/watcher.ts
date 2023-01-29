import { defaultRegistryUrls, RecieveData } from './constants';
import { Chain } from "@chain-registry/types";
import { ApiManager, BlockHeader, RawTx, Tx } from './apiManager';

export interface Network {
    name: string,
    fromBlock?: number,
    rpcUrls?: string[]
}

export class Watcher {
    chains: Network[] = [];
    //depolyed chain-registry urls
    registryUrls: string[] = [];
    //data for each chain
    chainData: Map<string, Chain> = new Map();
    networks: Map<string, ApiManager> = new Map();
    callback: (block: Block) => Promise<void> = () => Promise.reject("No callback provided");
    //what kind of data to fetch
    mode: RecieveData = RecieveData.HEADERS;
    maxBlocksInBatch: number = 1;

    //Builder section
    private constructor(
        registryUrls: string[] = defaultRegistryUrls) {
        this.registryUrls = registryUrls;
    }

    static create(registryUrls: string[] = defaultRegistryUrls): Watcher {
        let ind = new Watcher(registryUrls);
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

    recieve(mode: RecieveData, handler: (block: Block) => Promise<void>) {
        this.mode = mode;
        this.callback = handler;

        return this;
    }

    //Execution section
    async run(): Promise<void> {
        await Promise.allSettled(this.chains.map(async (network) => {
            while (true) {
                try {
                    let apiManager = await ApiManager.createApiManager(network, this.registryUrls);
                    this.networks.set(network.name, apiManager);
                    await this.runNetwork(network);
                } catch (err) {
                    //todo handle every error type with instanceof
                    //console.log(err);
                    await new Promise(res => setTimeout(res, 30000));
                }
            }
        }))
    }

    private async composeBlock(chain: string, height: number): Promise<Block> {
        let api = this.networks.get(chain)!;

        if (this.mode === RecieveData.HEADERS) {
            let header = await api.getBlockHeader(height);
            return { header, height, chain, txs: [] };
        }

        if (this.mode === RecieveData.HEADERS_AND_TRANSACTIONS) {
            let header = await api.getBlockHeader(height);

            return {
                header,
                txs: header.txCount === 0 ? [] : await api.getTxsInBlock(height),
                height,
                chain
            }
        }

        return { height, chain, txs: [] };
    }

    async runNetwork(network: Network): Promise<void> {
        let api = this.networks.get(network.name)!;
        let lastHeight = network.fromBlock ? (network.fromBlock - 1 || 1) : 0;
        let skipGetLastHeight = false;
        let newHeight: number = -1;
        while (true) {
            if (!skipGetLastHeight)
                newHeight = await api.getLatestHeight(lastHeight);

            //no new block commited into network
            if (lastHeight == newHeight) {
                await new Promise(res => setTimeout(res, 1000))
                continue;
            }

            let height = lastHeight === 0 ? newHeight : lastHeight
            let targetBlocks = [...Array(this.maxBlocksInBatch).keys()]
                .map(i => i + height)
                .filter(x => x <= newHeight);

            let blockResults = await Promise.allSettled(
                targetBlocks.map(async (num) => await this.composeBlock(network.name, num))
            );

            let blocks = blockResults
                .map(b => (b as PromiseFulfilledResult<Block>)?.value)
                .sort((a, b) => (Number(a.height) > Number(b.height) ? 1 : -1));

            for (let block of blocks)
                await this.callback(block);

            lastHeight = height + targetBlocks.length;
            skipGetLastHeight = lastHeight < newHeight ? true : false;
            //await new Promise(res => setTimeout(res, 5000))
        }
    }
}

export interface Block {
    chain: string;
    height: number;
    header?: BlockHeader;
    txs: RawTx[];
}