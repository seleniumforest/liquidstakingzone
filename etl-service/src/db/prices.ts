import { ClickhouseResponse, client, insertData } from "./";

//todo fix this shitty flag parameter
export const getPrices = async (vsStTokens: boolean): Promise<{ coin: string, latestDate: number }[]> => {
    let response = await client.query({
        query: `
            SELECT coin, MAX(date) as latestDate
            FROM Stride.price_history
            WHERE vsCurrency ${vsStTokens ? `!=` : `=`} 'usd'
            GROUP BY coin
        `,
        clickhouse_settings: {
            wait_end_of_query: 1,
        },
    });

    let res = await response.json<ClickhouseResponse<{ coin: string, latestDate: number }[]>>();
    debugger;
    return [];
    // return res.data.map(x => ({
    //     coin: x.data,
    //     latestDate: +x.latestDate
    // }));
}

export const insertPrices = async (prices: Price[]) => {
    return await insertData('price_history', prices);
}

export interface Price {
    id: string,
    coin: string,
    date: number,
    price: number,
    vsCurrency: string
}