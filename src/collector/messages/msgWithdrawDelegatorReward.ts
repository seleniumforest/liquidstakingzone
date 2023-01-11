import Long from 'long';
import { v4 as uuidv4 } from 'uuid';
import { insertMsg, msgData } from ".";
import { CoinTuple } from '..';
import { BlockHeader } from "../../apiWrapper";
import { DecodedTx } from "../decoder";
import { getFeeFromEvents, getRewardsFromEvents } from "../helpers";

export interface msgWithdrawDelegatorReward extends msgData {
    delegatorAddress: String,
    validatorAddress: String,
    reward: CoinTuple
}

export const insertMsgWithdrawReward = async (header: BlockHeader, tx: DecodedTx, msg: any): Promise<void> => {
    await insertMsg("msgs_MsgWithdrawDelegatorReward", transformMsgWithdrawRewardData(header, tx, msg))
}

const transformMsgWithdrawRewardData = (header: BlockHeader, tx: DecodedTx, msg: any): msgWithdrawDelegatorReward => {
    let result = {
        id: uuidv4(),
        code: tx.code,
        height: header.height,
        txhash: tx.hash,
        fee: getFeeFromEvents(tx.events),
        delegatorAddress: msg.delegatorAddress,
        validatorAddress: msg.validatorAddress,
        reward: getRewardsFromEvents(tx.events)
    }

    return result;
}