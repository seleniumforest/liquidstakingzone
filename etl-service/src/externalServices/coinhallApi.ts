import axios from "axios";
import { Zone } from "../constants";
import { prisma } from "../db";

const startDate = 1665251079000;
const baseUrl = "https://api.seer.coinhall.org/api/coinhall/charts";

export async function getLunaPrices(from: number | undefined) {
    return getPricesFromCoinhall(
        "terra",
        "terra1re0yj0j6e9v2szg7kp02ut6u8jjea586t6pnpq6628wl36fphtpqwt6l7p",
        "ibc%2F08095CEDEA29977C9DD0CE9A48329FDA622C183359D5F90CF04CC4FF80CBE431",
        "uluna",
        from);
}

export async function getEvmosPrices(from: number | undefined) {
    return getPricesFromCoinhall(
        "evmos",
        "osmo1q80sc32t5nesvl4hyncfrnvj2qhucnl77jxvz977e0rlgc6ljv6q0vftu3",
        "ibc%2FC5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01",
        "ibc%2F6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
        from);
}

async function getPricesFromCoinhall(zone: Zone,
    poolContract: string,
    baseAsset: string,
    quoteAsset: string,
    from: number | undefined) {
    try {
        let zoneInfo = await prisma.zonesInfo.findUniqueOrThrow({
            where: { zone }
        });

        let fromIso = new Date(from || startDate).toISOString();
        let nowIso = new Date().toISOString();
        const url = `${baseUrl}/${poolContract}?interval=1_HOUR&baseAsset=${baseAsset}&quote=${quoteAsset}&from=${fromIso}&to=${nowIso}`;

        let response = await fetch(url, {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site"
            },
            "referrer": "https://coinhall.org/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        });

        return ((await response.json()) as { candles: { t: number, o: number }[] }).candles?.map(x => ({
            coin: zoneInfo.coingeckoId,
            date: new Date(x.t * 1000),
            price: x.o,
            vsCurrency: `st${zoneInfo.ticker || zoneInfo.zone}`
        }));
    } catch (e: any) { console.error(`getLunaPrices: error updating prices ${e?.message}`); }

    return [];
}