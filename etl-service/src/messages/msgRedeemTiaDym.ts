import { getBaseTxData, insertRedemptionRate } from ".";
import { prisma } from "../db";
import { DecodedTx } from "../decoder";
import { getValueByKey } from '../helpers';

export const insertMsgRedeemTiaDym = async (tx: DecodedTx, msg: any): Promise<void> => {
    let redeemEvent = tx.tx_result.events.find(x => x.type === "redeem_stake");
    //failed tx
    if (!redeemEvent)
        return;

    let hostZone = getValueByKey(redeemEvent, "host_zone");
    let nativeAmount = getValueByKey(redeemEvent, "native_amount");
    let stTokenAmount = getValueByKey(redeemEvent, "sttoken_amount");
    let nativeDenom = getValueByKey(redeemEvent, "native_base_denom");

    let { zone } = await prisma.zonesInfo.findFirstOrThrow({
        where: { denom: nativeDenom },
        select: { stDenom: true, zone: true }
    });

    await prisma.msgRedeemStake.create({
        data: {
            ...getBaseTxData(tx),
            zone,
            creator: msg.redeemer,
            amount: stTokenAmount,
            hostZone: hostZone,
            receiver: msg.redeemer
        }
    });

    if (!tx.date) {
        console.warn("insertRedemptionRate: wrong txdate");
        return;
    }
    await insertRedemptionRate(tx.date, nativeAmount, stTokenAmount, zone);
}
