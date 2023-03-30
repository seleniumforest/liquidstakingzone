import { timeSpans, zones } from "../constants";
import { getPrices, insertPrices } from "../db/";
import { insertGeneralData } from "../db/generalData";
import { fetchGeneralData, fetchTokenPriceHistory } from "../externalServices/coingecko";
import { getStAssetsPriceHistory } from "../externalServices/osmosisImperatorApi";

export const updateTokenPrices = async () => {
    let latestPrices = await getPrices(false);

    let tokens = ["stride", ...zones
        .map(x => x.coingeckoId)]
        .map(x => ({
            coin: x,
            latestDate: latestPrices.find(p => p.coin === x)?.latestDate
        }));

    for (let token of tokens) {
        let prices = await fetchTokenPriceHistory(token.coin, token.latestDate);
        await insertPrices(prices);
        //to prevent spamming and getting 429 errors
        await new Promise((res) => setTimeout(res, 60000));
    }
};

const updateStAssetsPrices = async () => {
    let actualPrices = await getStAssetsPriceHistory();
    let latestSavedPrices = await getPrices(true); 

    //filter already saved data
    let newPrices = actualPrices.filter(x => {
        let latestSavedPriceDate = latestSavedPrices?.find(y => y.coin === x.coin)?.latestDate
        if (!latestSavedPriceDate)
            return true;

        return x.date > latestSavedPriceDate;
    });

    await insertPrices(newPrices);
}

const updateGeneralData = async () => {
    let data = await fetchGeneralData();
    if (data)
        insertGeneralData([data]);
}

export const priceUpdateJob = async () => {
    console.log("Running price update job");
    await updateGeneralData();
    await updateStAssetsPrices();
    await updateTokenPrices();
    console.log("Finished price update job");
};

(async () => {
    setInterval(priceUpdateJob, timeSpans.hour);
    await priceUpdateJob();
})();