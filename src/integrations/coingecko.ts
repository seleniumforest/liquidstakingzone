import CoinGecko from "coingecko-api";
import { getPrices, insertData } from "../clickhouse";
import { randomUUID } from "../helpers";

const client = new CoinGecko();
const firstBlockTimestamp = 1662292800000;
const geckoTokenIds = ["cosmos", "osmosis", "juno-network", "stargaze", "stride"];
const $1hourInMs = 3600 * 1000;
const $90daysInMs = $1hourInMs * 24 * 90;


export const runPriceUpdateJob = async () => {
    setInterval(updateJob, $1hourInMs);
    await updateJob();
}

const updateJob = async () => {
    console.log("Running price update job");
    let prices = await getPrices();
    let tokens = geckoTokenIds.map(x => ({
        coin: x,
        latestDate: prices.find(p => p.coin === x)?.latestDate
    }));

    for (let token of tokens) {
        await fetchTokenPriceHistory(token.coin, token.latestDate);
        //to prevent spamming
        await new Promise((res) => setTimeout(res, 2000));
    }
};

export const fetchTokenPriceHistory = async (token: string, from?: number) => {
    let prices: Price[] = [];
    from = from || firstBlockTimestamp;
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
        } catch (e) { console.log(e) }
    }

    await insertData('price_history', prices);;
}

export interface Price {
    id: string,
    coin: string,
    date: number,
    price: number,
}