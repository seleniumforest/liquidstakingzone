import { Request, Response } from "express";
import { cache } from "../cache";
import { ClickhouseResponse, client } from "../db";

type ProtocolRevenueDataRecord = {
    date: number,
    fee: number,
    restake: number
}

export const protocolRevenue = async (_: Request, res: Response) => {
    let sql = `
            WITH prices as (
                SELECT coin,
                    toUnixTimestamp(startOfDay) * 1000 as date,  
                    avg(price) AS price 
                FROM (
                    SELECT 
                        coin,
                        avg(price) as price, 
                        toStartOfDay(toDateTime64(date/1000, 3, 'Etc/UTC')) as startOfDay
                    FROM Stride.price_history
                    WHERE vsCurrency = 'usd'
                    GROUP BY startOfDay, date, coin
                    ORDER BY coin, date DESC
                ) 
                GROUP BY startOfDay, coin
                ORDER BY coin, startOfDay
            ),
            fees as (
                SELECT  
                    zone,
                    toUnixTimestamp(toStartOfDay(toDateTime64(bh.date, 3, 'Etc/UTC'))) * 1000 AS dt, 
                    sum(toUInt256(rs.amount[1].2)) AS amount
                FROM Stride.zones_restakes rs
                JOIN Stride.block_headers bh ON bh.height = rs.height
                WHERE type = 'fee'
                GROUP BY dt, zone
                ORDER BY zone, dt
            ),
            restake as (
                SELECT  
                    zone,
                    toUnixTimestamp(toStartOfDay(toDateTime64(bh.date, 3, 'Etc/UTC'))) * 1000 AS dt, 
                    sum(toUInt256(rs.amount[1].2)) AS amount
                FROM Stride.zones_restakes rs
                JOIN Stride.block_headers bh ON bh.height = rs.height
                WHERE type = 'delegation'
                GROUP BY dt, zone
                ORDER BY zone, dt
            )
            SELECT 
                date, 
                sum(fee) as fee,
                sum(restake) as restake
            FROM (
                SELECT 
                    z.zone as zone,
                    f.amount / pow(10, z.decimals) * p.price as fee,
                    f.dt as date,
                    r.amount / pow(10, z.decimals) * p.price as restake
                FROM prices p 
                join fees f on p.date = f.dt
                join Stride.zones_info z on f.zone = z.zone and p.coin = z.coingeckoId
                join restake r on r.dt = f.dt and r.zone = z.zone
                ORDER BY p.coin, p.date
            )
            GROUP BY date
            order by date
    `;

    let query = await client.query({
        query: sql
    });

    let response = (await query.json()) as ClickhouseResponse<ProtocolRevenueDataRecord[]>;

    cache.set('/protocolRevenue', response.data)
    res.json(response.data);
}