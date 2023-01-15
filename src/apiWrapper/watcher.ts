import { URL } from "url";
import { defaultRegistryUrls, isFulfilled, RecieveData } from './constants';
import { Chain } from "@chain-registry/types";
import { EndpointType, NetworkManager } from './networkManager';
import { ApiManager, BlockHeader, RawTx, Tx } from './apiManager';

export class Watcher {
    //chain name and block to start processing from 
    chains: [string, number | undefined][] = [];
    //depolyed chain-registry urls
    registryUrls: string[] = [];
    //data for each chain
    chainData: Map<string, Chain> = new Map();
    networks: Map<string, ApiManager> = new Map();
    callback: (block: Block) => Promise<void> = () => Promise.reject("No callback provided");
    //what kind of data to fetch
    mode: RecieveData = RecieveData.HEADERS;

    //Builder section
    private constructor(
        registryUrls: string[] = defaultRegistryUrls) {
        this.registryUrls = registryUrls;
    }

    static create(registryUrls: string[] = defaultRegistryUrls): Watcher {
        let ind = new Watcher(registryUrls);
        return ind;
    }

    addNetwork(network: string, fromHeight?: number) {
        this.chains.push([network, fromHeight]);
        return this;
    }

    addCustomRpcs(rpcs: [URL, EndpointType][]) {

    }

    addNetworks(networks: string[], fromHeight?: number) {
        networks.forEach(network => {
            this.chains.push([network, fromHeight]);
        })

        return this;
    }

    recieve(mode: RecieveData, handler: (block: Block) => Promise<void>) {
        this.mode = mode;
        this.callback = handler;

        return this;
    }

    //Execution section
    async run(): Promise<void> {
        await Promise.allSettled(this.chains.map(async ([chain, fromBlock]) => {
            while (true) {
                try {
                    let apiManager = await ApiManager.createApiManager(chain, this.registryUrls);
                    this.networks.set(chain, apiManager);
                    await this.runNetwork(chain, fromBlock);
                } catch (err) {
                    //todo handle every error type with instanceof
                    console.log(err);
                    await new Promise(res => setTimeout(res, 30000));
                }
            }
        }))
    }

    async composeBlock(chain: string, height: number): Promise<Block> {
        let api = this.networks.get(chain)!;

        if (this.mode === RecieveData.HEADERS) {
            let header = await api.getBlockHeader(height);
            return { header, height, chain, txs: [] };
        }

        if (this.mode === RecieveData.HEADERS_AND_TRANSACTIONS) {
            let [header, txs] = await Promise.allSettled([
                api.getBlockHeader(height),
                api.getTxsInBlock(height)
            ]);

            return {
                header: (header as PromiseFulfilledResult<BlockHeader>)?.value, //kekw
                txs: (txs as PromiseFulfilledResult<RawTx[]>)?.value,
                height,
                chain
            }
        }

        return { height, chain, txs: [] };
    }

    async runNetwork(chain: string, fromBlock: number | undefined): Promise<void> {
        let api = this.networks.get(chain)!;
        let lastHeight = fromBlock || 0;
        while (true) {
            let newHeight = await api.getLatestHeight(lastHeight);

            //no new block commited into network
            if (lastHeight == newHeight) {
                await new Promise(res => setTimeout(res, 1000))
                continue;
            }

            let height = lastHeight === 0 ? newHeight : lastHeight + 1
            for (; height <= newHeight; height++) {
                let block = await this.composeBlock(chain, height)
                this.callback(block);
                lastHeight = height;
            }
        }
    }
}

export interface Block {
    chain: string;
    height: number;
    header?: BlockHeader;
    txs: RawTx[];
}