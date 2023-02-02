import Long from 'long';
import { getMsgBaseData, msgData } from ".";
import { insertData } from '../clickhouse';
import { DecodedTx } from "../decoder";
import { getZoneFromAddress } from '../helpers';

export interface msgRedeemStake extends msgData {
    creator: string,
    amount: string,
    hostZone: string,
    receiver: string,
    zone: string
} 

export const insertMsgRedeemStake = async (tx: DecodedTx, msg: any) : Promise<void> => {
    let data: msgRedeemStake = {
        ...getMsgBaseData(tx),
        creator: msg.creator,
        amount: (msg.amount as Long).toString(),
        hostZone: msg.hostZone,
        receiver: msg.receiver,
        zone: getZoneFromAddress(msg.receiver)
    }

    await insertData("msgs_MsgRedeemStake", data)
}