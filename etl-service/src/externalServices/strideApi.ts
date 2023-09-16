import axios from "axios";
import { denomToZone } from "../helpers";
import NodeCache from "node-cache";

const baseUrl = "https://stride-fleet.main.stridenet.co";
const cache = new NodeCache({
    stdTTL: 600
});
let key = "fetchZoneInfo";

export const fetchZonesInfo = async (): Promise<HostZoneConfig[]> => {
    let cached = cache.get<HostZoneConfig[]>(key);
    if (cached)
        return cached;

    try {
        let data = (await axios.get(baseUrl + "/api/Stride-Labs/stride/stakeibc/host_zone")).data.host_zone;

        let result = data.map((zone: any) => ({
            chainId: zone.chain_id,
            zone: denomToZone(zone.host_denom),
            hostDenom: zone.host_denom,
            prefix: zone.bech32prefix,
            address: zone.deposit_address,
            redemptionRate: Number(zone.redemption_rate),
            delegationAcc: zone.delegation_ica_address,
            feeAcc: zone.fee_ica_address,
            redemptionAcc: zone.redemption_ica_address,
            withdrawalAcc: zone.withdrawal_ica_address
        }));

        cache.set(key, result);
        return result;
    }
    catch (e: any) {
        console.log(`fetchZoneInfo: Error fetching zone info ${e?.message}`);
        return [];
    }
}

export const fetchUserRedemptionRecords = async (): Promise<UserRedemptionRecord[] | undefined> => {
    try {
        let nextKey;

        do {
            let url = baseUrl + "/api/Stride-Labs/stride/records/user_redemption_record?pagination.limit=1000";
            if (nextKey)
                url += `&pagination.key=${nextKey}`;
            let data = await axios.get(url);
            nextKey = data.data.pagination.next_key;
            let result = data.data.user_redemption_record;

            return result as UserRedemptionRecord[];
        } while (nextKey)
    }
    catch (e: any) { console.log(`fetchUserRedemptionRecords Error ` + e?.message) }
}

export interface UserRedemptionRecord {
    id: string,
    sender: string,
    receiver: string,
    amount: string
    denom: string,
    host_zone_id: string,
    epoch_number: number,
    claim_is_pending: boolean
}

export interface HostZoneConfig {
    chainId: string,
    prefix: string,
    zone: string,
    address: string,
    delegationAcc: string,
    feeAcc: string,
    redemptionAcc: string,
    withdrawalAcc: string,
    redemptionRate: number,
    hostDenom: string
}