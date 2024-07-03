import CoinGecko from "coingecko-api";
import moment from "moment";
import { GeneralData, PriceHistory } from "@prisma/client";
import { FirstStrideBlockTimestampMs, TimeSpansMs } from "../constants";

const client = new CoinGecko();

export async function fetchTokenPriceHistory(coingeckoId: string, from?: number): Promise<Omit<PriceHistory, "id">[]> {
    let prices: Omit<PriceHistory, "id">[] = [];
    from = from || FirstStrideBlockTimestampMs;
    let to = Date.now();
    console.log(`Updating prices for ${coingeckoId} from ${moment(from).toDate()}`);

    //90 days is the maximum timespan to get hourly price ranges
    for (let period = from; period < to; period += TimeSpansMs.day * 90) {
        try {
            let response = await client.coins.fetchMarketChartRange(coingeckoId, {
                from: Math.round(period / 1000),
                to: Math.round((period + TimeSpansMs.day * 90) / 1000),
                vs_currency: "usd",
            });

            if (response.message != "OK") {
                console.warn(`fetchTokenPriceHistory: response.message is not OK. coingeckoId ${coingeckoId} from ${from}`);
            }

            response?.data?.prices?.forEach(([date, price]: [date: number, price: number]) => {
                prices.push({
                    coin: coingeckoId,
                    date: new Date(date),
                    price,
                    vsCurrency: "usd"
                });
            });

            if (period < to)
                await new Promise((res) => setTimeout(res, 2000));
        } catch (e: any) {
            console.log(`fetchTokenPriceHistory: Error fetching prices ${e?.message}`);
            return [];
        }
    }
    return prices;
}

export const fetchGeneralData = async (): Promise<Omit<GeneralData, "id"> | undefined> => {
    try {
        let data = await client.coins.fetch("stride", {
            market_data: true,
            community_data: true
        });

        let mcap = Math.round(data.data.market_data.market_cap.usd);
        let vol = Math.round(data.data.market_data.total_volume.usd);
        console.log(`fetchGeneralData: Got new data:`, mcap, vol, Date.now());

        return { mcap, vol, date: new Date(Date.now()) };
    } catch (e: any) { console.error(`fetchGeneralData: Error fetching data ${e?.message}`); }
}