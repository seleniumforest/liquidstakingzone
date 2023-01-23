import CoinGecko from "coingecko-api";

const client = new CoinGecko();

export const ping = async () => {
    await client.ping();
}