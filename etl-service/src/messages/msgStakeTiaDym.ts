import { getBaseTxData, insertRedemptionRate } from ".";
import { prisma } from "../db";
import { DecodedTx } from "../decoder";
import { getValueByKey } from '../helpers';

export const insertMsgStakeTiaDym = async (tx: DecodedTx, msg: any): Promise<void> => {
    let event = tx.tx_result.events.find(x => x.type === "liquid_stake");
    //failed tx
    if (!event)
        return;

    let nativeDenom = getValueByKey(event, "native_base_denom");
    let nativeAmount = Number(getValueByKey(event, "native_amount"));
    let { stDenom, zone } = await prisma.zonesInfo.findFirstOrThrow({
        where: { denom: nativeDenom },
        select: { stDenom: true, zone: true }
    });

    let stAmount = Number(getValueByKey(event, "sttoken_amount"));

    await prisma.msgLiquidStake.create({
        data: {
            ...getBaseTxData(tx),
            zone,
            creator: getValueByKey(event, "liquid_staker"),
            amountAmount: getValueByKey(event, "native_amount"),
            amountDenom: nativeDenom,
            receivedStTokenDenom: stDenom,
            receivedStTokenAmount: getValueByKey(event, "sttoken_amount")
        }
    })

    //set approximate redemption rate for tx's epoch
    if (!tx.date) {
        console.warn("insertRedemptionRate: wrong txdate");
        return;
    }
    await insertRedemptionRate(tx.date, nativeAmount, stAmount, zone);
}
