import Long from 'long';
import { DecodedTx } from "../decoder";
import { fromBech32 } from '@cosmjs/encoding';
import { prisma } from '../db';
import { getBaseTxData, insertRedemptionRate } from '.';
import { getValueByKey } from '../helpers';


export const insertMsgRedeemStake = async (tx: DecodedTx, msg: any): Promise<void> => {
    if (tx.tx_result.code != 0)
        return;

    let amount = (msg.amount as Long).toString();
    let zone = fromBech32(msg.receiver).prefix;
    await prisma.msgRedeemStake.create({
        data: {
            ...getBaseTxData(tx),
            creator: msg.creator,
            amount,
            hostZone: msg.hostZone,
            receiver: msg.receiver,
            zone
        }
    });

    //old redeemstake txs like this BCF51A6DF52A89F7E5A7C51C01067B0EA6CC44AD68F771FA5E1B28FF6AF9742B 
    //do not produce redeem_stake event and do not show how much tokens will be redeemed (nativeAmount)
    let redeemEvent = tx.tx_result.events.find(x => x.type === "redeem_stake");
    if (!redeemEvent)
        return;

    let nativeAmount = getValueByKey(redeemEvent, "native_amount");

    await insertRedemptionRate(tx.date, nativeAmount, amount, zone);
}