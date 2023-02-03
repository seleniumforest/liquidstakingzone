import { client, insertData } from "./";

export const getPrices = async (): Promise<{ coin: string, latestDate: number }[]> => {
    let response = await client.query({
        query: `
            SELECT coin, MAX(date) as latestDate
            FROM Stride.price_history
            GROUP BY coin
        `,
        clickhouse_settings: {
            wait_end_of_query: 1,
        },
    });
    let data = ((await response.json()) as any).data;

    return data.map(({ coin, latestDate }: { coin: string, latestDate: number }) => ({ coin, latestDate: Number(latestDate) }));
}

export const insertPrices = async (prices: Price[]) => {
    return await insertData('price_history', prices);
}

export interface Price {
    id: string,
    coin: string,
    date: number,
    price: number,
}