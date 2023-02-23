import { fromBase64 } from '@cosmjs/encoding';
import { Coin } from '@cosmjs/proto-signing';
import { insertData, isFeeTxExist } from '../db/';
import { DecodedTx } from "../decoder";
import { TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { getFeeFromEvents, getZoneFromAddress } from '../helpers';
import { fetchZonesInfo } from '../externalServices/strideApi';
import { universalRegistry } from '../constants';

export const insertMsgAcknowledgement = async (tx: DecodedTx, msg: any): Promise<void> => {
    //icacontroller-cosmoshub-4.WITHDRAWAL
    if (msg.packet.sourcePort != "icacontroller-cosmoshub-4.WITHDRAWAL")
        return;

    let msgPacket = JSON.parse(new TextDecoder().decode(msg.packet.data))?.data;
    if (!msgPacket)
        return;

    let hostZonesConfig = await fetchZonesInfo();
    let decodedMsgPacket = fromBase64(msgPacket);
    let decodedBody = TxBody.decode(decodedMsgPacket);
    let sendMsgs = decodedBody
        .messages
        .filter(x => x.typeUrl === "/cosmos.bank.v1beta1.MsgSend")
        .map(x => universalRegistry.decode({ typeUrl: x.typeUrl, value: x.value }))
        .map(decoded => {
            let zone = getZoneFromAddress(decoded.toAddress);
            let zoneConfig = hostZonesConfig.find(x => x.zone === zone);
            let type = "";

            if (decoded.toAddress === zoneConfig?.delegationAcc)
                type = "delegation";
            else if (decoded.toAddress === zoneConfig?.feeAcc)
                type = "fee";

            return {
                txhash: tx.hash,
                height: tx.height,
                sender: tx.sender,
                code: tx.tx_result.code,
                fee: getFeeFromEvents(tx.tx_result.events),
                zone: zone,
                fromAddress: decoded.fromAddress,
                sequence: Number(msg.packet.sequence.toString()),
                toAddress: decoded.toAddress,
                amount: decoded.amount.map((x: Coin) => ([x.denom, x.amount])),
                type
            }
        });

    let currentZoneFeeAcc = hostZonesConfig.find(x => x.zone === sendMsgs[1].zone)?.feeAcc;
    let currentZoneDelegationAcc = hostZonesConfig.find(x => x.zone === sendMsgs[1].zone)?.delegationAcc;

    let isRestakeRewardsTx = sendMsgs.length == 2 &&
        ((sendMsgs[0].toAddress === currentZoneFeeAcc && sendMsgs[1].toAddress === currentZoneDelegationAcc) ||
            (sendMsgs[1].toAddress === currentZoneFeeAcc && sendMsgs[0].toAddress === currentZoneDelegationAcc))

    if (!isRestakeRewardsTx)
        return;

    await insertData("zones_restakes", sendMsgs);
}