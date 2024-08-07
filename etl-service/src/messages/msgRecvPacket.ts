import { DecodedTx } from "../decoder";
import { prisma } from "../db";
import { getAttributeValue } from "../helpers";
import { getBaseTxData, insertRedemptionRate } from ".";
import { fromBech32 } from "@cosmjs/encoding";

export const insertMsgRecvPacket = async (tx: DecodedTx, msg: any, msgIndexInTx?: number): Promise<void> => {
    let liquidStakeEvents = tx.tx_result.events.filter(evt => evt.type === "liquid_stake");

    if (liquidStakeEvents.length > 1 && !msgIndexInTx) {
        console.warn(`insertMsgRecvPacket: multiple liquid staking events were found in log, but no index provided. Hash ${tx.hash}`);
    }

    //we should rely on msg index to find event in ungrouped by msgIndex array 
    let liquidStakeEvent = liquidStakeEvents.length > 1 && msgIndexInTx ? liquidStakeEvents[msgIndexInTx - 1] : liquidStakeEvents.at(0)
    if (!liquidStakeEvent)
        return;

    let isAutopilot = false;
    let packetSender = "";
    try {
        let msgPacket = JSON.parse(new TextDecoder().decode(msg.packet.data));
        isAutopilot = typeof JSON.parse(msgPacket.receiver)?.autopilot === "object";
        if (isAutopilot)
            packetSender = msgPacket.sender;
    } catch (e: any) { }

    let stakedBaseDenom = liquidStakeEvent.attributes.find(attr => attr.key === "native_base_denom")?.value;
    if (!stakedBaseDenom || !isAutopilot || !packetSender)
        return;

    let { zone, denom, stDenom } = await prisma.zonesInfo.findFirstOrThrow({
        where: { zone: fromBech32(packetSender).prefix }
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