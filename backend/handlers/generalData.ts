import { Request, Response } from "express";
import { supportedZones } from "../constants";
import { getTvlData } from "./tvlByChains";
import CoinGecko from "coingecko-api";
import { cache } from "../cache";

export const generalData = async (req: Request, res: Response) => {
    let tvlData = 0;

    for (const zone of supportedZones) {
        tvlData += (await getTvlData(zone))?.at(-1)?.tvl || 0
    }

    const client = new CoinGecko();
    let prices = await client.coins.fetchMarketChart("stride", {
        days: "max",
        vs_currency: "usd"
    });

    let data = await client.coins.fetch("stride", {
        market_data: true,
        community_data: true
    });
    
    let marketCap = data.data.market_data.market_cap.usd;
    let vol = data.data.market_data.total_volume.usd;

    let response = {
        tvl: tvlData,
        marketCap,
        vol,
        prices: prices.data.prices
    };

    cache.set('/generalData', response)
    res.json(response);
}