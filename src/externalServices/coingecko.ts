import CoinGecko from "coingecko-api";
import { Price } from "../db";
import { randomUUID } from "../helpers";

const client = new CoinGecko();
const firstStrideBlockTimestamp = 1662292800000;
const $1hourInMs = 3600 * 1000;
const $90daysInMs = $1hourInMs * 24 * 90;

export const fetchTokenPriceHistory = async (token: string, from?: number) => {
    let prices: Price[] = [];
    from = from || firstStrideBlockTimestamp;
    let to = Date.now();
    console.log(`Updating prices for ${token} from timestamp ${from}`)

    //90 days is the maximum timespan to get hourly price ranges
    for (let period = from; period < to; period += $90daysInMs) {
        try {
            let response = await client.coins.fetchMarketChartRange(token, {
                from: Math.round(period / 1000),
                to: Math.round((period + $90daysInMs) / 1000),
                vs_currency: "usd",
            });

            response?.data?.prices?.forEach(([date, price]: [date: number, price: number]) => {
                prices.push({
                    id: randomUUID(),
                    coin: token,
                    date: date,
                    price
                })
            });
        } catch (e: any) { console.log(`fetchTokenPriceHistory: Error fetching prices ${e?.message}`); }
    }

    return prices;
}