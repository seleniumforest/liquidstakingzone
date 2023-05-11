import { Request, Response } from "express";
import { cache } from "../cache";
import { Zone } from "../constants";
import { ClickhouseResponse, client } from "../db";

export const assetsDeposited = async (req: Request, res: Response) => {
    let zone = req.query.zone as Zone;

    let query = await client.query({
        query: `
            SELECT 
                toUnixTimestamp(toStartOfDay(toDateTime64(date, 3, 'Etc/UTC'))) * 1000 as date, 
                floor(SUM(am) / pow(10, (select decimals from Stride.zones_info where zone = '${zone}')), 0) as amount
            FROM (
                SELECT date, amount.2 as am
                FROM Stride.msgs_MsgLiquidStake
                WHERE zone = '${zone}' and txcode = 0
            ) 
            GROUP BY date
            ORDER BY date
        `
    });

    let response = (await query.json()) as ClickhouseResponse<{ date: string, amount: number }[]>;
    
    let data = response.data?.map((x: any) => ([Number(x.date), Number(x.amount)])) || [];

    cache.set('/assetsDeposited', data)
    res.json(data);
}