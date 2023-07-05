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
            date: x.t,
            price: x.o,
            vsCurrency: "stluna"
        }));
    } catch (e: any) { console.log(`getLunaPrices: error updating prices ${e?.message}`) }

    return [];
}