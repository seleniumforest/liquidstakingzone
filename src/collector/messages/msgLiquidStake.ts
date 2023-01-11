import Long from 'long';
import { getMsgData, insertMsg, msgData } from ".";
import { BlockHeader } from "../../apiWrapper";
import { DecodedTx } from "../decoder";

export interface msgLiquidStake extends msgData {
    creator: string,
    amount: string,
    hostDenom: string
} 

export const insertMsgLiquidStake = async (header: BlockHeader, tx: DecodedTx, msg: any) : Promise<void> => {
    await insertMsg("msgs_MsgLiquidStake", getMsgSendData(tx, msg))
}

const getMsgSendData = (tx: DecodedTx, msg: any) : msgLiquidStake => {
    let result = {
        ...getMsgData(tx),
        creator: msg.creator,
        amount: (msg.amount as Long).toString(),
        hostDenom: msg.hostDenom
    }

    return result;
}