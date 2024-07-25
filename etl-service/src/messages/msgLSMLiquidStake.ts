import { getBaseTxData, insertRedemptionRate } from ".";
import { prisma } from "../db";
import { DecodedTx } from "../decoder";
import { getValueByKey } from '../helpers';

export const insertMsgLSMLiquidStake = async (tx: DecodedTx, _msg: any): Promise<void> => {
    let event = tx.tx_result.events.find(x => x.type === "lsm_liquid_stake");
    //failed tx
    if (!event)
        return;

    let eventSuccess = getValueByKey(event, "transaction_status") === "success";
    if (!eventSuccess)
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
            receivedStTokenAmount: getValueByKey(event, "sttoken_amount"),
            receivedStTokenDenom: stDenom
        }
    });

    //set approximate redemption rate for tx's epoch
    if (!tx.date) {
        console.warn("insertMsgLSMLiquidStake: wrong txdate");
        return;
    }

    await insertRedemptionRate(tx.date, nativeAmount, stAmount, zone);
}