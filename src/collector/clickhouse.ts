import { createClient } from '@clickhouse/client'
import { DecodedBlock } from './decoder';
import { msgsMap } from './messages';

const client = createClient({
    host: process.env.CLICKHOUSE_HOST || "http://localhost:8123",
    password: process.env.CLICKHOUSE_PASS || "",
    database: process.env.CLICKHOUSE_DB || "Stride"
})

const insertStrideBlock = async (block: DecodedBlock) => {
    try {
        await client.insert({
            table: 'block_headers',
            values: [
                block.header
            ],
            format: 'JSONEachRow',
        });

        
        let savedMessages = 0;
        if (block.txs.length > 0) {
            await client.insert({
                table: 'transactions',
                values: block.txs.map(tx => ({
                    height: block.height,
                    txhash: tx.hash,
                    sender: tx.sender,
                    code: tx.code
                })),
                format: 'JSONEachRow',
            });

            for (const tx of block.txs) {
                for (const msg of tx.data.body.messages) {
                    //custom handler function for each Msg Type
                    let insertMsgHandler = msgsMap.get(msg.typeUrl);

                    if (insertMsgHandler) {
                        await insertMsgHandler(block.header!, tx, msg.value);
                        savedMessages++;
                    }
                }
            };
        }
        console.log(`Saved block ${block.height} with ${savedMessages} transactions`)
    } catch (e: any) {
        console.log(e)
    }
}

export {
    insertStrideBlock,
    client
};
