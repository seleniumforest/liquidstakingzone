import axios from "axios";
import { Chain } from "@chain-registry/types";
import { Network } from "./watcher";
import { isFulfilled } from "./constants";

export class NetworkManager {
    readonly minRequestsToTest: number = 20;
    readonly minSuccessRate: number = 0.85;
    readonly network: string = "";
    rpcRank: Map<string, Stats> = new Map();

    private constructor(network: string, rpcEndpoints: Stats[]) {
        this.network = network;

        console.log(`Starting network ${network}`);
        rpcEndpoints.forEach((rpc) => {
            let rpcUrl = rpc.endpoint;
            console.log(`Found rpc ${rpcUrl}`);
            this.rpcRank.set(rpcUrl, rpc);
        });
    }

    static async create(network: Network, registryUrls: string[]): Promise<NetworkManager> {
        let chainData = await this.fetchChainsData(registryUrls, network.name);

        let registryRpcUrls = chainData?.apis?.rpc?.map(x => x.address)!;
        let customRpcUrls = network.rpcUrls || [];
        if (network.fromBlock) {
            registryRpcUrls = await this.filterRpcsWithoutHistory(registryRpcUrls, network.fromBlock);
            customRpcUrls = await this.filterRpcsWithoutHistory(customRpcUrls, network.fromBlock)
        }

        let registryRpcs = this.toStats(registryRpcUrls, false);
        let customRpcs = this.toStats(network.rpcUrls, true);

        return new NetworkManager(network.name, registryRpcs.concat(customRpcs));
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

        result.forEach(rpc => console.log(isFulfilled(rpc) ? rpc.value + "is alive" : rpc.reason));
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
                    `${url}/${chain}/chain.json`,
                    { timeout: 10000 })

                return response.data;
            }
            catch (err: any) { console.log(err?.message) }
        }

        throw new Error("Cannot get chain info from registry");
    }

    reportStats(url: string, result: boolean): void {
        let el = this.rpcRank.get(url)!;

        this.rpcRank.set(url, result ? { ...el, ok: ++el.ok } : { ...el, fail: ++el.fail });
    }

    getEndpoints(): string[] {
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
                .map(x => {console.log(JSON.stringify(x)); return x})
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

        res.forEach(r => console.log(JSON.stringify(r)));
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