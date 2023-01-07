import axios from "axios";
import { Chain } from "@chain-registry/types";

export class NetworkManager {
    readonly minRequestsToTest: number = 20;
    readonly minSuccessRate: number = 0.85;
    readonly network: string = "";
    rpcRank: Map<string, Stats> = new Map();
    restRank: Map<string, Stats> = new Map();

    private constructor(network: string, rpcEndpoints: string[], restEnpoints: string[]) {
        this.network = network;

        [...rpcEndpoints.entries()].forEach(([_, rpc]) => {
            let rpcUrl = rpc.toString();
            this.rpcRank.set(rpcUrl, { ok: 0, fail: 0, endpoint: rpcUrl });
        });
        
        [...restEnpoints.entries()].forEach(([_, rest]) => {
            let rpcUrl = rest.toString();
            this.restRank.set(rpcUrl, { ok: 0, fail: 0, endpoint: rpcUrl });
        });
    }

    static async create(network: string, registryUrls: string[], customRpcs: Endpoint[] = []): Promise<NetworkManager> {
        let chainData = await this.fetchChainsData(registryUrls, network);
        //let aliveRpc = await this.filterAliveRpcs(chainData?.apis?.rpc?.map(x => new URL(x.address))!)
        //let aliveRest = await this.filterAliveRest(chainData?.apis?.rest?.map(x => new URL(x.address))!)

        let aliveRpc = chainData?.apis?.rpc?.map(x => x.address)!
            .concat(customRpcs.filter(x => x.type === "rpc").map(x => x.url))!;

        let aliveRest = chainData?.apis?.rest?.map(x => x.address)!
            .concat(customRpcs.filter(x => x.type === "rest").map(x => x.url))!;

        return new NetworkManager(network, aliveRpc, aliveRest);
    }

    //checks, is rpc alive and synced or not, not sure do we need this
    // static async filterAliveRpcs(urls: URL[]): Promise<URL[]> {
    //     if (urls == null || urls.length === 0)
    //         return Promise.reject("no rpcs");

    //     let alive = await Promise.allSettled(urls.map(async (url) => {
    //         let response;
    //         try {
    //             response = await axios({
    //                 method: "GET",
    //                 url: `${url}/status`,
    //                 timeout: 5000
    //             });
    //         } catch (_) {
    //             return Promise.reject(`${url} is dead`);
    //         }

    //         if (!response || response.status !== 200)
    //             return Promise.reject(`${url} returned ${response.status} code`);

    //         let blockTime = Date.parse(response.data.result.sync_info.latest_block_time);
    //         let now = Date.now();

    //         if (Math.abs(now - blockTime) >= 60000)
    //             return Promise.reject(`${url} is alive, but not synced`);

    //         return Promise.resolve(url);
    //     }));
    //     alive.forEach(rpc => console.log(isFulfilled(rpc) ? rpc.value.href + "is alive" : rpc.reason));
    //     return alive.filter(isFulfilled).map(x => x.value!);
    // }

    // static async filterAliveRest(urls: URL[]): Promise<URL[]> {
    //     if (urls == null || urls.length === 0)
    //         return Promise.reject("no rpcs");

    //     let alive = await Promise.allSettled(urls.map(async (url) => {
    //         let response;
    //         try {
    //             response = await axios({
    //                 method: "GET",
    //                 url: `${url}/blocks/latest`,
    //                 timeout: 5000
    //             });
    //         } catch (_) {
    //             return Promise.reject(`${url} is dead`);
    //         }

    //         if (!response || response.status !== 200)
    //             return Promise.reject(`${url} returned ${response.status} code`);

    //         let blockTime = Date.parse(response.data.block.header.time);
    //         let now = Date.now();

    //         if (Math.abs(now - blockTime) < 60000)
    //             return Promise.reject(`${url} is alive, but not synced`);

    //         return Promise.resolve(url);
    //     }));

    //     alive.forEach(rpc => console.log(isFulfilled(rpc) ? rpc.value.href + "is alive" : rpc.reason));

    //     return alive.filter(isFulfilled).map(x => x.value!);
    // }

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

    reportStats(endpoint: Endpoint, result: boolean): void {
        let el = (endpoint.type === "rest" ? this.restRank : this.rpcRank).get(endpoint.url)!;
        
        (endpoint.type === "rest" ? this.restRank : this.rpcRank)
            .set(endpoint.url, result ? { ...el, ok: ++el.ok} : { ...el, fail: ++el.fail});
    }

    getEndpoints(type: EndpointType): string[] {
        let endpointSet = type === "rpc" ? this.rpcRank : this.restRank;
        let result = [...endpointSet.entries()]
            .map(([_, value]) => value)
            .sort((a, b) => a.ok + a.fail > b.ok + b.fail ? 1 : -1);

        let minRequests =
            result.reduce((prev, cur) =>
                prev > cur.ok + cur.fail ? cur.ok + cur.fail : prev, Number.POSITIVE_INFINITY);

        if (minRequests < this.minRequestsToTest)
            return result.map(x => x.endpoint);

        return result
            .filter(x => x.ok / (x.ok + x.fail) > this.minSuccessRate)
            .sort((a, b) => {
                if (a.ok / a.fail <= 1)
                    return 1;

                if (b.ok / b.fail <= 1)
                    return -1;

                return (a.ok / (a.fail || 1)) > (b.ok / (b.fail || 1)) ? 1 : 0;
            })
            .map(x => x.endpoint);
    }
}


interface Stats {
    endpoint: string,
    ok: number,
    fail: number
}

export type EndpointType = "rest" | "rpc";
export interface Endpoint {
    url: string,
    type: EndpointType
}