import axios from "axios";
import NodeCache from "node-cache";
import { prisma } from "../db";

const baseurl = "https://stride-fleet.main.stridenet.co";
const cache = new NodeCache({
    stdTTL: 600
});
const cacheKey = "fetchIcaZonesInfo";
const tiaZoneInfoUrl = baseurl + "/api/Stride-Labs/stride/staketia/host_zone";
const dymZoneInfoUrl = baseurl + "/api/Stride-Labs/stride/stakedym/host_zone";

/* Tia and dym do not have interchain accounts */
export async function fetchAllZonesInfo() {
    const [icaZones, tia, dym] = await Promise.all([
        fetchIcaZonesInfo(),
        fetchZoneInfo(tiaZoneInfoUrl),
        fetchZoneInfo(dymZoneInfoUrl)
    ]);

    return [...icaZones, tia, dym];
}

export async function fetchIcaZonesInfo(): Promise<HostZoneConfig[]> {
    let cached = cache.get<HostZoneConfig[]>(cacheKey);
    if (cached)
        return cached;

    try {
        let url = baseurl + "/api/Stride-Labs/stride/stakeibc/host_zone";
        let data = (await axios.get(url)).data.host_zone;
        let zones = await prisma.zonesInfo.findMany({});

        let result = data.map((zone: any) => ({
            chainId: zone.chain_id,
            zone: zones.find(x => x.denom === zone.host_denom),
            hostDenom: zone.host_denom,
            prefix: zone.bech32prefix,
            address: zone.deposit_address,
            redemptionRate: Number(zone.redemption_rate),
            delegationAcc: zone.delegation_ica_address,
            feeAcc: zone.fee_ica_address,
            redemptionAcc: zone.redemption_ica_address
        }));

        cache.set(cacheKey, result);
        return result;
    }
    catch (e: any) {
        console.log(`fetchIcaZonesInfo: Error fetching zone info ${e?.message}`);
        return [];
    }
}

async function fetchZoneInfo(url: string) {
    const key = `fetchZoneInfo:${url}`;
    let cached = cache.get<HostZoneConfig>(key);
    if (cached)
        return cached;

    try {
        let data = (await axios.get(url)).data.host_zone;
        let zones = await prisma.zonesInfo.findMany({});
        let zoneMatch = zones.find(x => x.denom === data.native_token_denom);
        if (!zoneMatch) {
            return Promise.reject(`fetchZoneInfo: zone ${data.native_token_denom} does not exists`);
        }
        
        let result: HostZoneConfig = {  
            chainId: data.chain_id,
            zone: zoneMatch.zone,
            hostDenom: data.native_token_denom,
            prefix: zoneMatch.zone,
            address: data.deposit_address,
            redemptionRate: Number(data.redemption_rate),
            delegationAcc: data.delegation_address,
            feeAcc: "",
            redemptionAcc: data.redemption_address
        }

        cache.set<HostZoneConfig>(key, result);
        return result;
    }
    catch (e: any) {
        let msg = `fetchZoneInfo: Error fetching zone info ${e?.message}`;
        console.log(msg);
        return Promise.reject(msg);
    }
}

export async function fetchUserRedemptionRecords(): Promise<UserRedemptionRecord[] | undefined> {
    try {
        let nextKey;

        do {
            let url = baseurl + "/api/Stride-Labs/stride/records/user_redemption_record?pagination.limit=1000";
            if (nextKey)
                url += `&pagination.key=${nextKey}`;
            let data = await axios.get(url);
            nextKey = data.data.pagination.next_key;
            let result = data.data.user_redemption_record;

            return result as UserRedemptionRecord[];
        } while (nextKey);
    }
    catch (e: any) { console.log(`fetchUserRedemptionRecords Error ` + e?.message); }
}

export interface UserRedemptionRecord {
    id: string,
    sender: string,
    receiver: string,
    st_token_amount: string
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
    redemptionRate: number,
    hostDenom: string
}