import { Request, Response } from "express";
import { cache } from "../cache";
import { ClickhouseResponse, client } from "../db";

type LatestEventsDataRecord = {
    date: number,
    txhash: string,
    creator: string,
    amount: string,
    zone: string,
    action: "redeem" | "stake"
}

export const latestEvents = async (_: Request, res: Response) => {
    let query = await client.query({
        query: `
            SELECT * FROM (
                SELECT top 15 
                    date, 
                    txhash,
                    creator,
                    toUInt256(amount.2) as amount,
                    zone,
                    'stake' as action
                FROM Stride.msgs_MsgLiquidStake
                WHERE txcode = 0
                ORDER BY date DESC
            
                UNION ALL
            
                SELECT top 15 
                    date, 
                    txhash,
                    creator,
                    toUInt256(amount) as amount,
                    zone,
                    'redeem' as action
                FROM Stride.msgs_MsgRedeemStake
                WHERE txcode = 0
                ORDER BY date DESC
            )
            ORDER BY date DESC
        `
    });

    let response = (await query.json()) as ClickhouseResponse<LatestEventsDataRecord[]>;

    cache.set('/latestEvents', response.data)
    res.json(response.data);
}