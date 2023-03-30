import axios from "axios";
import { Chain } from "@chain-registry/types";
import { Network } from "./blocksWatcher";
import { defaultRegistryUrls, isFulfilled } from "./constants";
import { chains } from "chain-registry";

export class NetworkManager {
    readonly minRequestsToTest: number = 20;
    readonly minSuccessRate: number = 0.85;
    readonly network: string = "";
    rpcRank: Map<string, Stats> = new Map();
    rest: string[] = [];

    private constructor(network: string, rpcEndpoints: Stats[], restEndpoints: string[] = []) {
        this.network = network;
        this.rest = restEndpoints;
        rpcEndpoints.forEach((rpc) => this.rpcRank.set(rpc.endpoint, rpc));

        console.log(`NetworkManager: Found RPCs: ${rpcEndpoints.map(x => x.endpoint).join(", ")} for network ${JSON.stringify(network)}`)
    }

    static async create(network: Network, registryUrls: string[] = defaultRegistryUrls): Promise<NetworkManager> {
        let chainData = await this.fetchChainsData(registryUrls, network.name);

        let registryRpcUrls = chainData?.apis?.rpc?.map(x => x.address)!;
        let registryRestUrls = chainData?.apis?.rest?.map(x => x.address)!;
        let customRpcUrls = network.rpcUrls || [];
        let syncedRestUrls = registryRestUrls;//await this.filterRestOutOfSync(registryRestUrls);

        if (network.fromBlock) {
            registryRpcUrls = await this.filterRpcsWithoutHistory(registryRpcUrls, network.fromBlock);
            customRpcUrls = await this.filterRpcsWithoutHistory(customRpcUrls, network.fromBlock)
        }

        let registryRpcs = this.toStats(registryRpcUrls, false);
        let customRpcs = this.toStats(network.rpcUrls, true);

        return new NetworkManager(network.name, registryRpcs.concat(customRpcs), syncedRestUrls);
    }

    static async filterRestOutOfSync(urls: string[]): Promise<string[]> {
        let result = await Promise.allSettled(urls.map(async (url) => {
            let response;
            try {
                response = await axios({
                    method: "GET",
                    url: `${url}/cosmos/base/tendermint/v1beta1/blocks/latest`,
                    timeout: 2000
                });
            } catch (_) { return Promise.reject(`${url} is dead`); }

            if (!response || response.status !== 200)
                return Promise.reject(`${url} returned ${response.status} code`);

            let nodeLastestBlock = Number(response?.data?.block?.header?.height);

            return Promise.resolve({
                rest: url,
                lastestBlock: nodeLastestBlock
            });
        }));

        //filter rpcs that are outdated more than on 20 blocks
        let fulfilled = result.filter(isFulfilled);
        let lastestBlock = Math.max(...fulfilled.map(x => x.value.lastestBlock));
        return fulfilled.filter(x => x.value.lastestBlock > lastestBlock - 20).map(x => x.value.rest);
    }

    static async filterRpcsWithoutHistory(urls: string[], fromBlock: number): Promise<string[]> {
        let result = await Promise.allSettled(urls.map(async (url) => {
            let response;
            try {
                response = await axios({
                    method: "GET",
                    url: `${url}/status`,
                    timeout: 5000
                });
            } catch (_) { return Promise.reject(`${url} is dead`); }

            if (!response || response.status !== 200)
                return Promise.reject(`${url} returned ${response.status} code`);

            let nodeEarliestBlock = Number(response?.data?.result?.sync_info?.earliest_block_height);

            if (fromBlock < nodeEarliestBlock)
                return Promise.reject(`${url} is alive, but does not have enough block history`);

            return Promise.resolve(url);
        }));

        //result.forEach(rpc => console.log(isFulfilled(rpc) ? rpc.value + " is alive" : rpc.reason));
        return result.filter(isFulfilled).map(x => x.value!);
    }

    static toStats(rpcs: string[] | undefined, priority: boolean): Stats[] {
        return rpcs ? rpcs.map(rpc => ({
            priority,
            endpoint: rpc,
            fail: 0,
            ok: 0
        })) : []
    }

    static async fetchChainsData(registryUrls: string[], chain: string): Promise<Chain> {
        for (let url of registryUrls) {
            try {
                let response = await axios.get<Chain>(
                    `${url}/${chain}/chain.json`, { timeout: 10000 }
                )

                return response.data;
            }
            catch (err: any) { console.warn(`fetchChainsData: ${err?.message}`) }
        }

        return chains.find(x => x.chain_name === chain)!

        //throw new Error("Cannot get chain info from registry");
    }

    reportStats(url: string, result: boolean): void {
        let el = this.rpcRank.get(url)!;

        this.rpcRank.set(url, result ? { ...el, ok: ++el.ok } : { ...el, fail: ++el.fail });
    }

    getRest() : string[] {
        return this.rest;
    }

    getRpcs(): string[] {
        let endpointSet = this.rpcRank;
        let result = [...endpointSet.entries()]
            .map(([_, value]) => value)
            .sort((a, b) => a.ok + a.fail > b.ok + b.fail ? 1 : -1);

        let minRequests =
            result.reduce((prev, cur) =>
                prev > cur.ok + cur.fail ? cur.ok + cur.fail : prev, Number.POSITIVE_INFINITY);

        if (minRequests < this.minRequestsToTest)
            return result
                .sort((a, _) => a.priority ? -1 : 1)
                //.map(x => {console.log(JSON.stringify(x)); return x})
                .map(x => x.endpoint);

        let res = result
            //.filter(x => x.ok / (x.ok + x.fail) > this.minSuccessRate)
            .sort((a, b) => {
                if (a.priority)
                    return -1;

                if (a.ok / a.fail <= 1)
                    return 1;

                if (b.ok / b.fail <= 1)
                    return -1;

                return (a.ok / (a.fail || 1)) > (b.ok / (b.fail || 1)) ? 1 : 0;
            });

        //res.forEach(r => console.log(JSON.stringify(r)));
        return res
            .map(x => x.endpoint);
    }
}


interface Stats {
    endpoint: string,
    priority: boolean,
    ok: number,
    fail: number
}