import { Coin } from "@cosmjs/amino";
import { v4 as uuidv4 } from 'uuid';
import { DecodedTx } from "..";
import { BlockHeader } from "../../apiWrapper";
import { client } from "../clickhouse";
import { CoinTuple, getFeeFromEvents } from "../helpers";

export interface msgData {
    id: string,
    code: number,
    height: number,
    txhash: string,
    fee: CoinTuple
} 

export interface msgSendData extends msgData {
    fromAddress: string,
    toAddress: string,
    amount: CoinTuple[]
} 

const insertMsgSend = async (header: BlockHeader, tx: DecodedTx, msg: any) : Promise<void> => {
    let data = transformMsgSendData(header, tx, msg);

    await client.insert({
        table: 'msgs_MsgSend',
        values: [data],
        format: 'JSONEachRow'
    });
}

const transformMsgSendData = (header: BlockHeader, tx: DecodedTx, msg: any) : msgSendData => {
    let result: msgSendData = {
        id: uuidv4(),
        code: tx.code,
        height: header.height,
        txhash: tx.hash,
        fromAddress: msg.fromAddress,
        toAddress: msg.toAddress,
        amount: msg.amount.map((x: Coin) => ([x.denom, x.amount])),
        fee: getFeeFromEvents(tx.events)
    }

    return result;
}

export { 
    insertMsgSend
}