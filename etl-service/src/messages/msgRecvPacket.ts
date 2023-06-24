import Big from "big.js";
import { getMsgBaseData } from ".";
import { zones } from "../constants";
import { insertData } from "../db";
import { DecodedTx } from "../decoder";
import { insertRedemptionRate, msgLiquidStake } from "./msgLiquidStake";

export const insertMsgRecvPacket = async (tx: DecodedTx, msg: any): Promise<void> => {
    let liquidStakeEvent = tx.tx_result.events.find(evt => evt.type === "liquid_stake");
    let msgPacket: any = undefined;
    let autopilot: any = undefined;
    try {
        msgPacket = JSON.parse(new TextDecoder().decode(msg.packet.data));
        autopilot = JSON.parse(msgPacket.receiver);
    } catch (e: any) {
        console.error(`insertMsgRecvPacket error ${e?.message}`);
        return;
    }

    if (!msgPacket || !liquidStakeEvent || !autopilot)
        return;

    let zone = zones.find(z => z.denom === msgPacket.denom)!;
    if (!zone) {
        console.error(`insertMsgRecvPacket: height ${tx.height} zone for denom ${msgPacket.denom} not found`);
        return;
    };

    let sender = getAttributeValue(liquidStakeEvent.attributes, "liquid_staker");
    let amount = getAttributeValue(liquidStakeEvent.attributes, "native_amount");
    let stAmount = getAttributeValue(liquidStakeEvent.attributes, "sttoken_amount");
    let ibcSeq = msg.packet.sequence.toString();

    let data: msgLiquidStake = {
        ...getMsgBaseData(tx),
        zone: zone.zone,
        creator: sender,
        amount: [zone.denom, amount],
        recievedStTokenAmount: [zone.stDenom, stAmount],
        ibcSeq,
        redemptionRate: Big(amount).div(Big(stAmount)).toNumber()
    };

    await insertData("msgs_MsgLiquidStake", data);
    if (!tx.date) {
        console.warn("insertRedemptionRate: wrong txdate");
        return;
    }
    await insertRedemptionRate(tx.date * 1000, data.redemptionRate, data.zone);
}

const getAttributeValue = (attrs: any[], key: string) => {
    let attribute = attrs.find(attr => attr.key === key);
    return attribute.value || "";
} 