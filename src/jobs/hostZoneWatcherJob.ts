import axios from "axios";
import { decodeTxs } from "../decoder";
import { insertMsgRecvPacket } from "../messages/msgRecvPacket";
import { fetchZoneInfo, HostZoneConfig } from "../externalServices/strideApi";
import { Block, NetworkManager, RawTx } from "../externalServices/tendermint";
import { insertRedemptionRate } from "../messages/msgLiquidStake";
import { schedule } from "node-cron";
import { getLastCollectedFeesHeight } from "../db";
import { earliestPossibleBlocks, universalRegistry } from "../constants";

export const hostZoneWatcherJob = async () => {
    console.log(`Update host zones transactions job: ${new Date()}`);
    let zoneInfo = await fetchZoneInfo();
    let lastBlocks = await getLastCollectedFeesHeight();

    for (const zone of zoneInfo) {
        console.log("Updating network " + zone.prefix);
        //set exact redemption rate for current epoch
        await insertRedemptionRate(Date.now(), zone.redemptionRate, zone.zone, true);
        
        if (lastBlocks.length === 0) {
            console.warn("hostZoneWatcherJob: history data hasn't been populated, skipping fetching txs from other zones");
            continue;
        }

        //update fee txs from other zones
        let lastSavedBlock =
            lastBlocks.find(x => x.zone === zone.prefix)?.height ||
            earliestPossibleBlocks.find(x => x.zone === zone.prefix)?.height;

        let zoneEnpoints = await NetworkManager.create({
            name: prefixToRegistryName(zone.prefix),
            fromBlock: lastSavedBlock
        });

        let txs = await fetchAllTxs(zone, lastSavedBlock!, zoneEnpoints.getEndpoints());
        console.log(`Zone ${zone.prefix} found ${txs.length} txs`);

        for (const tx of txs) {
            let txBlock: Block = {
                txs: [tx],
                chain: zone.prefix,
                height: Number(tx.height)
            };
            let decoded = decodeTxs(txBlock, zone.prefix);

            for (const tx of decoded.txs)
                for (const msg of tx.tx_result.data.body.messages) {
                    if (msg.typeUrl !== "/ibc.core.channel.v1.MsgRecvPacket")
                        return;

                    await insertMsgRecvPacket(tx, msg.value, zone.feeAcc);
                    console.log(`Inserted ${zone.prefix} tx ${tx.hash}`)
                }
        }
    }

    console.log(`Finished update host zones transactions job: ${new Date()}`)
};

const fetchAllTxs = async (zone: HostZoneConfig, lastSavedBlock: number, endpoints: string[]): Promise<RawTx[]> => {
    let totalCount = 0;
    let result: RawTx[] = [];

    for (const endp of endpoints) {
        let page = 1;
        let perPage = 20;

        try {
            do {
                console.log("Trying to fetch data from " + endp);
                let query = encodeURIComponent(`tx.height > ${lastSavedBlock} AND coin_received.receiver = '${zone.feeAcc}'`);
                let fetchUrl = `${endp}/tx_search?query="${query}"&page=${page++}&per_page=${perPage}`;

                let response = await axios.get<{ result: { total_count: number, txs: RawTx[] } }>(fetchUrl, { timeout: 30000 });
                result.push(...response.data.result.txs);
                totalCount = Number(response.data.result.total_count);
            } while (result.length < totalCount);
            break;
        } catch (e: any) {
            console.log(e?.message);
            result = [];
        }
    }
    return result;
}

const prefixToRegistryName = (prefix: string): string => {
    switch (prefix) {
        case "cosmos": return "cosmoshub";
        case "osmo": return "osmosis";
        case "stars": return "stargaze";
        default: return prefix;
    }
}

(async () => {
    //setInterval(hostZoneWatcherJob, timeSpans.hour * 6);
    //01:01, 07:01, 13:01, 19:01 every day
    schedule("0 1 1,7,13,19 * * * *", hostZoneWatcherJob);
    await hostZoneWatcherJob();
})();