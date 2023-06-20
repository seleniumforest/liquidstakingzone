import { fetchZonesInfo } from "../externalServices/strideApi";
import { NetworkManager } from "../externalServices/tendermint";
import { timeSpans } from "../constants";
import { Balance, insertAccountBalance } from "../db/balances";
import { prefixToRegistryName, randomUUID } from "../helpers";
import Big from "big.js";
import { QueryClient, setupStakingExtension, StargateClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { UnbondingDelegation } from "cosmjs-types/cosmos/staking/v1beta1/staking";

export const externalAccountsCheckerJob = async () => {
    console.log(`externalAccountsCheckerJob: ${new Date()}`);

    let zoneInfo = await fetchZonesInfo();
    await Promise.allSettled(zoneInfo.map(async (zone) => {
        try {
            let zoneEndpoints = await NetworkManager.create({
                name: prefixToRegistryName(zone.prefix)
            });

            let rpcs = await zoneEndpoints.getSyncedRpcs();
            if (rpcs.length === 0) {
                console.warn(`externalAccountsCheckerJob: No endpoints found for prefix ${zone.prefix}`);
                return;
            };

            let staked = await getBalanceStaked(zone.delegationAcc, rpcs);
            let balance = await getBalanceOnAccount(zone.delegationAcc, staked?.denom!, rpcs)
            let undelegated = await getUndelegatedBalance(zone.delegationAcc, rpcs);
            let sum = Big(staked?.amount!).plus(Big(balance?.amount!)).plus(undelegated || Big(0)).toFixed();

            let balanceData: Balance = {
                id: randomUUID(),
                zone: zone.zone,
                address: zone.delegationAcc,
                date: Date.now(),
                assets: [[staked?.denom!, sum]]
            };

            console.log(`externalAccountsCheckerJob: inserting data ${JSON.stringify(balanceData)}`);
            await insertAccountBalance(balanceData);
        } catch (e: any) { console.log(`externalAccountsCheckerJob update error ${e?.message}`) }
    }))

    console.log(`Finished update host zones transactions job: ${new Date()}`)
};

//todo pass latestKnownBalance
const getUndelegatedBalance = async (address: string, endpoints: string[]) => {
    for (const endp of endpoints) {
        try {
            let result: UnbondingDelegation[] = [];
            let nextKey: Uint8Array | undefined = Uint8Array.from([]);

            do {
                let client = QueryClient.withExtensions(await Tendermint34Client.connect(endp), setupStakingExtension);
                let data = await client.staking.delegatorUnbondingDelegations(address);
                nextKey = data.pagination?.nextKey;
                result.push(...data.unbondingResponses)
            } while ((nextKey?.length || 0) > 0);

            return result.flatMap(x => x.entries).map(x => x.balance).reduce((prev, cur) => prev.add(Big(cur)), Big(0));
        } catch (e: any) { console.log(e?.message) }
    }
}


const getBalanceStaked = async (address: string, endpoints: string[]) => {
    for (const endp of endpoints) {
        try {
            let client = await StargateClient.connect(endp);
            let data = await client.getBalanceStaked(address);
            return data;
        } catch (e: any) { console.log(e?.message) }
    }
}

const getBalanceOnAccount = async (address: string, denom: string, endpoints: string[]) => {
    for (const endp of endpoints) {
        try {
            let client = await StargateClient.connect(endp);
            let data = await client.getBalance(address, denom);
            return data;
        } catch (e: any) { console.log(e?.message) }
    }
}

(async () => {
    setInterval(externalAccountsCheckerJob, timeSpans.hour)
    await externalAccountsCheckerJob();
})();