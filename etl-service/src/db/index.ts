import { createClient } from '@clickhouse/client'

const chOpts = {
    username: process.env.CLICKHOUSE_USER || "default",
    url: process.env.CLICKHOUSE_HOST || "http://localhost:8123",
    password: process.env.CLICKHOUSE_PASS || "",
    database: process.env.CLICKHOUSE_DB || "Stride"
};

export const client = createClient(chOpts);

process.once('SIGINT', () => client.close());
process.once('SIGTERM', () => client.close());

export const insertData = async (table: string, data: any): Promise<void> => {
    if (Array.isArray(data) && data.length === 0)
        return;

    await client.insert({
        table: table,
        values: Array.isArray(data) ? data : [data],
        format: 'JSONEachRow'
    });
}

export type ClickhouseResponse<T> = {
    meta: any,
    data: T
}

export * from "./redemptionRates"
export * from "./prices"
export * from "./blocks"
export * from "./fees"