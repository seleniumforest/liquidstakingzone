import { getMsgData, insertMsg, msgData } from ".";
import { CoinTuple } from '..';
import { BlockHeader } from "../../apiWrapper";
import { DecodedTx } from "../decoder";
import { getRewardsFromEvents } from "../helpers";

export interface msgWithdrawDelegatorReward extends msgData {
    delegatorAddress: String,
    validatorAddress: String,
    reward: CoinTuple
}

export const insertMsgWithdrawReward = async (header: BlockHeader, tx: DecodedTx, msg: any): Promise<void> => {
    await insertMsg("msgs_MsgWithdrawDelegatorReward", getMsgWithdrawRewardData(tx, msg))
}

const getMsgWithdrawRewardData = (tx: DecodedTx, msg: any): msgWithdrawDelegatorReward => {
    let result = {
        ...getMsgData(tx),
        delegatorAddress: msg.delegatorAddress,
        validatorAddress: msg.validatorAddress,
        reward: getRewardsFromEvents(tx.events)
    }

    return result;
}