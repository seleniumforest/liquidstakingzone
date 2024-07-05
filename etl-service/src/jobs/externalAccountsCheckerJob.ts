import { fetchUserRedemptionRecords, fetchZonesInfo } from "../externalServices/strideApi";
import Big from "big.js";
import { QueryClient, setupStakingExtension, StargateClient } from "@cosmjs/stargate";
import { connectComet } from "@cosmjs/tendermint-rpc";
import { UnbondingDelegation } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { QueryDelegatorUnbondingDelegationsResponse } from "cosmjs-types/cosmos/staking/v1beta1/query";
import { NetworkManager } from "cosmos-indexer";
import { prisma } from "../db";
import { TimeSpansMs } from "../constants";
import * as bank from "cosmjs-types/cosmos/bank/v1beta1/query";

// checks balances on external ICA accounts 
export const externalAccountsCheckerJob = async () => {
    console.log(`externalAccountsCheckerJob: ${new Date()}`);

    let zoneInfo = await fetchZonesInfo();
    let redemeptionRecods = await fetchUserRedemptionRecords();
    if (!redemeptionRecods || !zoneInfo)
        return;

    for (const zone of zoneInfo) {
        try {
            let { registryName, zone: zoneName } = await prisma.zonesInfo.findFirstOrThrow({
                where: {
                    zone: zone.prefix
                },
                select: {
                    registryName: true, zone: true
                }
            });
            let zoneEndpoints = await NetworkManager.create({ name: registryName }, true, TimeSpansMs.minute, 4);

            let rpcs = zoneEndpoints.getClients().map(x => x.rpcUrl);
            if (rpcs.length === 0) {
                console.warn(`externalAccountsCheckerJob: No endpoints found for zone ${zoneName}`);
                return;
            };

            let staked = await getBalanceStaked(zone.delegationAcc, rpcs);
            let balance = await getBalanceOnAccount(zone.delegationAcc, staked?.denom!, rpcs)
            let undelegated = await getUndelegatedBalance(zone.delegationAcc, rpcs);
            if (!staked || !balance || !undelegated) {
                console.warn(`externalAccountsCheckerJob: Couldnt fetch balance for zone ${zoneName}`);
                return;
            }

            let redemeptionRecodsForZone = redemeptionRecods!
                .filter(x => x.denom === zone.hostDenom && x.claim_is_pending === false);
            let redemptedAmount = redemeptionRecodsForZone
                .reduce((prev, cur) => prev.add(cur.st_token_amount), Big(0));

            let sum = Big(staked?.amount!)
                .plus(Big(balance?.amount!))
                .plus(undelegated)
                .minus(redemptedAmount)
                .toFixed();

            let balanceData = {
                zone: zoneName,
                address: zone.delegationAcc,
                date: new Date(),
                assetsAmount: sum,
                assetsDenom: staked.denom
            };

            await prisma.accountBalanceHistory.create({
                data: balanceData
            })

            console.log(`externalAccountsCheckerJob: inserting data ${JSON.stringify(balanceData)}`);
        } catch (e: any) {
            console.error(`externalAccountsCheckerJob update error zone ${JSON.stringify(zone)} err ${JSON.stringify(e, null, 4)}`)
        }
    }

    console.log(`Finished update host zones transactions job: ${new Date()}`)
};

const getUndelegatedBalance = async (address: string, endpoints: string[]) => {
    for (const endp of endpoints) {
        try {
            let result: UnbondingDelegation[] = [];
            let nextKey: Uint8Array | undefined;

            do {
                let c = await connectComet(endp);
                let client = QueryClient.withExtensions(
                    c as any,
                    setupStakingExtension
                );

                let data: QueryDelegatorUnbondingDelegationsResponse =
                    await client.staking.delegatorUnbondingDelegations(address, nextKey);

                nextKey = data.pagination?.nextKey;
                result.push(...data.unbondingResponses)
            } while (nextKey?.length! > 0);

            return result
                .flatMap(x => x.entries)
                .map(x => x.balance)
                .reduce((prev, cur) => prev.add(Big(cur)), Big(0));
        } catch (e: any) {
            // console.log(`getUndelegatedBalance endp ${endp} Error ${e?.message}`) 
        }
    }
}


const getBalanceStaked = async (address: string, endpoints: string[]) => {
    for (const endp of endpoints) {
        try {
            let client = await StargateClient.connect(endp);
            let data = await client.getBalanceStaked(address);
            return data;
        } catch (e: any) {
            // console.log(`getBalanceStaked endp ${endp} Error ${e?.message}`) 
        }
    }
}

const getBalanceOnAccount = async (address: string, denom: string, endpoints: string[]) => {
    for (const endp of endpoints) {
        try {
            let client = await StargateClient.connect(endp);
            let data = await client.getBalance(address, denom);
            return data;
        } catch (e: any) {
            // console.log(`getBalanceOnAccount endp ${endp} Error ${e?.message} `) 
        }
    }
}

(async () => {
    setInterval(externalAccountsCheckerJob, TimeSpansMs.hour)
    await externalAccountsCheckerJob();
})();