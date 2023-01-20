import { Coin } from "@cosmjs/proto-signing";
import { Int53 } from "@cosmjs/math";
import { CoinTuple, TxEvent } from "./decoder";

export const apiToSmallInt = (input: number) => {
    const asInt = Int53.fromString(input.toString());
    return asInt.toNumber();
}

export const tryParseJson = <T>(data: string): T | null => {
    try {
        return JSON.parse(data) as T;
    } catch (err: any) { 
        return null;
    }
}

export const toCoinTuple = (coin: Coin): CoinTuple => {
    return [coin.denom, coin.amount];
} 

//splits 243693ustrd to amount and denom
export const parseCoin = (coin: string): CoinTuple => {
    if (!coin)
        return ["", ""];

    let separatorIndex = Array.from(coin).findIndex(x => !Number.isInteger(parseInt(x)));

    let amount = coin.substring(0, separatorIndex);
    let denom = coin.substring(separatorIndex, coin.length);

    return [
        denom,
        amount
    ]
}

export const getSenderFromEvents = (events: TxEvent[]): string => {
    return getValueByTwoKeys(events, "message", "sender");
}

export const getFeeFromEvents = (events: TxEvent[]): CoinTuple => {
    return parseCoin(getValueByTwoKeys(events, "tx", "fee"));
}

export const getRewardsFromEvents = (events: TxEvent[]): CoinTuple => {
    return parseCoin(getValueByTwoKeys(events, "withdraw_rewards", "amount"));
}

const getValueByTwoKeys = (events: TxEvent[], k1: string, k2: string): string => {
    return events.filter(x => x.type === k1)
        .flatMap(x => x.attributes)
        .find(x => x.key === k2)
        ?.value || "";
}