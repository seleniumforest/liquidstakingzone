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
        //insert block header
        await client.insert({
            table: 'block_headers',
            values: [
                block.header
            ],
            format: 'JSONEachRow',
        });

        
        let knownMsgsCount = 0;
        let unknownMsgsCount = 0;
        if (block.txs.length > 0) {
            //insert transactions
            await client.insert({
                table: 'transactions',
                values: block.txs.map(tx => ({
                    height: block.height,
                    txhash: tx.hash,
                    sender: tx.sender,
                    code: tx.tx_result.code,
                    rawdata: JSON.stringify(tx)
                })),
                format: 'JSONEachRow',
            });

            //insert each msg
            for (const tx of block.txs) {
                for (const msg of tx.tx_result.data.body.messages) {
                    //custom handler function for each Msg Type
                    let insertMsgHandler = msgsMap.get(msg.typeUrl);

                    if (insertMsgHandler) {
                        await insertMsgHandler(tx, msg.value);
                        knownMsgsCount++;
                    }
                    else {
                        unknownMsgsCount++;
                    }
                }
            };
        }
        console.log(`Saved block ${block.height} with ${knownMsgsCount} known messages, ${unknownMsgsCount} unknown`)
    } catch (e: any) {
        console.log(e)
    }
}

export {
    insertStrideBlock,
    client
};
