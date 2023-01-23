import { Coin } from "@cosmjs/amino";
import { getMsgData, msgData } from ".";
import { insertData } from "../clickhouse";
import { CoinTuple, DecodedTx } from "../decoder";
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

    await insertData("msgs_MsgDelegate", data)
}