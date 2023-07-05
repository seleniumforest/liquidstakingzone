import axios from "axios";
import { Price } from "../db";
import { randomUUID } from "../helpers";

const startDate = new Date(1665251079000).toISOString();

export const getLunaPrices = async (from: number | undefined): Promise<Price[]> => {
    try {
        let fromIso = from ? new Date(from).toISOString() : startDate;
        let now = new Date().toISOString();
        const astroLunaPoolDataUrl = `https://api.seer.coinhall.org/api/coinhall/charts/terra1re0yj0j6e9v2szg7kp02ut6u8jjea586t6pnpq6628wl36fphtpqwt6l7p?interval=1_HOUR&baseAsset=ibc%2F08095CEDEA29977C9DD0CE9A48329FDA622C183359D5F90CF04CC4FF80CBE431&quote=uluna&from=${fromIso}&to=${now}`;
        const response = await axios.get<{ candles: { t: number, o: number }[]}>(astroLunaPoolDataUrl);

        return response.data.candles.map(x => ({
            id: randomUUID(),
            coin: "terra-luna-2",
            date: x.t * 1000,
            price: x.o,
            vsCurrency: "stluna"
        }));
    } catch (e: any) { console.log(`getLunaPrices: error updating prices ${e?.message}`) }

    return [];
}

export const getEvmosPrices = async (from: number | undefined): Promise<Price[]> => {
    try {
        let fromIso = from ? new Date(from).toISOString() : startDate;
        let now = new Date().toISOString();
        const astroLunaPoolDataUrl = `https://api.seer.coinhall.org/api/coinhall/charts/osmo1q80sc32t5nesvl4hyncfrnvj2qhucnl77jxvz977e0rlgc6ljv6q0vftu3?interval=1_HOUR&baseAsset=ibc%2FC5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01&quote=ibc%2F6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A&from=${fromIso}&to=${now}`;
        const response = await axios.get<{ candles: { t: number, o: number }[]}>(astroLunaPoolDataUrl);

        return response.data.candles.map(x => ({
            id: randomUUID(),
            coin: "evmos",
            date: x.t * 1000,
            price: x.o,
            vsCurrency: "stevmos"
        }));
    } catch (e: any) { console.log(`getEvmosPrices: error updating prices ${e?.message}`) }

    return [];
}