import { Coin } from "@cosmjs/amino";
import { getMsgData, insertMsg, msgData } from ".";
import { CoinTuple } from "..";
import { BlockHeader } from "../../apiWrapper";
import { DecodedTx } from "../decoder";

export interface msgSendData extends msgData {
    fromAddress: string,
    toAddress: string,
    amount: CoinTuple[]
} 

export const insertMsgSend = async (header: BlockHeader, tx: DecodedTx, msg: any) : Promise<void> => {
    await insertMsg("msgs_MsgSend", getMsgSendData(tx, msg));
}

const getMsgSendData = (tx: DecodedTx, msg: any) : msgSendData => {
    let result = {
        ...getMsgData(tx),
        fromAddress: msg.fromAddress,
        toAddress: msg.toAddress,
        amount: msg.amount.map((x: Coin) => ([x.denom, x.amount]))
    }

    return result;
}