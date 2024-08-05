import express, { NextFunction, Request, Response } from "express";
import cors from 'cors';
import { findZone } from "../helpers";
import _ from "lodash";
import NodeCache from "node-cache";
import { PrismaClient } from "@prisma/client";

const app = express();
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });
const dsUrl = process.env.DATABASE_INDEXED_URL_BACKEND || process.env.DATABASE_INDEXED_URL;
const prisma = new PrismaClient({
    datasourceUrl: dsUrl
})
/* ---- MIDDLEWARES SECTION ---- */

const cacheMiddleware = (req: Request, res: any, next: NextFunction) => {
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        return res.json(cachedResponse);
    } else {
        res.sendResponse = res.json;
        res.json = (body: any) => {
            cache.set(key, body);
            res.sendResponse(body);
        };
        next();
    }
};

async function errHandle(handler: any, req: Request, res: Response, next: NextFunction) {
    try {
        return await handler(req, res, next);
    } catch (err: any) {
        console.log(req.path + " " + err?.message || JSON.stringify(err, null, 4));
        return res.status(500).json(err);
    }
}

app.use(cacheMiddleware);

const handlersMap = new Map<
    string,
    (req: Request, res: Response) => Promise<void>
>([
    ["/activeUsers", activeUsers],
    ["/assetsDeposited", assetsDeposited],
    ["/assetsOnStakingWallets", assetsOnStakingWallets],
    ["/assetsRedeemed", assetsRedeemed],
    ["/depositorsVolume", depositorsVolume],
    ["/latestEvents", latestEvents],
    ["/uniqueDepositors", uniqueDepositors],
    ["/zonesInfo", zonesInfo],
    ["/protocolRevenue", protocolRevenue],
    ["/redemptionRates", redemptionRates],
    ["/generalData", generalData],
    ["/tvlByChains", tvlByChains]
]);

[...handlersMap.entries()]
    .forEach(([route, handler]) => app.get(route, (...args) => errHandle(handler, ...args)))

const server = app.listen(process.env.PORT || 8081, function () {
    console.log("Backend started at", server.address(), "with ds url", dsUrl)
})

/* ---- HANDLERS SECTION ---- */

async function activeUsers(_: Request, res: Response) {
    let query = await prisma.$queryRaw<{ date_midnight: Date, active_users: BigInt }[]>
        `SELECT * FROM active_users`;

    let data = query?.map(x => ([x.date_midnight.getTime(), +x.active_users.toString()])) || [];
    res.json(data);
}

async function assetsDeposited(req: Request, res: Response) {
    let zoneInfo = await findZone(req.query.zone as string);
    if (!zoneInfo) {
        res.status(400);
        res.json(`Zone ${req.query.zone} doesnt exist`);
        return;
    }

    let query = `SELECT * FROM assets_deposited where zone = '${zoneInfo.zone}'`;
    let queryResult = await prisma.$queryRawUnsafe<{ date: Date; total_deposited: number; }[]>(query);

    let data = queryResult?.map((x: any) => ([x.date.getTime(), Number(x.total_deposited)])) || [];
    res.json(data);
}

async function assetsOnStakingWallets(_: Request, res: Response) {
    let [zones, query] = await Promise.all([
        prisma.zonesInfo.findMany({}),
        prisma.$queryRaw<{
            zone: string;
            latest_date: Date;
            past_day_date: Date;
            latest_assets: number;
            past_day_assets: number;
        }[]> `SELECT * FROM assets_on_staking_wallets`
    ]);

    let result = query
        ?.map(x => ({
            zone: x.zone,
            latestDate: x.latest_date.getTime(),
            latestAssets: x.latest_assets,
            pastDayDate: x.past_day_date.getTime(),
            pastDayAssets: x.past_day_assets,
            sortOrder: zones.find(y => y.zone === x.zone)?.sortOrder
        }))
        .sort((a, b) => a.zone > b.zone ? 1 : -1);

    res.json(result);
}

async function assetsRedeemed(req: Request, res: Response) {
    let zoneInfo = await findZone(req.query.zone as string);
    if (!zoneInfo) {
        res.status(400);
        res.json(`Zone ${req.query.zone} doesnt exist`);
        return;
    }

    let query = `SELECT * FROM assets_redeemed where zone = '${zoneInfo.zone}'`;
    let queryResult = await prisma.$queryRawUnsafe<{
        date: Date;
        zone: string;
        adjusted_redemptions: number;
    }[]>(query);

    let data = queryResult?.map(x => ([x.date.getTime(), x.adjusted_redemptions])) || [];
    res.json(data);
}

async function depositorsVolume(req: Request, res: Response) {
    let zoneInfo = await findZone(req.query.zone as string);
    if (!zoneInfo) {
        res.status(400);
        res.json(`Zone ${req.query.zone} doesnt exist`);
        return;
    }

    let query = `SELECT * FROM get_depositors_volume('${zoneInfo.zone}')`;
    let queryResult = await prisma.$queryRawUnsafe<{
        min_value: number;
        max_value: number;
        count: number;
    }[]>(query);

    let data = queryResult?.map(x => ({ range: [x.min_value, x.max_value], count: x.count }));
    res.json(data);
}

