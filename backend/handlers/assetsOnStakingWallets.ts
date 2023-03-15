import { Request, Response } from "express";
import { cache } from "../cache";
import { ClickhouseResponse, client } from "../db";

type AssetsInStakingDataRecord = {
    zone: string,
    latestDate: number,
    latestAssets: [string, string][],
    pastDayDate: number,
    pastDayAssets: [string, string][],
}

export const assetsOnStakingWallets = async (req: Request, res: Response) => {
    let query = await client.query({
        query: `
        WITH latestData as (
            SELECT * from Stride.account_balances_history a2
            JOIN (
                SELECT zone, max(date) as dt
                FROM Stride.account_balances_history a1
                GROUP BY zone
            ) as sub on sub.dt = a2.date
        ),
        pastDayData as (
            WITH data as (
                SELECT abs((toUnixTimestamp(subtractDays(now64(), 1)) * 1000) - date) as diff, zone, date, assets
                FROM Stride.account_balances_history
                ORDER BY zone
            )
            SELECT zone, date, assets 
            FROM data d1 JOIN 
            (
                SELECT zone, min(diff) as diff
                FROM data
                GROUP BY zone
            ) AS d2 ON d2.diff = d1.diff
        )
        SELECT
            ld.zone, 
            ld.date as latestDate,
            ld.assets as latestAssets,
            pd.date as pastDayDate,
            pd.assets as pastDayAssets
        FROM latestData ld 
        JOIN pastDayData pd ON pd.zone = ld.zone 
        `
    });

    let response = (await query.json()) as ClickhouseResponse<AssetsInStakingDataRecord[]>;

    cache.set('/assetsOnStakingWallets', response.data)
    res.json(response.data);
}