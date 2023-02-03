import { fromBase64 } from '@cosmjs/encoding';
import { Coin, Registry } from '@cosmjs/proto-signing';
import { defaultRegistryTypes } from '@cosmjs/stargate';
import { insertData } from '../db/';
import { DecodedTx } from "../decoder";
import { TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { getFeeFromEvents, getZoneFromAddress } from '../helpers';

export const insertMsgRecvPacket = async (tx: DecodedTx, msg: any, feeAcc: string): Promise<void> => {
    let msgPacket = JSON.parse(new TextDecoder().decode(msg.packet.data))?.data;
    if (!msgPacket)
        return;

    let decodedMsgPacket = fromBase64(msgPacket);
    let decodedBody = TxBody.decode(decodedMsgPacket);
    let sendMsgs = decodedBody
        .messages
        .filter(x => x.typeUrl === "/cosmos.bank.v1beta1.MsgSend")
        .map(x => new Registry(defaultRegistryTypes).decode({ typeUrl: x.typeUrl, value: x.value }))
        .map(decoded => {
            return {
                txhash: tx.hash,
                height: tx.height,
                sender: tx.sender,
                code: tx.tx_result.code,
                fee: getFeeFromEvents(tx.tx_result.events),
                zone: getZoneFromAddress(decoded.toAddress),
                fromAddress: decoded.fromAddress,
                feeAccount: decoded.toAddress,
                amount: decoded.amount.map((x: Coin) => ([x.denom, x.amount]))
            }
        })
        .filter(x => x.feeAccount === feeAcc);

    await insertData("zones_fees_collected", sendMsgs)
}