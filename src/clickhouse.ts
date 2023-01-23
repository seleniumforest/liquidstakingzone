import { createClient } from '@clickhouse/client'
import { number } from 'yargs';
import { DecodedBlock } from './decoder';
import { Price } from './integrations/coingecko';
import { msgsMap } from './messages';

export const client = createClient({
    host: process.env.CLICKHOUSE_HOST || "http://localhost:8123",
    password: process.env.CLICKHOUSE_PASS || "",
    database: process.env.CLICKHOUSE_DB || "Stride"
})

export const insertData = async (table: string, data: any): Promise<void> => {
    await client.insert({
        table: table,
        values: data,//Array.isArray(data) ? data : [data],
        format: 'JSONEachRow'
    });
}

export const insertStrideBlock = async (block: DecodedBlock) => {
    try {
        //insert block header
        await insertData("block_headers", block.header)


        let knownMsgsCount = 0;
        let unknownMsgsCount = 0;
        if (block.txs.length > 0) {
            await insertData('transactions', block.txs.map(tx => ({
                height: block.height,
                txhash: tx.hash,
                sender: tx.sender,
                code: tx.tx_result.code,
                rawdata: JSON.stringify(tx)
            })))

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

const getLastBlock = async (): Promise<{ height: number, hashes: string[] }> => {
    let response = await client.query({
        query: `
            SELECT txhash, height FROM Stride.transactions
            WHERE height = (
                SELECT MAX(height) 
                FROM Stride.transactions
            )
        `,
        clickhouse_settings: {
            wait_end_of_query: 1,
        },
    });
    let data = ((await response.json()) as any).data;

    return {
        hashes: data.map((x: { height: number, txhash: string }) => x.txhash),
        height: data[0].height
    }
}

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

//In the case of indexer crashes on block n, we need to clean this block data to aviod inconsistency
export const prepareDbToWrite = async () => {
    let lastBlock = await getLastBlock();
    let hashesString = lastBlock.hashes.map(x => `\'${x}\'`).join(",");
    let queries = [
        `ALTER TABLE Stride.transactions DELETE WHERE height = ${lastBlock.height}`,
        `ALTER TABLE Stride.block_headers DELETE WHERE height = ${lastBlock.height}`,
        `ALTER TABLE Stride.msgs_MsgSend DELETE WHERE txhash in (${hashesString})`,
        `ALTER TABLE Stride.msgs_MsgWithdrawDelegatorReward DELETE WHERE txhash in (${hashesString})`,
        `ALTER TABLE Stride.msgs_MsgDelegate DELETE WHERE txhash in (${hashesString})`,
        `ALTER TABLE Stride.msgs_MsgLiquidStake DELETE WHERE txhash in (${hashesString})`,
        `ALTER TABLE Stride.msgs_MsgRedeemStake DELETE WHERE txhash in (${hashesString})`
    ];

    let result = await Promise.allSettled(
        queries.map(async (query) => {
            await client.exec({
                query
            });
        })
    );
    //todo check, are all result promises fulfilled?

    return lastBlock.height - 1;
}