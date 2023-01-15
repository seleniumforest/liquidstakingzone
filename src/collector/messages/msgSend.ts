import { Coin } from "@cosmjs/amino";
import { getMsgData, insertMsg, msgData } from ".";
import { CoinTuple } from "..";
import { DecodedTx } from "../decoder";

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

    await insertMsg("msgs_MsgSend", data);
}