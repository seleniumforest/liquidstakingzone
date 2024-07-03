import { DecodedTx } from "../decoder";
import { prisma } from '../db';
import { assets, chains } from 'chain-registry';
import { notifyTelegram } from "../helpers";

export const insertMsgRegisterHostZone = async (tx: DecodedTx, msg: any): Promise<void> => {
    let existingZone = await prisma.zonesInfo.findFirst({
        where: { zone: msg.bech32prefix }
    });

    if (existingZone != null)
        return;

    let newZoneInfo = chains.find(x => x.bech32_prefix === msg.bech32prefix)!;
    if (!newZoneInfo) {
        console.warn(`insertMsgRegisterHostZone: Chain with prefix ${msg.bech32prefix} has not been found in chain-registry`);
        return;
    }

    let assetList = assets.find(x => x.chain_name === newZoneInfo.chain_name)?.assets;
    if (!assetList || !Array.isArray(assetList) || assetList.length === 0) {
        console.warn(`insertMsgRegisterHostZone: Assets for chain ${msg.bech32prefix} were not been found in chain-registry`);
        return;
    }

    let stakingAsset = assetList.find(x => x.base === msg.hostDenom);
    let decimals = stakingAsset?.denom_units
        ?.find(x => x.denom != msg.hostDenom)?.exponent;

    if (!decimals || !stakingAsset) {
        console.warn(`insertMsgRegisterHostZone: Couldn't find decimals, asset ${msg.hostDenom} chain ${msg.bech32prefix} `);
        return;
    }

    let data = {
        coingeckoId: stakingAsset.coingecko_id || "",
        decimals,
        denom: msg.hostDenom.toLowerCase(),
        registryName: newZoneInfo.chain_name,
        stDenom: `st${msg.hostDenom}`.toLowerCase(),
        zone: newZoneInfo.bech32_prefix,
        ticker: stakingAsset.symbol
    };

    await notifyTelegram(`New zone registered. Please review data asap ${JSON.stringify(data)}`)
    await prisma.zonesInfo.create({ data });
}