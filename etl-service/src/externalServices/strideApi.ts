import axios from "axios";
import { denomToZone } from "../helpers";
import NodeCache from "node-cache";

const hostZoneUrl = "https://stride-fleet.main.stridenet.co/api/Stride-Labs/stride/stakeibc/host_zone";
const cache = new NodeCache({
    stdTTL: 600  
});
let key = "fetchZoneInfo";

export const fetchZonesInfo = async (): Promise<HostZoneConfig[]> => {
    let cached = cache.get<HostZoneConfig[]>(key);
    if (cached)
        return cached;

    try {
        let data = (await axios.get(hostZoneUrl)).data.host_zone;

        let result = data.map((zone: any) => ({
            chainId: zone.chain_id,
            zone: denomToZone(zone.host_denom),
            prefix: zone.bech32prefix,
            address: zone.address,
            redemptionRate: Number(zone.redemption_rate),
            delegationAcc: zone.delegation_account.address,
            feeAcc: zone.fee_account.address,
            redemptionAcc: zone.redemption_account.address,
            withdrawalAcc: zone.withdrawal_account.address
        }));

        cache.set(key, result);
        return result;
    }
    catch (e: any) {
        console.log(`fetchZoneInfo: Error fetching zone info ${e?.message}`);
        return [];
    }
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
    redemptionRate: number
}