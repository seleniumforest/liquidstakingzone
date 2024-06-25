import { CoinTuple, DecodedTx } from "../decoder";
import { insertMsgLiquidStake } from "./msgLiquidStake";
import { getFeeFromEvents, randomUUID } from "../helpers";
import { insertMsgRedeemStake } from "./msgRedeemStake";
import { insertMsgAcknowledgement } from "./msgAcknowledgement";
import { insertMsgRecvPacket } from "./msgRecvPacket";
import { insertMsgLSMLiquidStake } from "./msgLSMLiquidStake";
import { insertMsgStakeTiaLiquidStake } from "./msgStakeTiaLiquidStake";

export const msgsMap = new Map<string, (tx: DecodedTx, msg: any) => Promise<void>>([
    ["/stride.stakeibc.MsgLiquidStake", insertMsgLiquidStake],
    ["/Stridelabs.stride.stakeibc.MsgLiquidStake", insertMsgLiquidStake],
    ["/stride.stakeibc.MsgLSMLiquidStake", insertMsgLSMLiquidStake],
    ["/stride.staketia.MsgLiquidStake", insertMsgStakeTiaLiquidStake],

    ["/stride.stakeibc.MsgRedeemStake", insertMsgRedeemStake],
    ["/Stridelabs.stride.stakeibc.MsgRedeemStake", insertMsgRedeemStake],

    ["/ibc.core.channel.v1.MsgAcknowledgement", insertMsgAcknowledgement],
    ["/ibc.core.channel.v1.MsgRecvPacket", insertMsgRecvPacket],
]);

//fills base fields that exist in every msg type
export const getMsgBaseData = (tx: DecodedTx) => {
    let data: msgData = {
        id: randomUUID(),
        txhash: tx.hash,
        fee: getFeeFromEvents(tx.tx_result.events),
        date: tx.date,
        txcode: tx.tx_result.code
    }

    return data;
}

export interface msgData {
    id: string,
    txhash: string,
    fee: CoinTuple,
    date?: number,
    txcode: number
} 