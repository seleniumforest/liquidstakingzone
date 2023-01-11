import Long from 'long';
import { getMsgData, insertMsg, msgData } from ".";
import { DecodedTx } from "../decoder";

export interface msgRedeemStake extends msgData {
    creator: string,
    amount: string,
    hostZone: string,
    receiver: string
} 

export const insertMsgRedeemStake = async (tx: DecodedTx, msg: any) : Promise<void> => {
    await insertMsg("msgs_MsgRedeemStake", getMsgRedeemStakeData(tx, msg))
}

const getMsgRedeemStakeData = (tx: DecodedTx, msg: any) : msgRedeemStake => {
    let result = {
        ...getMsgData(tx),
        creator: msg.creator,
        amount: (msg.amount as Long).toString(),
        hostZone: msg.hostZone,
        receiver: msg.receiver
    }

    return result;
}