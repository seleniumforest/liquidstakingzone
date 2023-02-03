import axios from "axios";
import { denomToZone } from "../helpers";

const hostZoneUrl = "https://stride-fleet.main.stridenet.co/api/Stride-Labs/stride/stakeibc/host_zone";

export const fetchZoneInfo = async (): Promise<HostZoneConfig[]> => {
    try {
        let data = (await axios.get(hostZoneUrl)).data.host_zone;

        return data.map((zone: any) => ({
            chainId: zone.chain_id,
            zone: denomToZone(zone.host_denom),
            prefix: zone.bech32prefix,
            address: zone.address,
            redemptionRate: Number(zone.redemption_rate),
            delegationAcc: zone.delegation_account.address,
            feeAcc: zone.fee_account.address,
            redemptionAcc: zone.redemption_account.address,
            withdrawalAcc: zone.withdrawal_account.address
        }))
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