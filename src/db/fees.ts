import { client } from "./";

export const getLastCollectedFeesHeight = async (): Promise<{ zone: String, height: number }[]> => {
    let response = await client.query({
        query: `
            SELECT distinct zone, MAX(height) as height
            FROM Stride.zones_fees_collected
            GROUP BY zone
        `,
        clickhouse_settings: {
            wait_end_of_query: 1,
        },
    });
    let data = ((await response.json()) as any).data;
    return data.map((x: { zone: string, height: number }) => ({ zone: x.zone, height: x.height }));
}