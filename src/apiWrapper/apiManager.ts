import axios, { AxiosError } from "axios";
import { NetworkManager } from "./networkManager";
import { defaultRegistryUrls, isFulfilled } from "./constants";
import { CantGetBlockHeaderErr, CantGetLatestHeightErr } from "./errors";
import moment from "moment";
import { Network } from "./watcher";

export class ApiManager {
    readonly manager: NetworkManager;
    //empty and non-empty blocks
    blockStats: [number, number] = [0, 0];

    private constructor(manager: NetworkManager) {
        this.manager = manager;
    }

    static async createApiManager(network: Network, registryUrls: string[] = defaultRegistryUrls) {
        return new ApiManager(await NetworkManager.create(network, registryUrls));
    }

    async getLatestHeight(lastKnownHeight: number = 0): Promise<number> {
        let endpoints = this.manager.getEndpoints();

        let results = await Promise.allSettled(endpoints.map(async rpc => {
            try {
                let url = `${rpc}/status`
                let result = await axios.get(url, { timeout: 2000 });

                this.manager.reportStats(rpc, true);
                return parseInt(result?.data?.result?.sync_info?.latest_block_height);
            } catch (err: any) {
                if (err instanceof AxiosError)
                    this.manager.reportStats(rpc, false);

                return Promise.reject(err?.message);
            }
        }));

        let success = results.filter(isFulfilled).map(x => x.value) as number[];
        let result = Math.max(...success, lastKnownHeight);

        if (result === 0)
            throw new CantGetLatestHeightErr(this.manager.network, endpoints);

        return result;
    }

    async getBlockHeader(height: number): Promise<BlockHeader> {
        let endpoints = this.manager.getEndpoints();

        for (const rpc of endpoints) {
            try {
                let url = `${rpc}/block?height=${height}`
                let { data } = await axios({
                    method: "GET",
                    url,
                    timeout: 2000
                });

                this.manager.reportStats(rpc, true);
                let header = data.result.block.header;

                return {
                    height: parseInt(header.height),
                    time: moment(header.time).unix(),
                    hash: data.result.block_id.hash,
                    chainId: data.result.block.header.chain_id,
                    operatorAddress: data.result.block.header.proposer_address
                }
            } catch (err: any) {
                if (err instanceof AxiosError)
                    this.manager.reportStats(rpc, false);

                let msg = `Error fetching height in ${this.manager.network} rpc ${rpc} error : ${err?.message}`;
                //console.log(new Error(msg));
            }
        }

        throw new CantGetBlockHeaderErr(this.manager.network, height, endpoints);
    }

    async getTxsInBlock(height: number): Promise<RawTx[]> {
        let endpoints = this.manager.getEndpoints();
        //temporary empty block optimization
        let [ empty, nonEmpty ] = this.blockStats;
        let emptyBlockRatio = empty / (empty + nonEmpty);
        if (emptyBlockRatio > 0.5)
            endpoints = endpoints.slice(0, Math.round(endpoints.length / 2))

        for (const rpc of endpoints) {
            try {
                let allTxs: RawTx[] = [];
                let totalTxs: number;
                let page = 1;

                do {
                    let url = `${rpc}/tx_search?query="tx.height%3D${height}"&page=${page++}`
                    let { data: { result } }: { data: { result: TxsResponse } } =
                        await axios({
                            method: "GET",
                            url,
                            timeout: 2000
                        });

                    totalTxs = result.total_count;
                    allTxs.push(...result.txs);
                }
                while (allTxs.length < totalTxs)

                //let result: Tx[] = allTxs.map(this.decodeTx);

                if (allTxs.length !== 0) {
                    this.blockStats[1]++;
                    return allTxs;
                }
                this.manager.reportStats(rpc, true);
            } catch (err: any) {
                if (err instanceof AxiosError)
                    this.manager.reportStats(rpc, false);
            }
        }

        //probably, that's empty block
        this.blockStats[0]++;
        return [];

        //throw new CantGetTxsInBlockErr(this.manager.network, height, endpoints);
    }
}

export interface Tx {
    tx?: Uint8Array;
    code: number;
    log: string;
    data?: Uint8Array;
    events: {
        type: string,
        attributes: {
            key?: string,
            value?: string
        }[]
    }[];
    index: number;
    hash: string;
}

interface TxsResponse {
    txs: RawTx[],
    total_count: number
}

export interface BlockHeader {
    height: number,
    time: number,
    hash: string,
    chainId: string,
    operatorAddress: string
}

export interface RawTx {
    tx?: string;
    tx_result: {
        code: number;
        log: string;
        data?: string;
        events: {
            type: string,
            attributes: {
                key?: string,
                value?: string
            }[]
        }[];
    };
    height: string;
    index: number;
    hash: string;
}