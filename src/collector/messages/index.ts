import { CoinTuple } from "..";
import { BlockHeader } from "../../apiWrapper";
import { client } from "../clickhouse";
import { DecodedTx } from "../decoder";
import { insertMsgLiquidStake } from "./msgLiquidStake";
import { insertMsgSend } from "./msgSend";
import { insertMsgWithdrawReward } from "./msgWithdrawDelegatorReward";
import { v4 as uuidv4 } from 'uuid';
import { getFeeFromEvents } from "../helpers";

export const msgsMap = new Map<string, (header: BlockHeader, tx: DecodedTx, msg: any) => Promise<void>>([
    ["/cosmos.bank.v1beta1.MsgSend", insertMsgSend],
    ["/stride.stakeibc.MsgLiquidStake", insertMsgLiquidStake],
    ["/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward", insertMsgWithdrawReward]
]); 

export const insertMsg = async (table: string, data: any): Promise<void> => {
    await client.insert({
        table: table,
        values: [data],
        format: 'JSONEachRow'
    });
}

//fills base fields that exist in any msg type
export const getMsgData = (tx: DecodedTx) => {
    let data: msgData = { 
        id: uuidv4(),
        txhash: tx.hash,
        fee: getFeeFromEvents(tx.events)
    }
    
    return data;
}

export interface msgData {
    id: string,
    txhash: string,
    fee: CoinTuple
} 