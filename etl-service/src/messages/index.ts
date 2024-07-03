
import { insertMsgLiquidStake } from "./msgLiquidStake";
import { insertMsgRedeemStake } from "./msgRedeemStake";
import { insertMsgAcknowledgement } from "./msgAcknowledgement";
import { insertMsgRecvPacket } from "./msgRecvPacket";
import { insertMsgLSMLiquidStake } from "./msgLSMLiquidStake";
import { insertMsgStakeTiaLiquidStake } from "./msgStakeTiaLiquidStake";
import { DecodedTx } from "../decoder";
import { EpochDuration, NetworkStartDate } from "../constants";
import { prisma } from "../db";
import { getFeeFromEvents } from "../helpers";
import { insertMsgRegisterHostZone } from "./msgRegisterHostZone";

export const msgsMap = new Map<string, (tx: DecodedTx, msg: any) => Promise<void>>([
    ["/stride.stakeibc.MsgLiquidStake", insertMsgLiquidStake],
    ["/Stridelabs.stride.stakeibc.MsgLiquidStake", insertMsgLiquidStake],
    ["/stride.stakeibc.MsgLSMLiquidStake", insertMsgLSMLiquidStake],
    ["/stride.staketia.MsgLiquidStake", insertMsgStakeTiaLiquidStake],

    ["/stride.stakeibc.MsgRedeemStake", insertMsgRedeemStake],
    ["/Stridelabs.stride.stakeibc.MsgRedeemStake", insertMsgRedeemStake],

    ["/ibc.core.channel.v1.MsgAcknowledgement", insertMsgAcknowledgement],
    ["/ibc.core.channel.v1.MsgRecvPacket", insertMsgRecvPacket],
    ["/stride.stakeibc.MsgRegisterHostZone", insertMsgRegisterHostZone]
]);

export function getBaseTxData(tx: DecodedTx) {
    let fee = getFeeFromEvents(tx.tx_result.events);

    return {
        txhash: tx.hash,
        feeAmount: fee[1],
        feeDenom: fee[0],
        date: new Date(tx.date),
        txcode: tx.tx_result.code
    }
}

export async function insertRedemptionRate(txdate: number, rate: number, zone: string, forceInsert: boolean = false) {
    let txEpochNumber = Math.ceil((txdate - NetworkStartDate) / EpochDuration);
    let targetEpoch = await prisma.redemptionRate.findFirst({
        where: {
            epochNumber: txEpochNumber
        }
    });

    if (targetEpoch && !forceInsert)
        return;

    let data = {
        epochNumber: txEpochNumber,
        dateStart: new Date((NetworkStartDate + (EpochDuration * txEpochNumber))),
        dateEnd: new Date((NetworkStartDate + (EpochDuration * (txEpochNumber + 1)))),
        redemptionRate: rate,
        zone: zone
    };

    await prisma.redemptionRate.upsert({
        where: {
            epochNumber_zone: {
                epochNumber: txEpochNumber,
                zone
            }
        },
        update: data,
        create: data,
    });
}