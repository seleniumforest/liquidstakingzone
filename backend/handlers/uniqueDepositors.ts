import { Request, Response } from "express";
import { cache } from "../cache";
import { ClickhouseResponse, client } from "../db";

export type UniqueDepositorsDataRecord = {
    date: number,
    deps: number;
}

export const uniqueDepositors = async (_: Request, res: Response) => {
    let query = await client.query({
        query: `
            SELECT 
                dt * 1000 as date, 
                MAX(deps) as deps
            FROM (
                SELECT
                    toUnixTimestamp(toStartOfDay(toDateTime64(date, 3, 'Etc/UTC'))) AS dt,
                    COUNT(DISTINCT creator) OVER(ORDER BY date) AS deps
                FROM Stride.msgs_MsgLiquidStake s
                GROUP BY date, creator
            )
            GROUP BY dt
            ORDER BY dt
        `
    });

    let result = (await query.json()) as ClickhouseResponse<UniqueDepositorsDataRecord[]>;
    cache.set('/uniqueDepositors', result.data);
    res.json(result.data);
}