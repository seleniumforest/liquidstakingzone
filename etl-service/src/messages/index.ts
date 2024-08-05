
import { insertMsgLiquidStake } from "./msgLiquidStake";
import { insertMsgRedeemStake } from "./msgRedeemStake";
import { insertMsgAcknowledgement } from "./msgAcknowledgement";
import { insertMsgRecvPacket } from "./msgRecvPacket";
import { insertMsgLSMLiquidStake } from "./msgLSMLiquidStake";
import { DecodedTx } from "../decoder";
import { EpochDuration, NetworkStartDate } from "../constants";
import { prisma } from "../db";
import { getFeeFromEvents } from "../helpers";
import { insertMsgRegisterHostZone } from "./msgRegisterHostZone";
import Big from "big.js";
import { insertMsgRedeemTiaDym } from "./msgRedeemTiaDym";
import { insertMsgStakeTiaDym } from "./msgStakeTiaDym";

export const msgsMap = new Map<string, (tx: DecodedTx, msg: any) => Promise<void>>([
    ["/stride.stakeibc.MsgLiquidStake", insertMsgLiquidStake],
    ["/Stridelabs.stride.stakeibc.MsgLiquidStake", insertMsgLiquidStake],
    ["/stride.stakeibc.MsgLSMLiquidStake", insertMsgLSMLiquidStake],
    ["/stride.staketia.MsgLiquidStake", insertMsgStakeTiaDym],
    ["/stride.staketia.MsgRedeemStake", insertMsgRedeemTiaDym],
    ["/stride.stakedym.MsgLiquidStake", insertMsgStakeTiaDym],
    ["/stride.stakedym.MsgRedeemStake", insertMsgRedeemTiaDym],

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

export async function insertRedemptionRate(txdate: number, tokenAmount: number | string, stTokenAmount: number | string, zone: string, forceInsert: boolean = false) {
    if (Big(tokenAmount).lt(1000) || Big(stTokenAmount).lt(1000))
        return;

    if (Big(stTokenAmount).gt(Big(tokenAmount))) {
        console.warn(`insertRedemptionRate: tokenAmount > stTokenAmount txdate ${txdate}`);
        return;
    }

    let rate = Big(tokenAmount).div(stTokenAmount).toNumber();
    let txEpochNumber = Math.ceil((txdate - NetworkStartDate) / EpochDuration);
    let targetEpoch = await prisma.redemptionRate.findFirst({
        where: {
            epochNumber: txEpochNumber,
            zone
        }
    });

    if (targetEpoch && !forceInsert)
        return;

    let data = {
        //todo check, seems wrong calculations
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