async function latestEvents(_: Request, res: Response) {
    let query = await prisma.$queryRaw<{
        date: Date;
        txhash: string;
        creator: string;
        tokenIn: number;
        tokenOut: number;
        usd_value: number;
        zone: string;
        action: "stake" | "redeem";
    }[]> `SELECT * FROM latest_events`;

    let result = query?.map(x => ({
        ...x,
        date: x.date.getTime(),
        tokenIn: +x.tokenIn.toFixed(2),
        tokenOut: +x.tokenOut.toFixed(2),
        value: x.usd_value,
    }));

    res.json(result);
}

async function protocolRevenue(_: Request, res: Response) {
    let query = await prisma.$queryRaw<{
        date: BigInt,
        fee: number,
        restake: number
    }[]> `SELECT * FROM protocol_revenue`;
    let data = query?.map(x => ({
        ...x,
        date: +x.date.toString()
    })) || [];
    res.json(data);
}

async function uniqueDepositors(_: Request, res: Response) {
    let query = await prisma.$queryRaw<{
        date: number,
        deps: number
    }[]>`SELECT * FROM unique_depositors`;

    let data = query?.map(x => ([+x.date, +x.deps.toString()])) as [number, number][] || [];
    res.json(data);
}

async function zonesInfo(_: Request, res: Response) {
    let zones = await prisma.zonesInfo.findMany({});

    res.json(zones);
}

async function redemptionRates(req: Request, res: Response) {
    let zoneInfo = await findZone(req.query.zone as string);
    if (!zoneInfo) {
        res.status(400);
        res.json(`Zone ${req.query.zone} doesnt exist`);
        return;
    }

    let query = await prisma.$queryRawUnsafe<{
        date: number,
        price: number,
        rate: number
    }[]>(`SELECT * FROM get_redemption_rates_and_prices('${zoneInfo.zone}')`);
    let data = query.map(x => ({
        ...x,
        date: +x.date.toString()
    }));

    res.json(data);
}

async function generalData(_req: Request, res: Response) {
    let [[{ mcap, vol }], tvl, prices] = await Promise.all([
        prisma.$queryRaw<{
            mcap: number,
            vol: number
        }[]>`
            SELECT * 
                FROM public."GeneralData"
            ORDER BY date desc
            LIMIT 1
        `,
        prisma.$queryRaw<{
            date: Date,
            zone: string,
            tvl: number
        }[]>`SELECT * FROM tvl_by_chains`,
        prisma.$queryRaw<{
            date: Date,
            price: number
        }[]>`
            SELECT
                date_trunc('day', "date") AS "date",
                AVG(price) AS "price"
            FROM
                public."PriceHistory"
            WHERE
                coin = 'stride'
                AND "vsCurrency" = 'usd'
            GROUP BY
                date_trunc('day', "date")
            ORDER BY
                "date"`
    ])

    let totalTvl = _.chain(tvl)
        .groupBy("zone")
        .map((v) => {
            let corrected = correctZeroTvl(v);
            return corrected.at(-1)?.tvl || 0;
        })
        .reduce((prev, curr) => prev + curr, 0)
        .valueOf();

    res.json({
        marketCap: mcap,
        vol,
        tvl: totalTvl,
        prices: prices.map(({ date, price }) => ([date.getTime(), price]))
    });
}

async function tvlByChains(_req: Request, res: Response) {
    let tvl = await prisma.$queryRaw<{
        date: Date,
        zone: string,
        tvl: number
    }[]>`SELECT * FROM tvl_by_chains`;

    let grouped = _.chain(tvl)
        .groupBy("zone")
        .map((v, k) => {
            let corrected = correctZeroTvl(v);

            return {
                zone: k,
                data: corrected
            }
        })
        .valueOf();

    // //cut data if there's no price for actual day (unreliable coingecko api)
    // let maxDate = Math.min(...tvl.map(r => r.data.at(-1)?.date!));
    // let sorted = tvl
    //     .map(r => ({
    //         ...r,
    //         data: r.data.filter(d => d.date <= maxDate)
    //     }))
    //     .sort((a, b) => a.zone > b.zone ? 1 : -1);
    // //
    // let data = sorted?.map((zoneData: TVLData) => ({
    //     zone: zoneData.zone,
    //     data: correctZeroTvl(zoneData.data)
    // }));

    res.json(grouped);
}

function correctZeroTvl(data: { date: Date; tvl: number; }[]) {
    let result: { date: number; tvl: number; }[] = [];
    let lastNonZeroTvl = Number(data[0].tvl);

    for (let i = 0; i < data.length; i++) {
        let tvl = Number(data[i].tvl);

        if (tvl > 0) {
            result.push({ date: data[i].date.getTime(), tvl });
            lastNonZeroTvl = tvl;
        }
        else {
            result.push({ date: data[i].date.getTime(), tvl: lastNonZeroTvl });
        }
    }

    return result;
}