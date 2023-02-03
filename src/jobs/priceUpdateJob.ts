import { timeSpans } from "../constants";
import { getPrices } from "../db/";
import { fetchTokenPriceHistory } from "../externalServices/coingecko";

const geckoTokenIds = ["cosmos", "osmosis", "juno-network", "stargaze", "stride"];

export const priceUpdateJob = async () => {
    console.log("Running price update job");
    let prices = await getPrices();
    let tokens = geckoTokenIds.map(x => ({
        coin: x,
        latestDate: prices.find(p => p.coin === x)?.latestDate
    }));

    for (let token of tokens) {
        await fetchTokenPriceHistory(token.coin, token.latestDate);
        //to prevent spamming
        await new Promise((res) => setTimeout(res, 2000));
    }
};

(async () => {
    setInterval(priceUpdateJob, timeSpans.minute * 10);
    await priceUpdateJob();
})();