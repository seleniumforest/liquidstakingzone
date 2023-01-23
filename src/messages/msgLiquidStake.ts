import Long from 'long';
import { getMsgData, msgData } from ".";
import { insertData } from '../clickhouse';
import { CoinTuple, DecodedTx, EventLog } from "../decoder";
import { getValueByTwoKeys, parseCoin } from '../helpers';

export interface msgLiquidStake extends msgData {
    creator: string,
    amount: CoinTuple,
    recievedStTokenAmount: CoinTuple
} 

export const insertMsgLiquidStake = async (tx: DecodedTx, msg: any) : Promise<void> => {
    let data: msgLiquidStake = {
        ...getMsgData(tx),
        creator: msg.creator,
        amount: [msg.hostDenom, (msg.amount as Long).toString()],
        recievedStTokenAmount: getRecievedStAmountFromEvents(tx.tx_result.events)
    };

    await insertData("msgs_MsgLiquidStake", data)
}

const getRecievedStAmountFromEvents = (events: EventLog) => {
    return parseCoin(getValueByTwoKeys(events, "coinbase", "amount"))
}