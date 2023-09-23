import { Request, Response } from "express";
import { Zone, zones } from "../constants";
import { ClickhouseResponse, client } from "../db";

export const redemptionRates = async (req: Request, res: Response) => {
    type RedemptionRateDataRecord = {
        date: number,
        rate: number,
        price: number
    }

    let zoneInfo = zones.find(x => x.zone === req.query.zone);
    if (!zoneInfo) {
        res.status(400);
        return res.json(`Zone ${req.query.zone} doesnt exist`);
    }

    let query = await client.query({
        query: `SELECT * FROM redemption_rates_and_prices(zone_name='${zoneInfo.zone}')`
    });

    let response = (await query.json()) as ClickhouseResponse<RedemptionRateDataRecord[]>;
    res.json(response.data.map(el => ({
        ...el,
        date: Number(el.date)
    })));
}

export type PriceData = {
    date: number,
    price: number
}
export const getPriceData = async (zone: Zone, vsUsd: boolean = true): Promise<PriceData[]> => {
    let coingeckoId = zones.find(x => x.zone === zone)?.coingeckoId!;
    return getPriceDataById(coingeckoId, vsUsd);
}

export const getPriceDataById = async (coingeckoId: string, vsUsd: boolean = true): Promise<PriceData[]> => {
    let query = await client.query({
        query: `
            SELECT 
                toUnixTimestamp(startOfDay) * 1000 as date,  
                avg(avgprice) AS price 
            FROM (
                SELECT 
                    avg(price) as avgprice, 
                    toStartOfDay(toDateTime64(date/1000, 3, 'Etc/UTC')) as startOfDay
                FROM Stride.price_history
                WHERE coin = '${coingeckoId}' AND vsCurrency ${vsUsd ? '=' : '!='} 'usd' and price > 0
                GROUP BY startOfDay, date
                ORDER BY date DESC
            ) 
            GROUP BY startOfDay
            ORDER BY startOfDay
        `
    });

    let response = await query.json() as ClickhouseResponse<PriceData[]>;
    return response.data;
}