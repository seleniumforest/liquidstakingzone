/*
    One-time script to get transactions from fee accounts in different networks
*/
import axios from "axios";
import { decodeTxs } from "../decoder";
import { Block, RawTx } from "../externalServices/tendermint";
import { insertMsgRecvPacket } from "../messages/msgRecvPacket";
import moment from "moment";
import write from 'write';
import { fetchZoneInfo, HostZoneConfig } from "../externalServices/strideApi";

const archiveRpcs = [
    {
        zone: "cosmos",
        rpc: "https://cosmosarchive-rpc.quickapi.com:443"
    },
    {
        zone: "osmo",
        rpc: "https://osmosisarchive-rpc.quickapi.com:443"
    },
    {
        zone: "juno",
        rpc: "https://rpc-archive.junonetwork.io"
    },
    {
        zone: "stars",
        rpc: "https://rpc-stargaze.ezstaking.dev"
    }
];


const run = async () => {
    let zoneAddresses = await fetchZoneInfo();

    //todo make parallel
    for (const zone of zoneAddresses) {
        console.log("Updating " + zone.prefix)
        let rpc = archiveRpcs.find(x => x.zone === zone.prefix)!;
        if (!rpc) continue;

        let txs: any = await fetchAllTxs(zone, rpc.rpc);
        //await write(`./data/fees_collected_${zone.prefix}_${moment().format("DDMMYYYY")}.json`, JSON.stringify(txs));
        console.log(`Zone ${zone.prefix} found ${txs.length} txs`);

        for (const tx of txs) {
            let txBlock: Block = {
                txs: [tx],
                chain: zone.prefix,
                height: Number(tx.height)
            };
            let decoded = decodeTxs(txBlock, zone.prefix);

            for (const tx of decoded.txs) {
                for (const msg of tx.tx_result.data.body.messages) {
                    if (msg.typeUrl === "/ibc.core.channel.v1.MsgRecvPacket")
                        await insertMsgRecvPacket(tx, msg.value, zone.feeAcc);
                    console.log(`Inserted ${zone.prefix} tx ${tx.hash}`)
                }
            };
        }
    }
};

const fetchAllTxs = async (zone: HostZoneConfig, rpc: string): Promise<RawTx[]> => {
    let page = 1;
    let perPage = 20;
    let totalCount = 0;
    let result: RawTx[] = [];

    do {
        console.log("Trying to fetch data from " + rpc);
        let query = encodeURIComponent(`coin_received.receiver = '${zone.feeAcc}'`);
        let fetchUrl = `${rpc}/tx_search?query="${query}"&page=${page++}&per_page=${perPage}`;

        let response = await axios.get<{ result: { total_count: number, txs: RawTx[] } }>(fetchUrl);
        result.push(...response.data.result.txs);
        totalCount = Number(response.data.result.total_count);
    } while (result.length < totalCount);

    return result;
}

run();