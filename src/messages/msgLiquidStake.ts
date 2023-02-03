import Long from 'long';
import { getMsgBaseData, msgData } from ".";
import { deleteRedemptionRate, getRedemptionRates, insertData, setRedemptionRate } from '../clickhouse';
import { CoinTuple, DecodedTx, EventLog } from "../decoder";
import { denomToZone, getValueByTwoKeys, parseCoin } from '../helpers';

export interface msgLiquidStake extends msgData {
    creator: string,
    amount: CoinTuple,
    recievedStTokenAmount: CoinTuple,
    zone: string,
    redemptionRate: number
}

export const insertMsgLiquidStake = async (tx: DecodedTx, msg: any): Promise<void> => {
    let recievedStToken = getRecievedStAmountFromEvents(tx.tx_result.events);
    let amount: CoinTuple = [msg.hostDenom, (msg.amount as Long).toString()];
    let redemptionRate = Number(amount[1]) / Number(recievedStToken[1]);

    let data: msgLiquidStake = {
        ...getMsgBaseData(tx),
        zone: denomToZone(recievedStToken[0]) || "",
        creator: msg.creator,
        amount,
        recievedStTokenAmount: recievedStToken,
        redemptionRate: Number(amount[1]) / Number(recievedStToken[1])
    };
    await insertData("msgs_MsgLiquidStake", data);

    //set approximate redemption rate for tx's epoch
    if (!tx.date) {
        console.warn("insertRedemptionRate: wrong txdate");
        return;
    }
    await insertRedemptionRate(tx.date * 1000, redemptionRate, data.zone);
}

export const insertRedemptionRate = async (txdate: number, rate: number, zone: string, forceInsert: boolean = false) => {
    let networkStartDate = 1662318000451;
    let epochDuration = 21600000;

    let txEpochNumber = Math.ceil((txdate - networkStartDate) / epochDuration)
    let redemptionRates = await getRedemptionRates();
    let targetEpoch = redemptionRates.find(x => x.epochNumber === txEpochNumber);
    if (targetEpoch && !forceInsert)
        return;

    await deleteRedemptionRate(txEpochNumber, zone);
    await setRedemptionRate({
        epochNumber: txEpochNumber,
        dateStart: networkStartDate + (epochDuration * txEpochNumber),
        dateEnd: networkStartDate + (epochDuration * (txEpochNumber + 1)),
        redemptionRate: rate,
        zone: zone
    });
}

const getRecievedStAmountFromEvents = (events: EventLog) => {
    return parseCoin(getValueByTwoKeys(events, "coinbase", "amount"))
}