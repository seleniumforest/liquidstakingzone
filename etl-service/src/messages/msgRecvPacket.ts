import Big from "big.js";
import { DecodedTx } from "../decoder";
import { prisma } from "../db";
import { getAttributeValue } from "../helpers";
import { getBaseTxData, insertRedemptionRate } from ".";

export const insertMsgRecvPacket = async (tx: DecodedTx, msg: any): Promise<void> => {
    let liquidStakeEvent = tx.tx_result.events.find(evt => evt.type === "liquid_stake");
    if (!liquidStakeEvent)
        return;

    let isAutopilot = false;
    try {
        let msgPacket = JSON.parse(new TextDecoder().decode(msg.packet.data));
        isAutopilot = typeof JSON.parse(msgPacket.receiver)?.autopilot === "object";
    } catch (e: any) { }

    let stakedBaseDenom = liquidStakeEvent.attributes.find(attr => attr.key === "native_base_denom")?.value;
    if (!stakedBaseDenom || !isAutopilot)
        return;

    let { zone, denom, stDenom } = await prisma.zonesInfo.findFirstOrThrow({
        where: { denom: stakedBaseDenom }
    });

    let sender = getAttributeValue(liquidStakeEvent.attributes, "liquid_staker");
    let amount = getAttributeValue(liquidStakeEvent.attributes, "native_amount");
    let stAmount = getAttributeValue(liquidStakeEvent.attributes, "sttoken_amount");
    let ibcSeq = msg.packet.sequence.toString();

    await prisma.msgLiquidStake.create({
        data: {
            ...getBaseTxData(tx),
            zone: zone,
            creator: sender,
            amountAmount: amount,
            amountDenom: denom,
            receivedStTokenAmount: stAmount,
            receivedStTokenDenom: stDenom,
            ibcSeq
        }
    })

    if (!tx.date) {
        console.warn("insertRedemptionRate: wrong txdate");
        return;
    }
    await insertRedemptionRate(tx.date, amount, stAmount, zone);
}