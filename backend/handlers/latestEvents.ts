import { Request, Response } from "express";
import { cache } from "../cache";
import { Zone } from "../constants";
import { ClickhouseResponse, client } from "../db";
import { fromBaseUnit } from "../helpers";
import { getPriceData, PriceData } from "./redemptionRates";

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

export const latestEvents = async (_: Request, res: Response) => {
    let query = await client.query({
        query: `
        SELECT * FROM (
            SELECT top 15 
                date, 
                txhash,
                creator,
                toUInt256(amount.2) / pow(10,decimals) as tokenIn,
                recievedStTokenAmount.2 / pow(10,decimals) as tokenOut,
                zone,
                'stake' as action
            FROM Stride.msgs_MsgLiquidStake ls
            JOIN Stride.zones_info zi on zi.zone = ls.zone
            WHERE tokenIn > 1 and txcode = 0
            ORDER BY date DESC
        
            UNION ALL
        
            SELECT top 15 
                date, 
                txhash,
                creator,
                toUInt256(amount) / pow(10,decimals) as tokenIn,
                tokenIn * rrs.rate as tokenOut,
                rs.zone,
                'redeem' as action
            FROM Stride.msgs_MsgRedeemStake rs
            JOIN Stride.zones_info zi on zi.zone = rs.zone
            JOIN (
                with rr as (
                    SELECT 
                        row_number() OVER (PARTITION BY zone ORDER BY date DESC) as rn,
                        * 
                        from Stride.msgs_MsgLiquidStake mmls
                        WHERE txcode = 0 and zone <> ''
                    )
                    select 
                        zone,
                        amount.2 / recievedStTokenAmount.2 as rate
                    from rr where rn = 1
                ) rrs on rrs.zone = rs.zone
            WHERE tokenIn > 1 and txcode = 0
            ORDER BY date DESC
        )
        ORDER BY date DESC
        `
    });

    let response = (await query.json()) as ClickhouseResponse<LatestEventsDataRecord[]>;
    let priceData: { zone: Zone, data: PriceData[] }[] = [];
    for (const pd of [...new Set(response.data.map(x => x.zone))]) {
        priceData.push({ zone: pd, data: await getPriceData(pd, true) });
    }

    let result = response.data.map(x => {
        let amount = x.action === "stake" ? x.tokenIn : x.tokenOut;
        let price = priceData.find(pd => pd.zone === x.zone)?.data?.sort((a, b) => x.date - (a.date) > x.date - (b.date) ? 1 : -1)[0];

        return {
            ...x,
            price: price?.price,
            value: (amount * (price?.price || 0)).toFixed(2)
        }
    })
    
    cache.set('/latestEvents', result)
    res.json(result);
}