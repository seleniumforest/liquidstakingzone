import { Coin } from "@cosmjs/amino";
import { v4 as uuidv4 } from 'uuid';
import { insertMsg, msgData } from ".";
import { CoinTuple } from "..";
import { BlockHeader } from "../../apiWrapper";
import { DecodedTx } from "../decoder";
import { getFeeFromEvents } from "../helpers";

export interface msgSendData extends msgData {
    fromAddress: string,
    toAddress: string,
    amount: CoinTuple[]
} 

export const insertMsgSend = async (header: BlockHeader, tx: DecodedTx, msg: any) : Promise<void> => {
    await insertMsg("msgs_MsgSend", transformMsgSendData(header, tx, msg));
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