import { Coin } from "@cosmjs/amino";
import { getMsgData, msgData } from ".";
import { insertData } from "../clickhouse";
import { CoinTuple, DecodedTx } from "../decoder";

export interface msgSendData extends msgData {
    fromAddress: string,
    toAddress: string,
    amount: CoinTuple[]
} 

export const insertMsgSend = async (tx: DecodedTx, msg: any) : Promise<void> => {
    let data = {
        ...getMsgData(tx),
        fromAddress: msg.fromAddress,
        toAddress: msg.toAddress,
        amount: msg.amount.map((x: Coin) => ([x.denom, x.amount]))
    };

    await insertData("msgs_MsgSend", data);
}