import { CoinTuple, DecodedTx } from "../decoder";
import { insertMsgLiquidStake } from "./msgLiquidStake";
import { insertMsgSend } from "./msgSend";
import { insertMsgWithdrawReward } from "./msgWithdrawDelegatorReward";
import { getFeeFromEvents, randomUUID } from "../helpers";
import { insertMsgDelegate } from "./msgDelegate";
import { insertMsgRedeemStake } from "./msgRedeemStake";
import { insertMsgVote } from "./msgVote";
import { insertMsgAcknowledgement } from "./msgAcknowledgement";
import { insertMsgRecvPacket } from "./msgRecvPacket";
import { insertMsgLSMLiquidStake } from "./msgLSMLiquidStake";

//todo fix any
export const msgsMap = new Map<string, (tx: DecodedTx, msg: any) => Promise<void>>([
    ["/stride.stakeibc.MsgLiquidStake", insertMsgLiquidStake],
    ["/Stridelabs.stride.stakeibc.MsgLiquidStake", insertMsgLiquidStake],
    ["/stride.stakeibc.MsgLSMLiquidStake", insertMsgLSMLiquidStake],

    ["/stride.stakeibc.MsgRedeemStake", insertMsgRedeemStake],
    ["/Stridelabs.stride.stakeibc.MsgRedeemStake", insertMsgRedeemStake],

    ["/cosmos.bank.v1beta1.MsgSend", insertMsgSend],
    ["/cosmos.bank.v1.MsgSend", insertMsgSend],

    ["/cosmos.staking.v1beta1.MsgDelegate", insertMsgDelegate],
    ["/cosmos.staking.v1.MsgDelegate", insertMsgDelegate],

    ["/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward", insertMsgWithdrawReward],
    ["/cosmos.distribution.v1.MsgWithdrawDelegatorReward", insertMsgWithdrawReward],
    
    ["/cosmos.gov.v1beta1.MsgVote", insertMsgVote],
    ["/cosmos.gov.v1.MsgVote", insertMsgVote],

    ["/ibc.core.channel.v1.MsgAcknowledgement", insertMsgAcknowledgement],
    ["/ibc.core.channel.v1.MsgRecvPacket", insertMsgRecvPacket]
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