import Long from 'long';
import { DecodedTx } from "../decoder";
import { getValueByTwoKeys, parseCoin } from '../helpers';
import { prisma } from '../db';
import { getBaseTxData, insertRedemptionRate } from '.';

export const insertMsgLiquidStake = async (tx: DecodedTx, msg: any): Promise<void> => {
    let recievedStToken = parseCoin(getValueByTwoKeys(tx.tx_result.events, "coinbase", "amount"));
    let redemptionRate = Number((msg.amount as Long).toString()) / Number(recievedStToken[1]);
    let { zone } = await prisma.zonesInfo.findUniqueOrThrow({
        where: {
            stDenom: recievedStToken[0]?.toLowerCase()
        }
    });

    await prisma.msgLiquidStake.create({
        data: {
            ...getBaseTxData(tx),
            zone: zone,
            creator: msg.creator,
            amountDenom: msg.hostDenom,
            amountAmount: (msg.amount as Long).toString(),
            receivedStTokenAmount: recievedStToken[1],
            receivedStTokenDenom: recievedStToken[0]
        }
    })

    //set approximate redemption rate for tx's epoch
    if (!tx.date) {
        console.warn("insertRedemptionRate: wrong txdate");
        return;
    }
    await insertRedemptionRate(tx.date, redemptionRate, zone);
}