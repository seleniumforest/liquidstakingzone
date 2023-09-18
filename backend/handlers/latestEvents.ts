import { Request, Response } from "express";
import { Zone } from "../constants";
import { ClickhouseResponse, client } from "../db";

export const latestEvents = async (_: Request, res: Response) => {
    let query = await client.query({
        query: `
            WITH priceData AS (
                SELECT 
                    zi.zone as zone,
                    price
                FROM (
                        SELECT 
                            row_number() OVER (PARTITION BY coin ORDER BY date DESC) as rn,
                            coin,
                            price
                        FROM Stride.price_history
                        WHERE vsCurrency = 'usd'
                    ) lp
                JOIN Stride.zones_info zi on zi.coingeckoId = lp.coin
                WHERE rn = 1
            ),
            redRates AS (
                SELECT  
                    zone,
                    amount.2 / recievedStTokenAmount.2 as rate
                FROM (
                        SELECT 
                            row_number() OVER (PARTITION BY zone ORDER BY date DESC) as rn,
                            *
                        FROM Stride.msgs_MsgLiquidStake mmls
                        WHERE txcode = 0 and zone <> ''
                    )
                WHERE rn = 1
            )
            SELECT 
                date * 1000 as date,
                txhash,
                creator,
                toUInt256(amount.2) / pow(10, decimals) as tokenIn,
                recievedStTokenAmount.2 / pow(10, decimals) as tokenOut,
                tokenIn * pd.price as value,
                ls.zone as zone,
                'stake' as action
            FROM Stride.msgs_MsgLiquidStake ls
                JOIN Stride.zones_info zi on zi.zone = ls.zone
                JOIN priceData pd on pd.zone = ls.zone 
            WHERE tokenIn > 1 and txcode = 0 and value > 100
            ORDER BY date DESC
            LIMIT 10
            UNION ALL
            SELECT 
                date * 1000 as date,
                txhash,
                creator,
                toUInt256(amount) / pow(10, decimals) as tokenIn,
                tokenIn * rrs.rate as tokenOut,
                tokenOut * pd.price as value,
                rs.zone as zone,
                'redeem' as action
            FROM Stride.msgs_MsgRedeemStake rs
                JOIN Stride.zones_info zi on zi.zone = rs.zone
                JOIN redRates rrs on rrs.zone = rs.zone
                JOIN priceData pd on pd.zone = rs.zone 
            WHERE tokenIn > 1 and txcode = 0 and value > 100
            ORDER BY date DESC
            LIMIT 10
        `
    });

    let response = (await query.json()) as ClickhouseResponse<LatestEventsDataRecord[]>;
    res.json(response.data);
}

type LatestEventsDataRecord = {
    date: number,
    txhash: string,
    creator: string,
    tokenIn: number,
    tokenOut: number,
    zone: Zone,
    value: number,
    action: "redeem" | "stake"
}