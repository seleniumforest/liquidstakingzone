import Long from 'long';
import { getMsgData, insertMsg, msgData } from ".";
import { DecodedTx } from "../decoder";

export interface msgLiquidStake extends msgData {
    creator: string,
    amount: string,
    hostDenom: string
} 

export const insertMsgLiquidStake = async (tx: DecodedTx, msg: any) : Promise<void> => {
    let data = {
        ...getMsgData(tx),
        creator: msg.creator,
        amount: (msg.amount as Long).toString(),
        hostDenom: msg.hostDenom
    };

    await insertMsg("msgs_MsgLiquidStake", data)
}