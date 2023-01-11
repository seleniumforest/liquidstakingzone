import { CoinTuple } from "..";
import { BlockHeader } from "../../apiWrapper";
import { client } from "../clickhouse";
import { DecodedTx } from "../decoder";
import { insertMsgLiquidStake, msgLiquidStake } from "./msgLiquidStake";
import { insertMsgSend, msgSendData } from "./msgSend";
import { insertMsgWithdrawReward, msgWithdrawDelegatorReward } from "./msgWithdrawDelegatorReward";

const msgsMap = new Map<string, (header: BlockHeader, tx: DecodedTx, msg: any) => Promise<void>>([
    ["/cosmos.bank.v1beta1.MsgSend", insertMsgSend],
    ["/stride.stakeibc.MsgLiquidStake", insertMsgLiquidStake],
    ["/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward", insertMsgWithdrawReward]
]);

export type MsgData = msgSendData | msgLiquidStake | msgWithdrawDelegatorReward;

export const insertMsg = async (table: string, data: MsgData): Promise<void> => {
    await client.insert({
        table: table,
        values: [data],
        format: 'JSONEachRow'
    });
}

export interface msgData {
    id: string,
    code: number,
    height: number,
    txhash: string,
    fee: CoinTuple
} 

export { msgsMap };