import { Coin } from "@cosmjs/proto-signing";
import { CoinTuple, TxEvent } from "./decoder";
import axios from "axios";
import { prisma } from "./db";

export async function findZone(zone: string) {
    if (!zone)
        return null;

    return prisma.zonesInfo.findFirst({ where: { zone } });
}

export function tryParseJson<T>(data: string): T | null {
    try {
        return JSON.parse(data) as T;
    } catch (err: any) {
        return null;
    }
}

export const toCoinTuple = (coin: Coin): CoinTuple => {
    return [coin.denom, coin.amount];
}

//splits 243693ustrd to amount and denom, 243693 and ustrd
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

export const getAttributeValue = (attrs: any[], key: string) => {
    let attribute = attrs.find(attr => attr.key === key);
    return attribute.value || "";
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

//takes eventlog from transaction and finds given value of given type
export const getValueByTwoKeys = (events: TxEvent[], type: string, key: string): string => {
    return events.filter(x => x.type === type)
        .flatMap(x => x.attributes)
        .find(x => x.key === key)
        ?.value || "";
}

export const getValueByKey = (events: TxEvent, key: string): string => {
    return events.attributes
        .find(x => x.key === key)
        ?.value || "";
}

export async function notifyTelegram(data: string | object) {
    let message: any = data;
    if (typeof data !== "string")
        message = JSON.stringify(data);

    try {
        await axios.post(
            "http://localhost:3000/notify",
            { message },
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (e) {
        console.error(`notifyTelegram: Error sending notification: message ${message} err ${JSON.stringify(e, null, 4)}`);
    }
}