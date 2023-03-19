import { Request, Response } from "express";
import { cache } from "../cache";
import { Zone, zones } from "../constants";
import { ClickhouseResponse, client } from "../db";

type RedemptionRateDataRecord = {
    date: number,
    rate: number,
    price: number
}

export const redemptionRates = async (req: Request, res: Response) => {
    let zone = req.query.zone as Zone;
    let rates = await getRedemptionRatesData(zone);
    let prices = await getPriceData(zone, false);

    let merged = rates.map(r => ({
        date: Number(r.date),
        rate: r.rate,
        price: prices.find(p => p.date === r.date)?.price || 1
    }));

    cache.set('/redemptionRates', merged)
    res.json(merged);
}

const getRedemptionRatesData = async (zone: string): Promise<RedemptionRateDataRecord[]> => {
    let query = await client.query({
        query: `
            SELECT 
                dt as date, 
                AVG(rate) as rate
            FROM (
                SELECT  
                    toUnixTimestamp(toStartOfDay(toDateTime64(date, 3, 'Etc/UTC'))) * 1000 AS dt,
                    toUInt256(amount.2) / toUInt256(recievedStTokenAmount.2) as rate
                FROM Stride.msgs_MsgLiquidStake
                WHERE zone = '${zone}' AND txcode = 0
                ORDER BY date
            )
            GROUP BY dt
            ORDER BY dt     
        `
    });

    let response = (await query.json()) as ClickhouseResponse<RedemptionRateDataRecord[]>;
    return response.data;
};

type PriceData = {
    date: number,
    price: number
}
export const getPriceData = async (zone: Zone, vsUsd: boolean = true): Promise<PriceData[]> => {
    let query = await client.query({
        query: `
            SELECT 
                toUnixTimestamp(startOfDay) * 1000 as date,  
                avg(price) AS price 
            FROM (
                SELECT 
                    avg(price) as price, 
                    toStartOfDay(toDateTime64(date/1000, 3, 'Etc/UTC')) as startOfDay
                FROM Stride.price_history
                WHERE coin = '${zones.find(x => x.zone === zone)?.coingeckoId}' AND vsCurrency ${vsUsd ? '=' : '!='} 'usd'
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