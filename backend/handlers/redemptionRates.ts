import { Request, Response } from "express";
import { cache } from "../cache";
import { Zone, zones } from "../constants";
import { ClickhouseResponse, client } from "../db";

type RedemptionRateDataRecord = {
    date: number,
    rate: number,
    price: number
}

//temporary solution
const astroLunaPoolDataUrl = "https://api.coinhall.org/api/v1/charts/terra1re0yj0j6e9v2szg7kp02ut6u8jjea586t6pnpq6628wl36fphtpqwt6l7p?bars=329&from=1665251079&interval=1h&quoteAsset=uluna&to=1679463879";

const findClosestDate = (data: { date: number, price: number }[], target: number) => {
    let sorted = data.sort((a, b) => Math.abs(a.date - target) > Math.abs(b.date - target) ? 1 : -1);

    return sorted[0];
}

export const redemptionRates = async (req: Request, res: Response) => {
    let zone = req.query.zone as Zone;
    let rates = await getRedemptionRatesData(zone);
    let prices = zone === "luna" ?
        (await (await fetch(astroLunaPoolDataUrl)).json() as any[]).map((x: any) => ({ date: x.time, price: x.open })) :
        await getPriceData(zone, false);

    let merged = rates.map(r => ({
        date: Number(r.date),
        rate: r.rate,
        price: findClosestDate(prices, r.date)?.price || 1
    }));

    //do not show last element if price still not indexed
    if (merged[merged.length - 1].price === 1)
        merged = merged.slice(0, merged.length - 1);

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
                avg(price) AS price 
            FROM (
                SELECT 
                    avg(price) as price, 
                    toStartOfDay(toDateTime64(date/1000, 3, 'Etc/UTC')) as startOfDay
                FROM Stride.price_history
                WHERE coin = '${coingeckoId}' AND vsCurrency ${vsUsd ? '=' : '!='} 'usd'
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