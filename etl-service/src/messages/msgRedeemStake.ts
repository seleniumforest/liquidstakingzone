import Long from 'long';
import { DecodedTx } from "../decoder";
import { fromBech32 } from '@cosmjs/encoding';
import { prisma } from '../db';
import { getBaseTxData } from '.';


export const insertMsgRedeemStake = async (tx: DecodedTx, msg: any): Promise<void> => {
    await prisma.msgRedeemStake.create({
        data: {
            ...getBaseTxData(tx),
            creator: msg.creator,
            amount: (msg.amount as Long).toString(),
            hostZone: msg.hostZone,
            receiver: msg.receiver,
            zone: fromBech32(msg.receiver).prefix
        }
    })
}