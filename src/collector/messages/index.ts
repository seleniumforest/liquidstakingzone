import { CoinTuple } from "..";
import { BlockHeader } from "../../apiWrapper";
import { DecodedTx } from "../decoder";
import { insertMsgLiquidStake } from "./msgLiquidStake";
import { insertMsgSend } from "./msgSend";

const msgsMap = new Map<string, (header: BlockHeader, tx: DecodedTx, msg: any) => Promise<void>>([
    ["/cosmos.bank.v1beta1.MsgSend", insertMsgSend],
    ["/stride.stakeibc.MsgLiquidStake", insertMsgLiquidStake]
]);

export interface msgData {
    id: string,
    code: number,
    height: number,
    txhash: string,
    fee: CoinTuple
} 

export { msgsMap };