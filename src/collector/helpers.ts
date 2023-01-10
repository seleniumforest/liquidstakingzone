import { CoinTuple, TxEvent } from ".";

const parseCoin = (coin: string) : CoinTuple => {
    let separatorIndex = Array.from(coin).findIndex(x => !Number.isInteger(parseInt(x)));

    let amount = coin.substring(0, separatorIndex);
    let denom = coin.substring(separatorIndex, coin.length);

    return [
        denom,
        amount
    ]
}

const getSenderFromEvents = (events: TxEvent[]) : string => {
    let sender = events.filter(x => x.type === "message")
        .flatMap(x => x.attributes)
        .find(x => x.key === "sender")
        ?.value;

    return sender || "";
}

const getFeeFromEvents = (events: TxEvent[]) : CoinTuple => {
    let fee = events.filter(x => x.type === "tx")
        .flatMap(x => x.attributes)
        .find(x => x.key === "fee")
        ?.value;

    return parseCoin(fee || "");
}

export {
    parseCoin,
    getSenderFromEvents,
    getFeeFromEvents
}