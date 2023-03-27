import { Request, Response } from "express";
import { supportedZones } from "../constants";
import { getTvlData } from "./tvlByChains";
import CoinGecko from "coingecko-api";
import { cache } from "../cache";
import { getPriceData, getPriceDataById, PriceData } from "./redemptionRates";

let lastMarketCap = 0;
let lastTotalVolume = 0;

export const generalData = async (req: Request, res: Response) => {
    let tvlData = 0;

    for (const zone of supportedZones) {
        tvlData += (await getTvlData(zone))?.at(-1)?.tvl || 0
    }

    const client = new CoinGecko();
    let prices = await getPriceDataById("stride", true);

    try {
        let data = await client.coins.fetch("stride", {
            market_data: true,
            community_data: true
        });

        lastMarketCap = data.data.market_data.market_cap.usd;
        lastTotalVolume = data.data.market_data.total_volume.usd;
    } catch (e: any) { console.log(e?.message) }

    let response = {
        tvl: tvlData,
        marketCap: lastMarketCap,
        vol: lastTotalVolume,
        prices: prices.map(x => [Number(x.date), x.price])
    };

    if (lastMarketCap > 0 && lastTotalVolume > 0)
        cache.set('/generalData', response)
    res.json(response);
}