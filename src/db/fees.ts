import { client } from "./";

export const getLastCollectedFeesHeight = async (): Promise<{ zone: String, height: number }[]> => {
    let response = await client.query({
        query: `
            SELECT distinct zone, MAX(height) as height
            FROM Stride.zones_restakes
            GROUP BY zone
        `,
        clickhouse_settings: {
            wait_end_of_query: 1,
        },
    });
    let data = ((await response.json()) as any).data;
    return data.map((x: { zone: string, height: number }) => ({ zone: x.zone, height: x.height }));
}

export const isFeeTxExist = async (zone: string, sequence: number, type: string) => {
    let response = await client.query({
        query: `
            select count(*) as matched
            from Stride.zones_restakes
            where zone = '${zone}' and sequence = ${sequence} and type = '${type}'
        `,
        clickhouse_settings: {
            wait_end_of_query: 1,
        },
    });
    let data = ((await response.json()) as any).data;
    return Number(data[0].matched) > 0;
}