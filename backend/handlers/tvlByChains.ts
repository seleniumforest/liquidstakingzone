import { Request, Response } from "express";
import { cache } from "../cache";
import { supportedZones, Zone, zones } from "../constants";
import { ClickhouseResponse, client } from "../db";

export type TVLData = {
    zone: Zone | "total",
    data: TVLDataRecord[]
}

type TVLDataRecord = {
    date: number,
    tvl: number;
}

export const tvlByChains = async (_: Request, res: Response) => {
    let result: TVLData[] = [];

    await Promise.allSettled(
        supportedZones.map(async (zone) => result.push({
            zone,
            data: await getTvlData(zone)
        }))
    );

    let sorted = result.sort((a, b) => a.zone > b.zone ? 1 : -1);
    cache.set('/tvlByChains', sorted)
    res.json(sorted);
}

export const getTvlData = async (zone: Zone): Promise<TVLDataRecord[]> => {
    let query = await client.query({
        query: `
            WITH deposited as (
                SELECT 
                    toUnixTimestamp(toStartOfDay(toDateTime64(date, 3, 'Etc/UTC'))) * 1000 as date, 
                    SUM(am) as amount
                FROM (
                    SELECT date, amount.2 as am
                    FROM Stride.msgs_MsgLiquidStake
                    WHERE zone = '${zone}' and txcode = 0
                ) 
                GROUP BY date
                ORDER BY date
            ),
            redeemed as (
                WITH redeems as (
                    SELECT 
                        toUnixTimestamp(toStartOfDay(toDateTime64(date, 3, 'Etc/UTC'))) as date, 
                        SUM(am) as amount
                    FROM (
                        SELECT date, toUInt256(amount) as am
                        FROM Stride.msgs_MsgRedeemStake redeem
                        WHERE zone = '${zone}' and txcode = 0
                    ) 
                    GROUP BY date
                    ORDER BY date
                ),
                redemptionRates as (
                    SELECT 
                        dt, 
                        AVG(rate) as rate
                    FROM (
                        SELECT  
                            toUnixTimestamp(toStartOfDay(toDateTime64(date, 3, 'Etc/UTC'))) AS dt,
                            toUInt256(amount.2) / toUInt256(recievedStTokenAmount.2) as rate
                        FROM Stride.msgs_MsgLiquidStake
                        WHERE zone = '${zone}' AND txcode = 0
                        ORDER BY date
                    )
                    GROUP BY dt
                    ORDER BY dt
                )
                SELECT
                    rr.dt * 1000 as date,
                    r.amount as amount,
                    rr.rate as redemptionRate
                FROM redeems r 
                RIGHT JOIN redemptionRates rr on rr.dt = r.date
                ORDER BY date
            ),
            priceData as (
                SELECT 
                    toUnixTimestamp(startOfDay) * 1000 as date,  
                    avg(price) AS price 
                FROM (
                    SELECT 
                        avg(price) as price, 
                        toStartOfDay(toDateTime64(date/1000, 3, 'Etc/UTC')) as startOfDay
                    FROM Stride.price_history
                    WHERE coin = (select coingeckoId from Stride.zones_info where zone = '${zone}') AND vsCurrency = 'usd'
                    GROUP BY startOfDay, date
                    ORDER BY date DESC
                ) 
                GROUP BY startOfDay
                ORDER BY startOfDay
            )
            SELECT
                toUnixTimestamp(dt) * 1000 as date, 
                SUM(change) OVER(ORDER BY dt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS tvl
            FROM (
                SELECT  
                    toStartOfDay(toDateTime64(pd.date/1000, 3, 'Etc/UTC')) as dt,
                    (select decimals from Stride.zones_info where zone = '${zone}') as decimals,
                    ((d.amount / pow(10, decimals)) - (r.amount / (pow(10, decimals)) * r.redemptionRate)) * pd.price as change
                FROM priceData pd
                LEFT JOIN deposited d on pd.date = d.date
                LEFT JOIN redeemed r on pd.date = r.date
            )
        `
    });

    let response = (await query.json()) as ClickhouseResponse<TVLDataRecord[]>;

    return response.data;
}