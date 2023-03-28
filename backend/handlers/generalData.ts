import { Request, Response } from "express";
import { supportedZones } from "../constants";
import { getTvlData } from "./tvlByChains";
import { cache } from "../cache";
import { getPriceDataById } from "./redemptionRates";
import { ClickhouseResponse, client } from "../db";

export const generalData = async (req: Request, res: Response) => {
    let tvlData = 0;

    for (const zone of supportedZones) {
        tvlData += (await getTvlData(zone))?.at(-1)?.tvl || 0
    }

    let prices = await getPriceDataById("stride", true);
    let { mcap, vol } = await getGeneralDataFromDb();
    console.log(mcap, vol)
    let response = {
        tvl: tvlData,
        marketCap: +mcap,
        vol: +vol,
        prices: prices.map(x => [Number(x.date), x.price])
    };

    cache.set('/generalData', response);
    res.json(response);
}

async function getGeneralDataFromDb() {
    let query = await client.query({
        query: `
            SELECT TOP 1 * 
            FROM Stride.general_data
            ORDER BY date desc
        `
    });

    let response = (await query.json()) as ClickhouseResponse<{mcap: number, vol: number}[]>;

    return response.data[0];
}