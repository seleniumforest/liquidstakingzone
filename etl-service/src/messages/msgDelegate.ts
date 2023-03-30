import { Coin } from "@cosmjs/amino";
import { getMsgBaseData, msgData } from ".";
import { insertData } from "../db/";
import { CoinTuple, DecodedTx } from "../decoder";
import { toCoinTuple } from "../helpers";

export interface msgDelegate extends msgData {
    delegatorAddress: String,
    validatorAddress: String,
    amount: CoinTuple
}

export const insertMsgDelegate = async (tx: DecodedTx, msg: any): Promise<void> => {
    let data: msgDelegate = {
        ...getMsgBaseData(tx),
        delegatorAddress: msg.delegatorAddress,
        validatorAddress: msg.validatorAddress,
        amount: toCoinTuple(msg.amount as Coin)
    };

    await insertData("msgs_MsgDelegate", data)
}