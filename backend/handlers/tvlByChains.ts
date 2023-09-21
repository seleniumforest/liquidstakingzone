import { Request, Response } from "express";
import { supportedZones, Zone } from "../constants";
import { ClickhouseResponse, client } from "../db";

export type TVLData = {
    zone: Zone | "total",
    data: TVLDataRecord[]
}

type TVLDataRecord = {
    date: number,
    tvl: number;
}

export const tvlByChains = async (req: Request, res: Response) => {
    let result: TVLData[] = [];

    await Promise.allSettled(
        supportedZones.map(async (zone) => result.push({
            zone,
            data: await getTvlData(zone)
        }))
    );

    //cut data if there's no price for actual day (unreliable coingecko api)
    let maxDate = Math.min(...result.map(r => r.data.at(-1)?.date!));
    let sorted = result
        .map(r => ({
            ...r,
            data: r.data.filter(d => d.date <= maxDate)
        }))
        .sort((a, b) => a.zone > b.zone ? 1 : -1);
    //

    let data = sorted?.map((zoneData: TVLData) => ({
        zone: zoneData.zone,
        data: correctZeroTvl(zoneData.data)
    }));

    res.json(data);
}

const correctZeroTvl = (data: { date: number, tvl: number }[]) => {
    let result: any[] = [];
    let lastNonZeroTvl = Number(data[0].tvl);

    for (let i = 0; i < data.length; i++) {
        let tvl = Number(data[i].tvl);

        if (tvl > 0) {
            result.push({ date: Number(data[i].date), tvl })
            lastNonZeroTvl = tvl;
        }
        else {
            result.push({ date: Number(data[i].date), tvl: lastNonZeroTvl })
        }
    }

    return result;
}

export const getTvlData = async (zone: Zone): Promise<TVLDataRecord[]> => {
    let query = await client.query({
        query: `SELECT * FROM tvl_by_chains(zone_name='${zone}')`
    });

    let response = (await query.json()) as ClickhouseResponse<TVLDataRecord[]>;

    return response.data;
}