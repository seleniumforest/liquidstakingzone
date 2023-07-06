import axios from "axios";
import { Price } from "../db";
import { randomUUID } from "../helpers";
import { Zone, zones } from "../constants";

const startDate = 1665251079000;
const baseUrl = "https://api.seer.coinhall.org/api/coinhall/charts";

export const getLunaPrices = async (from: number | undefined): Promise<Price[]> => {
    return getPricesFromCoinhall(
        "terra", 
        "terra1re0yj0j6e9v2szg7kp02ut6u8jjea586t6pnpq6628wl36fphtpqwt6l7p",
        "ibc%2F08095CEDEA29977C9DD0CE9A48329FDA622C183359D5F90CF04CC4FF80CBE431",
        "uluna",
        from);
}

export const getEvmosPrices = async (from: number | undefined): Promise<Price[]> => {
    return getPricesFromCoinhall(
        "evmos", 
        "osmo1q80sc32t5nesvl4hyncfrnvj2qhucnl77jxvz977e0rlgc6ljv6q0vftu3",
        "ibc%2FC5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01",
        "ibc%2F6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
        from);
}

const getPricesFromCoinhall = async (
    zone: Zone,
    poolContract: string,
    baseAsset: string,
    quoteAsset: string,
    from: number | undefined
): Promise<Price[]> => {
    try {
        let zoneInfo = zones.find(x => x.zone === zone)!;
        if (!zoneInfo) {
            console.warn(`getPricesFromCoinhall couldnt find info for zone ${zone}`);
        }

        let fromIso = new Date(from || startDate).toISOString();
        let nowIso = new Date().toISOString();

        const url = `${baseUrl}/${poolContract}?interval=1_HOUR&baseAsset=${baseAsset}&quote=${quoteAsset}&from=${fromIso}&to=${nowIso}`;
        const response = await axios.get<{ candles: { t: number, o: number }[] }>(url);

        return response.data?.candles?.map(x => ({
            id: randomUUID(),
            coin: zoneInfo.coingeckoId,
            date: x.t * 1000,
            price: x.o,
            vsCurrency: `st${zoneInfo.ticker || zoneInfo.zone}`
        }));
    } catch (e: any) { console.error(`getLunaPrices: error updating prices ${e?.message}`) }

    return [];
}