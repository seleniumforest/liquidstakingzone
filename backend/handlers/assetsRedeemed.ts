import { Request, Response } from "express";
import { cache } from "../cache";
import { Zone } from "../constants";
import { ClickhouseResponse, client } from "../db";

export const assetsRedeemed = async (req: Request, res: Response) => {
    let zone = req.query.zone as Zone;

    let query = await client.query({
        query: `
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
                floor(r.amount / pow(10, (select decimals from Stride.zones_info where zone = '${zone}')), 0) as amount,
                rr.rate as redemptionRate
            FROM redeems r 
            RIGHT JOIN redemptionRates rr on rr.dt = r.date
            ORDER BY date
        `
    });

    let response = (await query.json()) as ClickhouseResponse<{
        date: number,
        amount: number
    }[]>;

    cache.set('/assetsRedeemed', response.data)
    res.json(response.data);
}