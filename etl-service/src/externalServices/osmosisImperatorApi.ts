import axios from "axios";
import { Zone } from "../constants";
import { prisma } from "../db";
import { PriceHistory } from "@prisma/client";

const baseUrl = `https://api-osmosis.imperator.co/pairs/v1/historical`
export type HistoryPriceData = { time: number, open: number };

export async function getStAssetPriceHistory(zone: Zone, from: number | undefined):
    Promise<Omit<PriceHistory, "id">[]> {
    try {
        let zoneInfo = await prisma.zonesInfo.findUniqueOrThrow({
            where: { zone }
        });

        let ticker = zoneInfo.ticker || zoneInfo.zone;
        let url = `${baseUrl}/${zoneInfo.stAssetPool}/chart?asset_in=${ticker}&asset_out=st${ticker}&range=30d&asset_type=symbol`;
        let { data } = await axios.get<HistoryPriceData[]>(url, {
            headers: {
                "Accept": "application/json"
            }
        });

        let result: Omit<PriceHistory, "id">[] = data.map(x => ({
            coin: zoneInfo.coingeckoId,
            date: new Date(x.time * 1000),
            price: x.open,
            vsCurrency: `st${zoneInfo.ticker || zoneInfo.zone}`
        }));

        if (from) {
            return result.filter(x => x.date.getTime() > from);
        }

        return result;
    }
    catch (e: any) {
        console.error(`getStAssetsPriceHistory error zone ${zone} from ${from} err ${JSON.stringify(e, null, 4)}`);
        return [];
    }
}