import axios from "axios";
import { CoinTuple } from "../decoder";
import { fetchZoneInfo } from "../externalServices/strideApi";
import { NetworkManager } from "../externalServices/tendermint";
import { timeSpans } from "../constants";
import { Coin } from "@cosmjs/amino";
import { Balance, insertAccountBalance } from "../db/balances";
import { randomUUID } from "../helpers";
import Big from "big.js";
import { StargateClient } from "@cosmjs/stargate";

export const externalAccountsCheckerJob = async () => {
    console.log(`externalAccountsCheckerJob: ${new Date()}`);
    let zoneInfo = await fetchZoneInfo();

    for (const zone of zoneInfo) {
        let zoneEnpoints = await NetworkManager.create({
            name: prefixToRegistryName(zone.prefix)
        });

        let staked = await getBalanceStaked(zone.delegationAcc, zoneEnpoints.getRpcs());
        let balance = await getBalanceOnAccount(zone.delegationAcc, staked?.denom!, zoneEnpoints.getRpcs())

        let balanceData: Balance = {
            id: randomUUID(),
            zone: zone.zone,
            address: zone.delegationAcc,
            date: Date.now(),
            assets: [[staked?.denom!, Big(staked?.amount!).plus(Big(balance?.amount!)).toFixed()]]
        };

        console.log(`externalAccountsCheckerJob: inserting data ${JSON.stringify(balanceData)}`);
        await insertAccountBalance(balanceData);
    }

    console.log(`Finished update host zones transactions job: ${new Date()}`)
};

const getBalanceStaked = async (address: string, endpoints: string[]) => {
    for (const endp of endpoints) {
        try {
            let client = await StargateClient.connect(endp);
            let data = await client.getBalanceStaked(address);
            return data;
        } catch (e: any) { console.log(e?.message)  }
    }
}

const getBalanceOnAccount = async (address: string, denom: string, endpoints: string[]) => {
    for (const endp of endpoints) {
        try {
            let client = await StargateClient.connect(endp);
            let data = await client.getBalance(address, denom);
            return data;
        } catch (e: any) { console.log(e?.message)  }
    }
}

(async () => {
    setInterval(externalAccountsCheckerJob, timeSpans.hour * 6)
    await externalAccountsCheckerJob();
})();

const prefixToRegistryName = (prefix: string): string => {
    switch (prefix) {
        case "cosmos": return "cosmoshub";
        case "osmo": return "osmosis";
        case "stars": return "stargaze";
        case "terra": return "terra2";
        default: return prefix;
    }
}