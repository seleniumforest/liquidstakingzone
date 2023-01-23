import { getMsgData, msgData } from ".";
import { insertData } from "../clickhouse";
import { CoinTuple, DecodedTx } from "../decoder";
import { getRewardsFromEvents } from "../helpers";

export interface msgWithdrawDelegatorReward extends msgData {
    delegatorAddress: String,
    validatorAddress: String,
    reward: CoinTuple
}

export const insertMsgWithdrawReward = async (tx: DecodedTx, msg: any): Promise<void> => {
    let result = {
        ...getMsgData(tx),
        delegatorAddress: msg.delegatorAddress,
        validatorAddress: msg.validatorAddress,
        reward: getRewardsFromEvents(tx.tx_result.events)
    } 

    await insertData("msgs_MsgWithdrawDelegatorReward", result)
}