import { Request, Response } from "express";
import { cache } from "../cache";
import { ClickhouseResponse, client } from "../db";

export const activeUsers = async (_: Request, res: Response) => {
    let query = await client.query({
        query: `
          WITH stakeUsers AS (
              SELECT 
                  toStartOfDay(toDateTime64(date, 3, 'Etc/UTC')) as dt, 
                  COUNT(DISTINCT creator) as users
              FROM Stride.msgs_MsgLiquidStake
              GROUP BY dt
              ORDER BY dt
          ),
          unstakeUsers AS (
              SELECT 
                  toStartOfDay(toDateTime64(date, 3, 'Etc/UTC')) as dt, 
                  COUNT(DISTINCT creator) as users
              FROM Stride.msgs_MsgRedeemStake
              GROUP BY dt
              ORDER BY dt
          )
          SELECT 
              toUnixTimestamp(su.dt) * 1000 AS date, 
              su.users + uu.users as users
          FROM stakeUsers su 
          LEFT JOIN unstakeUsers uu on su.dt = uu.dt
      `
    });

    let response = (await query.json()) as ClickhouseResponse<{ date: string, users: number }[]>;
    let data = response.data?.map((x: any) => ([Number(x.date), Number(x.users)])) || [];

    cache.set('/activeUsers', data);
    res.json(data);
}