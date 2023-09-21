import { Request, Response } from "express";
import { ClickhouseResponse, client } from "../db";
import { Zone, zones } from "../constants";

export const activeUsers = async (_: Request, res: Response) => {
    let query = await client.query({
        query: `SELECT * FROM Stride.active_users`
    });

    let response = (await query.json()) as ClickhouseResponse<{ date: string, users: number }[]>;
    let data = response.data?.map((x: any) => ([Number(x.date), Number(x.users)])) || [];
    res.json(data);
}

export const assetsDeposited = async (req: Request, res: Response) => {
    let zoneInfo = zones.find(x => x.zone === req.query.zone);
    if (!zoneInfo) {
        res.status(400);
        return res.json(`Zone ${req.query.zone} doesnt exist`);
    }

    let query = await client.query({
        query: `SELECT * FROM assets_deposited(zone_name='${zoneInfo.zone}')`
    });

    let response = (await query.json()) as ClickhouseResponse<{ date: string, amount: number }[]>;
    let data = response.data?.map((x: any) => ([Number(x.date), Number(x.amount)])) || [];
    res.json(data);
}

export const assetsOnStakingWallets = async (_: Request, res: Response) => {
    function getSortOrder(zone: Zone) {
        return zones.find(x => x.zone == zone)?.sortOrder || 1;
    }

    let query = await client.query({
        query: `SELECT * FROM Stride.assets_on_staking_wallets`
    });

    let response = (await query.json()) as ClickhouseResponse<{
        zone: Zone,
        latestDate: number,
        latestAssets: number,
        pastDayDate: number,
        pastDayAssets: number
    }[]>;

    let sorted = response.data.sort((a, b) => getSortOrder(a.zone) > getSortOrder(b.zone) ? 1 : -1);
    res.json(sorted);
}

export const assetsRedeemed = async (req: Request, res: Response) => {
    let zoneInfo = zones.find(x => x.zone === req.query.zone);
    if (!zoneInfo) {
        res.status(400);
        return res.json(`Zone ${req.query.zone} doesnt exist`);
    }

    let query = await client.query({
        query: `SELECT * FROM assets_redeemed(zone_name='${zoneInfo.zone}')`
    });

    let response = (await query.json()) as ClickhouseResponse<{ date: number, amount: number }[]>;
    let data = response.data?.map((x: any) => ([Number(x.date), Number(x.amount)]));
    res.json(data);
}

export const depositorsVolume = async (req: Request, res: Response) => {
    let zoneInfo = zones.find(x => x.zone === req.query.zone);
    if (!zoneInfo) {
        res.status(400);
        return res.json(`Zone ${req.query.zone} doesnt exist`);
    }

    let query = await client.query({
        query: `SELECT * FROM depositors_volume(zone_name='${zoneInfo.zone}')`
    });

    let response = (await query.json()) as ClickhouseResponse<{ range: [number, number], count: number; }[]>;
    let data = response.data?.map(x => ({ range: x.range, count: Number(x.count) }));
    res.json(data);
}

export const latestEvents = async (_: Request, res: Response) => {
    let query = await client.query({
        query: `SELECT * FROM latest_events`
    });

    let response = (await query.json()) as ClickhouseResponse<{
        date: number,
        txhash: string,
        creator: string,
        tokenIn: number,
        tokenOut: number,
        zone: Zone,
        value: number,
        action: "redeem" | "stake"
    }[]>;

    res.json(response.data);
}

export const protocolRevenue = async (_: Request, res: Response) => {
    let query = await client.query({
        query: `SELECT * FROM protocol_revenue`
    });

    let response = (await query.json()) as ClickhouseResponse<{
        date: number,
        fee: number,
        restake: number
    }[]>;

    let data = response.data?.map((x: any) => ({
        date: Number(x.date),
        fee: Number(x.fee),
        restake: Number(x.restake)
    })) || [];

    res.json(data);
}

export const uniqueDepositors = async (_: Request, res: Response) => {
    let query = await client.query({
        query: `SELECT * FROM unique_depositors`
    });

    let result = (await query.json()) as ClickhouseResponse<{ date: number, deps: number }[]>;
    let data = result.data?.map((x: any) => ([Number(x.date), Number(x.deps)])) || [];
    res.json(data);
}