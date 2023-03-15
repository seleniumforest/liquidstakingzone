import { createClient } from '@clickhouse/client'
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, './.env') });

export const client = createClient({
    username: process.env.CLICKHOUSE_USER || "default",
    host: process.env.CLICKHOUSE_HOST || "http://localhost:8123",
    password: process.env.CLICKHOUSE_PASS || "",
    database: process.env.CLICKHOUSE_DB || "Stride"
})

export type ClickhouseResponse<T> = {
    meta: any,
    data: T
}

process.once('SIGINT', () => client.close());
process.once('SIGTERM', () => client.close());