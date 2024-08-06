import { TimeSpansMs, priceSources } from "../constants";
import { prisma } from "../db";
import { fetchGeneralData, fetchTokenPriceHistory } from "../externalServices/coingecko";

export const updateTokenPrices = async () => {
    let latestPrices = await prisma.$queryRaw<{ coin: string, latestDate: Date }[]>`
        SELECT coin, MAX(date) as "latestDate"
        FROM "PriceHistory" ph
        WHERE ph."vsCurrency" = 'usd'
        GROUP BY coin
    `;

    let zones = await prisma.zonesInfo.findMany({ select: { coingeckoId: true } });

    let tokens = ["stride", ...zones
        .map(x => x.coingeckoId)]
        .map(x => ({
            coin: x,
            latestDate: latestPrices.find(p => p.coin === x)?.latestDate ||
                new Date(Date.now() - TimeSpansMs.day * 360)
            //coingecko gives only 1y of history on free plan
        }));

    for (let token of tokens) {
        try {
            let prices = await fetchTokenPriceHistory(token.coin, token.latestDate?.getTime());
            await prisma.priceHistory.createMany({
                data: prices
            });
        }
        catch (e) {
            console.warn(`updateStAssetsPrices: Cannot update prices for coin ${token.coin} err ${JSON.stringify(e, null, 4)}`);
        }
        //to prevent spamming and getting 429 errors
        await new Promise((res) => setTimeout(res, 60000));
    }
};

const updateStAssetsPrices = async () => {
    let latestPrices = await prisma.$queryRaw<{ coin: string, latestDate: number }[]>`
        SELECT coin, MAX(date) as "latestDate"
        FROM "PriceHistory" ph
        WHERE ph."vsCurrency" != 'usd'
        GROUP BY coin
    `;

    for (const [zone, priceSrc] of priceSources) {
        try {
            let currentZone = await prisma.zonesInfo.findFirstOrThrow({ where: { zone } });
            let latestDateTime = latestPrices.find(x => x.coin === currentZone.coingeckoId);
            let newPrices = await priceSrc(latestDateTime?.latestDate);
            await prisma.priceHistory.createMany({
                data: newPrices
            });

            newPrices.forEach(x => console.log(`updateStAssetsPrices: got new prices ${JSON.stringify(x)}`));
        } catch (e) {
            console.warn(`updateStAssetsPrices: Cannot update st prices for zone ${zone} err ${JSON.stringify(e, null, 4)}`);
        }
    }
}

const updateGeneralData = async () => {
    try {
        let data = await fetchGeneralData();
        if (!data)
            return;

        await prisma.generalData.create({ data })
    }
    catch (e) {
        console.warn(`updateStAssetsPrices: Cannot update general data err ${JSON.stringify(e, null, 4)}`);
    }
}

export const priceUpdateJob = async () => {
    console.log("Running price update job");
    await updateTokenPrices();
    await updateGeneralData();
    await updateStAssetsPrices();
    console.log("Finished price update job");
};

(async () => {
    setInterval(priceUpdateJob, TimeSpansMs.hour);
    await priceUpdateJob();
})();