import axios from "axios";
import { Zone, zones } from "../constants";
import { Price } from "../db";
import { randomUUID } from "../helpers";

const baseUrl = `https://api-osmosis.imperator.co/pairs/v1/historical`
export type HistoryPriceData = { time: number, open: number };

export const getStAssetPriceHistory = async (zone: Zone, from: number | undefined): Promise<Price[]> => {
    let result = [];

    try {
        let zoneInfo = zones.find(x => x.zone === zone)!;
        if (!zoneInfo) {
            console.warn(`getStAssetPriceHistory coundnt find info for zone ${zone}`);
        }

        let ticker = zoneInfo.ticker || zoneInfo.zone;
        let url = `${baseUrl}/${zoneInfo.stAssetPool}/chart?asset_in=${ticker}&asset_out=st${ticker}&range=1y&asset_type=symbol`;
        let { data } = await axios.get<HistoryPriceData[]>(url);

        result.push(
            ...data.map(x => ({
                id: randomUUID(),
                coin: zoneInfo.coingeckoId,
                date: +x.time * 1000,
                price: x.open,
                vsCurrency: `st${zoneInfo.ticker || zoneInfo.zone}`
            })).filter(x => from && x.date > from)
        );
    }
    catch (e: any) { console.error(`getStAssetsPriceHistory update error ${e?.message}`) }

    return result;
}