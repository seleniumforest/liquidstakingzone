import { fromBase64 } from '@cosmjs/encoding';
import { Coin } from '@cosmjs/proto-signing';
import { insertData, isFeeTxExist } from '../db/';
import { DecodedTx } from "../decoder";
import { TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { getFeeFromEvents, getZoneFromAddress } from '../helpers';
import { fetchZoneInfo } from '../externalServices/strideApi';
import { universalRegistry } from '../constants';

export const insertMsgAcknowledgement = async (tx: DecodedTx, msg: any): Promise<void> => {
    //icacontroller-cosmoshub-4.WITHDRAWAL
    if (msg.packet.sourcePort.split(".")[1] !== "WITHDRAWAL")
        return;

    let msgPacket = JSON.parse(new TextDecoder().decode(msg.packet.data))?.data;
    if (!msgPacket)
        return;

    let hostZonesConfig = await fetchZoneInfo();
    let decodedMsgPacket = fromBase64(msgPacket);
    let decodedBody = TxBody.decode(decodedMsgPacket);
    let sendMsgs = decodedBody
        .messages
        .filter(x => x.typeUrl === "/cosmos.bank.v1beta1.MsgSend")
        .map(x => universalRegistry.decode({ typeUrl: x.typeUrl, value: x.value }))
        .map(decoded => {
            return {
                txhash: tx.hash,
                height: tx.height,
                sender: tx.sender,
                code: tx.tx_result.code,
                fee: getFeeFromEvents(tx.tx_result.events),
                zone: getZoneFromAddress(decoded.toAddress),
                fromAddress: decoded.fromAddress,
                sequence: Number(msg.packet.sequence.toString()),
                feeAccount: decoded.toAddress,
                amount: decoded.amount.map((x: Coin) => ([x.denom, x.amount]))
            }
        })
        .filter(x => x.feeAccount === hostZonesConfig.find(y => y.zone === x.zone)!.feeAcc);

    for (const sendMsg of sendMsgs) {
        let isExists = await isFeeTxExist(sendMsg.zone, sendMsg.sequence);
        if (isExists)
            continue;
        await insertData("zones_fees_collected", sendMsg);

        try {
            let acknowledgementPacketLength = fromBase64(JSON.parse(new TextDecoder().decode(msg?.acknowledgement))?.result)?.length;
            console.log(`acknowledgementPacketLength = ${acknowledgementPacketLength}, txhash = ${tx.hash}`)
        } catch { }
    }
}