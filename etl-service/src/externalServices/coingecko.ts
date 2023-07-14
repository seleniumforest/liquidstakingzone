import CoinGecko from "coingecko-api";
import moment from "moment";
import { Price } from "../db";
import { GeneralData } from "../db/generalData";
import { randomUUID } from "../helpers";

const client = new CoinGecko();
const firstStrideBlockTimestamp = 1662292800000;
const $1hourInMs = 3600 * 1000;
const $90daysInMs = $1hourInMs * 24 * 90;

export const fetchTokenPriceHistory = async (coingeckoId: string, from?: number) => {
    let prices: Price[] = [];
    from = from || firstStrideBlockTimestamp;
    let to = Date.now();
    console.log(`Updating prices for ${coingeckoId} from ${moment(from).toDate()}`)

    //90 days is the maximum timespan to get hourly price ranges
    for (let period = from; period < to; period += $90daysInMs) {
        try {
            let response = await client.coins.fetchMarketChartRange(coingeckoId, {
                from: Math.round(period / 1000),
                to: Math.round((period + $90daysInMs) / 1000),
                vs_currency: "usd",
            });

            response?.data?.prices?.forEach(([date, price]: [date: number, price: number]) => {
                prices.push({
                    id: randomUUID(),
                    coin: coingeckoId,
                    date: date,
                    price,
                    vsCurrency: "usd"
                })
            });
        } catch (e: any) { console.log(`fetchTokenPriceHistory: Error fetching prices ${e?.message}`); }
    }

    return prices;
}

export const fetchGeneralData = async (): Promise<GeneralData | undefined> => {
    console.log
    try {
        let data = await client.coins.fetch("stride", {
            market_data: true,
            community_data: true
        });

        let mcap = data.data.market_data.market_cap.usd;
        let vol = data.data.market_data.total_volume.usd;
        console.log(`fetchGeneralData: Got new data:`, mcap, vol, Date.now());
        
        return { mcap, vol, id: randomUUID(), date: Date.now() };
    } catch (e: any) { console.error(`fetchGeneralData: Error fetching data ${e?.message}`); }
}