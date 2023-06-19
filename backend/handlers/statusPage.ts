import { Request, Response } from "express";
import { ClickhouseResponse, client } from "../db";

export const statusPage = async (_: Request, res: Response) => {
    let syncQuery = await client.query({
        query: `
            select top 1 height, date * 1000 as date, hash
            from Stride.block_headers 
            order by height desc        
        `
    });

    let priceQuery = await client.query({
        query: `
            select coin, date, price 
            from Stride.price_history ph join (
            select coin, max(date) as date
            from Stride.price_history 
            group by coin
            ) ph1 on ph1.coin = ph.coin AND ph1.date = ph.date
        `
    });

    let balanceQuery = await client.query({
        query: `
            select zone, date, assets.2 as balance
            from Stride.account_balances_history abh
            join(
            select zone, max(date) as date
            from Stride.account_balances_history   
            group by zone 
            ) abh1 on abh1.zone = abh.zone and abh1.date = abh.date
        `
    });

    let syncData = (await syncQuery.json()) as ClickhouseResponse<{ height: string, date: string, hash: string }[]>;
    let priceData = (await priceQuery.json()) as ClickhouseResponse<{ coin: string, date: string, price: string }[]>;
    let balanceData = (await balanceQuery.json()) as ClickhouseResponse<{ zone: string, date: string, balance: string }[]>;

    res.json({
        syncData: syncData.data[0],
        priceData: priceData.data,
        balanceData: balanceData.data
    })
}