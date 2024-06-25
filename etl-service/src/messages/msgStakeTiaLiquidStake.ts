import { getMsgBaseData } from ".";
import { insertData } from '../db/';
import { DecodedTx } from "../decoder";
import { denomToZone, getValueByKey } from '../helpers';
import { insertRedemptionRate, msgLiquidStake } from './msgLiquidStake';
import { zones } from '../constants';

export const insertMsgStakeTiaLiquidStake = async (tx: DecodedTx, msg: any): Promise<void> => {
    let event = tx.tx_result.events.find(x => x.type === "liquid_stake");
    //failed tx
    if (!event)
        return;

    let nativeDenom = getValueByKey(event, "native_base_denom");
    let nativeAmount = Number(getValueByKey(event, "native_amount"));
    let stDenom = zones.find(x => x.denom === nativeDenom)?.stDenom || "";
    let stAmount = Number(getValueByKey(event, "sttoken_amount"));
    let redemptionRate = nativeAmount / stAmount;
    let data: msgLiquidStake = {
        ...getMsgBaseData(tx),
        zone: denomToZone(nativeDenom),
        creator: getValueByKey(event, "liquid_staker"),
        amount: [nativeDenom, getValueByKey(event, "native_amount")],
        recievedStTokenAmount: [stDenom, getValueByKey(event, "sttoken_amount")],
        redemptionRate
    };
    await insertData("msgs_MsgLiquidStake", data);

    //set approximate redemption rate for tx's epoch
    if (!tx.date) {
        console.warn("insertRedemptionRate: wrong txdate");
        return;
    }
    await insertRedemptionRate(tx.date * 1000, redemptionRate, data.zone);
}
