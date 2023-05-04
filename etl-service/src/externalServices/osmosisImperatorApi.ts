import axios from "axios";
import { zones } from "../constants";
import { Price } from "../db";
import { randomUUID } from "../helpers";

const baseUrl = `https://api-osmosis.imperator.co/pairs/v1/historical`
const evmosUrl = `https://api-osmosis.imperator.co/pairs/v1/historical/922/chart?asset_in=ibc/C5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01&asset_out=ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A&range=1y&asset_type=denom`;

export type HistoryPriceData = { time: number, open: number };

export const getStAssetsPriceHistory = async (): Promise<Price[]> => {
    let result: Price[] = [];

    for (const zone of zones) {
        if (zone.priceSource != "Imperator")
            continue;
            
        try {
            let ticker = zone.ticker || zone.zone;
            let url = `${baseUrl}/${zone.stAssetPool}/chart?asset_in=${ticker}&asset_out=st${ticker}&range=1y&asset_type=symbol`;
            let { data } = await axios.get<HistoryPriceData[]>(zone.zone === "evmos" ? evmosUrl : url);

            if (!Array.isArray(data)) {
                console.warn(`osmosisImperatorApi: Couldnt fetch data for zone ${zone.zone}. Error ${data}`);
                continue;
            }

            if (zone.zone === "evmos")
                result.push(...data.map(x => ({
                    id: randomUUID(),
                    coin: zone.coingeckoId,
                    date: Number(x.time) * 1000,
                    price: 1 / (Number(x.open) / 1e12),
                    vsCurrency: `st${zone.zone}`
                })));
            else
                result.push(...data.map(x => ({
                    id: randomUUID(),
                    coin: zone.coingeckoId,
                    date: Number(x.time) * 1000,
                    price: x.open,
                    vsCurrency: `st${zone.zone}`
                })));
        }
        catch (e: any) { console.log(`getStAssetsPriceHistory update error ${e?.message}`) }
    }

    return result;
}