import axios from "axios";
import { zones } from "../constants";
import { Price } from "../db";
import { randomUUID } from "../helpers";

const baseUrl = `https://api-osmosis.imperator.co/pairs/v1/historical`

export type HistoryPriceData = { time: number, open: number };

export const getStAssetsPriceHistory = async (): Promise<Price[]> => {
    let result: Price[] = [];

    for (const zone of zones) {
        let url = `${baseUrl}/${zone.stAssetPool}/chart?asset_in=${zone.zone}&asset_out=st${zone.zone}&range=1y&asset_type=symbol`;
        let { data } = await axios.get<HistoryPriceData[]>(url);

        if (!Array.isArray(data)) {
            console.warn(`osmosisImperatorApi: Couldnt fetch data for zone ${zone.zone}. Error ${data}`);
            continue;
        }

        result.push(...data.map(x => ({
            id: randomUUID(),
            coin: zone.coingeckoId,
            date: Number(x.time) * 1000,
            price: x.open,
            vsCurrency: `st${zone.zone}`
        })));
    }

    return result;
}