import { Request, Response } from "express";
import { cache } from "../cache";
import { Zone } from "../constants";
import { ClickhouseResponse, client } from "../db";

type DepositorsVolumeDataRecord = {
    range: [number, number],
    count: number;
}

export const depositorsVolume = async (req: Request, res: Response) => {
    let zone = req.query.zone as Zone;

    let query = await client.query({
        query: `
            WITH ranges as (
                SELECT (0, 10) AS range
                UNION ALL 
                SELECT (10, 100) AS range
                UNION ALL 
                SELECT (100, 1000) AS range
                UNION ALL 
                SELECT (1000, 10000) AS range
                UNION ALL 
                SELECT (10000, 100000) AS range
                UNION ALL 
                SELECT (100000, 1000000) AS range 
                UNION ALL 
                SELECT (1000000, 10000000) AS range
            ),
            prices as (
                SELECT 
                    dt,
                    AVG(price) as price
                FROM (
                    SELECT
                        toStartOfDay(toDateTime64(date / 1000, 3, 'Etc/UTC')) as dt
                        ,* 
                    FROM Stride.price_history ph
                    WHERE vsCurrency = 'usd' and coin = (SELECT TOP 1 coingeckoId FROM Stride.zones_info zi2 WHERE zone='${zone}')
                    order by dt
                )
                GROUP BY dt
                ORDER BY dt
            )
            SELECT 
                range, 
                COUNT(am) as count
            FROM (
                SELECT
                    toStartOfDay(toDateTime64(mmls.date, 3, 'Etc/UTC')) as dt,
                    (mmls.amount.2 / POW(10, zi.decimals)) * p.price as am,
                    range
                FROM Stride.msgs_MsgLiquidStake mmls 
                JOIN Stride.zones_info zi on zi.zone = mmls.zone
                JOIN prices p on dt = p.dt
                JOIN ranges r on 1 = 1
                WHERE mmls.zone = '${zone}' AND am > range.1 AND am < range.2 AND txcode = 0
                ORDER BY dt 
            ) 
            GROUP BY range
            ORDER BY range
        `
    });

    let response = (await query.json()) as ClickhouseResponse<DepositorsVolumeDataRecord[]>;
    let data = response.data?.map(x => ({ range: x.range, count: Number(x.count) }));

    cache.set('/depositorsVolume', data)
    res.json(data);
}


/*
WITH prices as (
    SELECT 
        dt,
        AVG(price) as price
    FROM (
        SELECT
            toStartOfDay(toDateTime64(date / 1000, 3, 'Etc/UTC')) as dt
            ,* 
        FROM Stride.price_history ph
        WHERE vsCurrency = 'usd' and coin = (SELECT TOP 1 coingeckoId FROM Stride.zones_info zi2 WHERE zone= '${zone}')
        order by dt
    )
    GROUP BY dt
    ORDER BY dt
)
SELECT 
    range, 
    COUNT(am)
FROM (
    SELECT
        toStartOfDay(toDateTime64(mmls.date, 3, 'Etc/UTC')) as dt,
        (mmls.amount.2 / POW(10, zi.decimals)) * p.price as am,
        (CASE 
            WHEN am <= 10 THEN '1-10'
            WHEN am > 10 AND am <= 100 THEN '10-100'
            WHEN am > 100 AND am <= 1000 THEN '100-1000'
            WHEN am > 1000 AND am <= 10000 THEN '1000-10000'
            WHEN am > 10000 AND am <= 100000 THEN '10000-100000'
            WHEN am > 100000 AND am <= 1000000 THEN '100000-1000000'
            WHEN am > 1000000 AND am <= 10000000 THEN '1000000-10000000'
            ELSE '0'
        END) as range
    FROM Stride.msgs_MsgLiquidStake mmls 
    LEFT JOIN Stride.zones_info zi on zi.zone = mmls.zone
    LEFT JOIN prices p on dt = p.dt
    WHERE mmls.zone = '${zone}' AND txcode = 0
    ORDER BY dt
)
GROUP BY range
ORDER BY range
*/