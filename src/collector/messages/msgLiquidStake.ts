import Long from 'long';
import { v4 as uuidv4 } from 'uuid';
import { insertMsg, msgData } from ".";
import { BlockHeader } from "../../apiWrapper";
import { DecodedTx } from "../decoder";
import { getFeeFromEvents } from "../helpers";

export interface msgLiquidStake extends msgData {
    creator: string,
    amount: string,
    hostDenom: string
} 

export const insertMsgLiquidStake = async (header: BlockHeader, tx: DecodedTx, msg: any) : Promise<void> => {
    await insertMsg("msgs_MsgLiquidStake", transformMsgSendData(header, tx, msg))
}

const transformMsgSendData = (header: BlockHeader, tx: DecodedTx, msg: any) : msgLiquidStake => {
    let result = {
        id: uuidv4(),
        code: tx.code,
        height: header.height,
        txhash: tx.hash,
        fee: getFeeFromEvents(tx.events),
        creator: msg.creator,
        amount: (msg.amount as Long).toString(),
        hostDenom: msg.hostDenom
    }

    return result;
}