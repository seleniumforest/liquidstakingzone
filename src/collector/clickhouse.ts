import { createClient } from '@clickhouse/client'
import { BlockHeader } from '../apiWrapper';

const client = createClient({
    host: process.env.CLICKHOUSE_HOST || "http://localhost:8123",
    password: process.env.CLICKHOUSE_PASS || "",
    database: process.env.CLICKHOUSE_DB || "Stride"
})

const insertBlockHeader = async (header: BlockHeader) => {
    try {
        await client.insert({
            table: 'block_headers',
            values: [
                header
            ],
            format: 'JSONEachRow',
        });
        console.log("Inserted \n", header)
    } catch (e: any) {
        console.log(e)
    }
}

export {
    insertBlockHeader
};
