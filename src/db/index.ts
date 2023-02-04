import { createClient } from '@clickhouse/client'
import * as dotenv from 'dotenv';
dotenv.config();

export const client = createClient({
    username: process.env.CLICKHOUSE_USER || "default",
    host: process.env.CLICKHOUSE_HOST || "http://localhost:8123",
    password: process.env.CLICKHOUSE_PASS || "",
    database: process.env.CLICKHOUSE_DB || "Stride"
})

process.once('SIGINT', () => client.close());
process.once('SIGTERM', () => client.close());

export const insertData = async (table: string, data: any): Promise<void> => {
    await client.insert({
        table: table,
        values: Array.isArray(data) ? data : [data],
        format: 'JSONEachRow'
    });
}

export * from "./redemptionRates"
export * from "./prices"
export * from "./blocks"
export * from "./fees"