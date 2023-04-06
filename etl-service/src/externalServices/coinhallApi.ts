import axios from "axios";
import { Price } from "../db";
import { randomUUID } from "../helpers";

export const getLunaPrices = async (from: number | undefined, to: number | undefined) : Promise<Price[]> => {
    const astroLunaPoolDataUrl = `https://api.coinhall.org/api/v1/charts/terra1re0yj0j6e9v2szg7kp02ut6u8jjea586t6pnpq6628wl36fphtpqwt6l7p?bars=329&from=${from || "1665251079"}&interval=1h&quoteAsset=uluna&to=${to || Date.now()}`;
    const response = await axios.get<{ date: number, price: number }[]>(astroLunaPoolDataUrl);

    return response.data.map(x => ({
        id: randomUUID(),
        coin: "terra-luna-2",
        date: x.date,
        price: x.price,
        vsCurrency: "stluna"
    }));
}