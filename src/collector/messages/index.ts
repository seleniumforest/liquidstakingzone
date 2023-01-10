import { BlockHeader } from "../../apiWrapper";
import { DecodedTx } from "../decoder";
import { insertMsgSend } from "./msgSend";

const msgsMap = new Map<string, (header: BlockHeader, tx: DecodedTx, msg: any) => Promise<void>>([
    ["/cosmos.bank.v1beta1.MsgSend", insertMsgSend]
]);

export { msgsMap };