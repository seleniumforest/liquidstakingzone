import { client, insertData } from "."
import { CoinTuple } from "../decoder"

export const getAccountBalance = async (account: string) => {
    let response = await client.query({
        query: `
            SELECT *
            FROM Stride.account_balances_history
            WHERE address = '${account}' ORDER BY date DESC
        `,
        clickhouse_settings: {
            wait_end_of_query: 1,
        },
    });
    let data = ((await response.json()) as any).data;

    return data.map((x: Balance) => x)
}

export const insertAccountBalance = async (balance: Balance) => {
    await insertData("account_balances_history", balance);
}

export interface Balance {
    id: string,
    zone: string,
    address: string,
    date: number,
    assets: CoinTuple[]
}