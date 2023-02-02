import Long from 'long';
import { getMsgBaseData, msgData } from ".";
import { insertData } from '../clickhouse';
import { CoinTuple, DecodedTx, EventLog } from "../decoder";
import { denomToZone, getValueByTwoKeys, parseCoin } from '../helpers';

export interface msgLiquidStake extends msgData {
    creator: string,
    amount: CoinTuple,
    recievedStTokenAmount: CoinTuple,
    zone: string,
    redemptionRate: number
} 

export const insertMsgLiquidStake = async (tx: DecodedTx, msg: any) : Promise<void> => {
    let recievedStToken = getRecievedStAmountFromEvents(tx.tx_result.events);
    let amount: CoinTuple = [msg.hostDenom, (msg.amount as Long).toString()];

    let data: msgLiquidStake = {
        ...getMsgBaseData(tx),
        zone: denomToZone(recievedStToken[0]) || "",
        creator: msg.creator,
        amount,
        recievedStTokenAmount: recievedStToken,
        redemptionRate: Number(amount[1]) / Number(recievedStToken[1])
    };

    await insertData("msgs_MsgLiquidStake", data)
}

const getRecievedStAmountFromEvents = (events: EventLog) => {
    return parseCoin(getValueByTwoKeys(events, "coinbase", "amount"))
}