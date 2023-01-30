import axios from "axios";
import { getLastCollectedFeesHeight, insertBlock } from "../clickhouse";
import { decodeTxs } from "../decoder";
import { defaultRegistry, earliestPossibleBlocks } from "../helpers";
import { insertMsgRecvPacket } from "../messages/msgRecvPacket";
import { Block, NetworkManager, RawTx } from "./tendermint";

const $1hourInMs = 3600 * 1000;
const hostZoneUrl = "https://stride-fleet.main.stridenet.co/api/Stride-Labs/stride/stakeibc/host_zone";

export const runHostZoneWatcher = async () => {
    setInterval(updateJob, $1hourInMs * 6);
    await updateJob();
}

const updateJob = async () => {
    console.log(`Update host zones transactions job: ${new Date()}`);
    let zoneAddresses = await fetchZoneAddresses();
    let lastBlocks = await getLastCollectedFeesHeight();

    for (const zone of zoneAddresses) {
        console.log("Updating network " + zone.prefix)
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
            let decoded = decodeTxs(txBlock, defaultRegistry, zone.prefix);

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

//todo make caching into db
const fetchZoneAddresses = async (): Promise<HostZoneConfig[]> => {
    try {
        let data = (await axios.get(hostZoneUrl)).data.host_zone;

        return data.map((zone: any) => ({
            zone: zone.chain_id,
            prefix: zone.bech32prefix,
            address: zone.address,
            delegationAcc: zone.delegation_account.address,
            feeAcc: zone.fee_account.address,
            redemptionAcc: zone.redemption_account.address,
            withdrawalAcc: zone.withdrawal_account.address
        }))
    }
    catch (e: any) {
        console.log("Error fetching zone config");
        return [];
    }
}

const prefixToRegistryName = (prefix: string): string => {
    switch (prefix) {
        case "cosmos": return "cosmoshub";
        case "osmo": return "osmosis";
        case "stars": return "stargaze";
        default: return prefix;
    }
}

interface HostZoneConfig {
    zone: string,
    prefix: string,
    address: string,
    delegationAcc: string,
    feeAcc: string,
    redemptionAcc: string,
    withdrawalAcc: string
}