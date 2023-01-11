import { CoinTuple, TxEvent } from ".";

//splits 243693ustrd to amount and denom
export const parseCoin = (coin: string) : CoinTuple => {
    if (!coin || coin === "")
        return ["", ""];

    let separatorIndex = Array.from(coin).findIndex(x => !Number.isInteger(parseInt(x)));

    let amount = coin.substring(0, separatorIndex);
    let denom = coin.substring(separatorIndex, coin.length);

    return [
        denom,
        amount
    ]
}

export const getSenderFromEvents = (events: TxEvent[]) : string => {
    let sender = events.filter(x => x.type === "message")
        .flatMap(x => x.attributes)
        .find(x => x.key === "sender")
        ?.value;

    return sender || "";
}

export const getFeeFromEvents = (events: TxEvent[]) : CoinTuple => {
    let fee = events.filter(x => x.type === "tx")
        .flatMap(x => x.attributes)
        .find(x => x.key === "fee")
        ?.value;

    return parseCoin(fee || "");
}

export const getRewardsFromEvents = (events: TxEvent[]) : CoinTuple => {
    let rewards = events.filter(x => x.type === "withdraw_rewards")
        .flatMap(x => x.attributes)
        .find(x => x.key === "amount")
        ?.value;

    return parseCoin(rewards || "");
}