import { BlocksWatcherContext, IndexedBlock } from 'cosmos-indexer';
import { DecodedBlock } from '../decoder';
import { msgsMap } from '../messages';
import { client, insertData } from './';

export const insertBlock = async (ctx: BlocksWatcherContext, block: DecodedBlock) => {
    try {
        //insert block header
        if (block.header)
            await insertData("block_headers", {
                height: block.header.height,
                hash: block.id,
                date: Math.round(Date.parse(block.header.time) / 1000),
                chainId: block.header.chainId
            })


        let knownMsgsCount = 0;
        let unknownMsgsCount = 0;
        if (block.txs.length > 0) {
            await insertData('transactions', block.txs.map(tx => ({
                height: block.header.height,
                txhash: tx.hash,
                sender: tx.sender,
                code: tx.tx_result.code,
                date: Math.round(Date.parse(block.header.time) / 1000)
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
        console.log(`Saved block ${block.header.height} with total ${block.txs.length} transactions, ${knownMsgsCount} known messages, ${unknownMsgsCount} unknown`)
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

//In the case of indexer crashes on block n, we need to clean this block data to aviod inconsistency
//returns block height to conwinue process with.
export const prepareDbToWrite = async (): Promise<number> => {
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
        await client.exec({
            query,
            clickhouse_settings: {
                wait_end_of_query: 1,
            }
        });
    }

    return lastBlock.height;
}