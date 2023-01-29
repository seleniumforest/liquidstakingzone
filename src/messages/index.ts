import { client } from "../clickhouse";
import { CoinTuple, DecodedTx } from "../decoder";
import { insertMsgLiquidStake } from "./msgLiquidStake";
import { insertMsgSend } from "./msgSend";
import { insertMsgWithdrawReward } from "./msgWithdrawDelegatorReward";
import { getFeeFromEvents, randomUUID } from "../helpers";
import { insertMsgDelegate } from "./msgDelegate";
import { insertMsgRedeemStake } from "./msgRedeemStake";
import { insertMsgVote } from "./msgVote";
import { insertMsgRecvPacket } from "./msgRecvPacket";

export const msgsMap = new Map<string, (tx: DecodedTx, msg: any) => Promise<void>>([
    ["/stride.stakeibc.MsgLiquidStake", insertMsgLiquidStake],
    ["/stride.stakeibc.MsgRedeemStake", insertMsgRedeemStake],
    ["/cosmos.bank.v1beta1.MsgSend", insertMsgSend],
    ["/cosmos.staking.v1beta1.MsgDelegate", insertMsgDelegate],
    ["/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward", insertMsgWithdrawReward],
    ["/cosmos.gov.v1beta1.MsgVote", insertMsgVote],
   // ["/ibc.core.channel.v1.MsgRecvPacket", insertMsgRecvPacket]
]); 

//fills base fields that exist in every msg type
export const getMsgData = (tx: DecodedTx) => {
    let data: msgData = { 
        id: randomUUID(),
        txhash: tx.hash,
        fee: getFeeFromEvents(tx.tx_result.events)
    }
    
    return data;
}

export interface msgData {
    id: string,
    txhash: string,
    fee: CoinTuple
} 