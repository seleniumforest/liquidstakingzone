import { createClient } from '@clickhouse/client'
import { DecodedBlock } from './decoder';
import { msgsMap } from './messages';

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

export const insertBlock = async (block: DecodedBlock) => {
    try {
        //insert block header
        if (block.header)
            await insertData("block_headers", block.header)


        let knownMsgsCount = 0;
        let unknownMsgsCount = 0;
        if (block.txs.length > 0) {
            await insertData('transactions', block.txs.map(tx => ({
                height: block.height,
                txhash: tx.hash,
                sender: tx.sender,
                code: tx.tx_result.code,
                date: block.date,
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
        console.log(`Saved block ${block.height} with total ${block.txs.length} transactions, ${knownMsgsCount} known messages, ${unknownMsgsCount} unknown`)
    } catch (e: any) {
        console.log(e)
    }
}

export const getLastBlock = async (): Promise<{ height: number, hashes: string[] }> => {
    let response = await client.query({
        query: `
            SELECT bhs.height as height, txhash 
            FROM Stride.transactions txs 
            RIGHT JOIN (
                SELECT *
                FROM Stride.block_headers bhs
                WHERE height = (SELECT MAX(height) FROM Stride.block_headers)
            ) as bhs on txs.height = bhs.height
        `,
        clickhouse_settings: {
            wait_end_of_query: 1,
        },
    });
    let data = ((await response.json()) as any).data;
    if (!data.length)
        return {
            height: 0,
            hashes: []
        };

    return {
        hashes: data.map((x: { height: number, txhash: string }) => x.txhash),
        height: data[0].height
    }
}

export const getLastCollectedFeesHeight = async (): Promise<{ zone: String, height: number }[]> => {
    let response = await client.query({
        query: `
            SELECT distinct zone, MAX(height) as height
            FROM Stride.zones_fees_collected
            GROUP BY zone
        `,
        clickhouse_settings: {
            wait_end_of_query: 1,
        },
    });
    let data = ((await response.json()) as any).data;
    return data.map((x: { zone: string, height: number }) => ({ zone: x.zone, height: x.height }));
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
    if (lastBlock.height === 0)
        return 0;

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

    for (const query of queries) {
        let result = await client.exec({
            query,
            clickhouse_settings: {
                wait_end_of_query: 1,
            }
        });
    }

    return lastBlock.height;
}

export const getRedemptionRates = async () : Promise<RedemptionRate[]> => {
    let response = await client.query({
        query: `
            SELECT *
            FROM Stride.redemptionRates
        `,
        clickhouse_settings: {
            wait_end_of_query: 1,
        },
    });
    let data = ((await response.json()) as any).data;

    return data.map((rate: RedemptionRate) => rate);
}

export interface RedemptionRate {
    epochNumber: number,
    dateStart: number,
    dateEnd: number,
    redemptionRate: number,
    zone: string
}

export const setRedemptionRate = async (rate: RedemptionRate) => {
    return await insertData("redemptionRates", rate);
}
export const deleteRedemptionRate = async (epoch: number, zone: string) => {
    await client.exec({
        query: `ALTER TABLE Stride.redemptionRates DELETE WHERE epochNumber = ${epoch} AND zone = '${zone}'`,
        clickhouse_settings: {
            wait_end_of_query: 1,
        }
    });
}