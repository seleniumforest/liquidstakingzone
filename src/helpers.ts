import { Coin, Registry } from "@cosmjs/proto-signing";
import { Int53 } from "@cosmjs/math";
import { CoinTuple, TxEvent } from "./decoder";
import { v4 as uuidv4 } from 'uuid';
import { defaultRegistryTypes } from "@cosmjs/stargate";

export const randomUUID = () => uuidv4();

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

export const getValueByTwoKeys = (events: TxEvent[], type: string, key: string): string => {
    return events.filter(x => x.type === type)
        .flatMap(x => x.attributes)
        .find(x => x.key === key)
        ?.value || "";
}

export const defaultRegistry = new Registry(defaultRegistryTypes);

export const earliestPossibleBlocks = [
    { zone: "cosmos", height: 11925500 },
    { zone: "osmo", height: 5880000 },
    { zone: "juno", height: 4663000 },
    { zone: "stars", height: 4520000 }
];