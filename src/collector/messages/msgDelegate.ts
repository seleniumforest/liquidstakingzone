import { Coin } from "@cosmjs/amino";
import { getMsgData, insertMsg, msgData } from ".";
import { CoinTuple } from '..';
import { DecodedTx } from "../decoder";
import { toCoinTuple } from "../helpers";

export interface msgDelegate extends msgData {
    delegatorAddress: String,
    validatorAddress: String,
    amount: CoinTuple
}

export const insertMsgDelegate = async (tx: DecodedTx, msg: any): Promise<void> => {
    let data = {
        ...getMsgData(tx),
        delegatorAddress: msg.delegatorAddress,
        validatorAddress: msg.validatorAddress,
        amount: toCoinTuple(msg.amount as Coin)
    };

    await insertMsg("msgs_MsgDelegate", data)
}