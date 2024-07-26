import { fromBase64, fromBech32 } from '@cosmjs/encoding';
import { Coin } from '@cosmjs/proto-signing';
import { DecodedTx } from "../decoder";
import { TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { fetchIcaZonesInfo } from '../externalServices/strideApi';
import { universalRegistry } from '../constants';
import { prisma } from '../db';
import { getBaseTxData } from '.';

export const insertMsgAcknowledgement = async (tx: DecodedTx, msg: any): Promise<void> => {
    //icacontroller-cosmoshub-4.WITHDRAWAL
    if (msg.packet.sourcePort != "icacontroller-cosmoshub-4.WITHDRAWAL")
        return;

    let msgPacket = JSON.parse(new TextDecoder().decode(msg.packet.data))?.data;
    if (!msgPacket)
        return;

    let hostZonesConfig = await fetchIcaZonesInfo();
    let decodedMsgPacket = fromBase64(msgPacket);
    let decodedBody = TxBody.decode(decodedMsgPacket);
    let sendMsgs = decodedBody
        .messages
        .filter(x => x.typeUrl === "/cosmos.bank.v1beta1.MsgSend")
        .map(x => universalRegistry.decode({ typeUrl: x.typeUrl, value: x.value }))
        .map(decoded => {
            let zone = fromBech32(decoded.toAddress).prefix
            let zoneConfig = hostZonesConfig.find(x => x.prefix === zone);
            let type = "";

            if (decoded.toAddress === zoneConfig?.delegationAcc)
                type = "delegation";
            else if (decoded.toAddress === zoneConfig?.feeAcc)
                type = "fee";

            return {
                ...getBaseTxData(tx),
                zone: zone,
                fromAddress: decoded.fromAddress,
                sequence: Number(msg.packet.sequence.toString()),
                toAddress: decoded.toAddress,
                amount: decoded.amount.map((x: Coin) => ([x.denom, x.amount])),
                type
            }
        });

    let currentZoneFeeAcc = hostZonesConfig.find(x => x.prefix === sendMsgs[1].zone)?.feeAcc;
    let currentZoneDelegationAcc = hostZonesConfig.find(x => x.prefix === sendMsgs[1].zone)?.delegationAcc;

    let isRestakeRewardsTx = sendMsgs.length == 2 &&
        ((sendMsgs[0].toAddress === currentZoneFeeAcc && sendMsgs[1].toAddress === currentZoneDelegationAcc) ||
            (sendMsgs[1].toAddress === currentZoneFeeAcc && sendMsgs[0].toAddress === currentZoneDelegationAcc))

    if (!isRestakeRewardsTx)
        return;

    for (const sendMsg of sendMsgs) {
        //there's multiple versions of same tx on blockchains, from different relayers
        //let isExists = await isFeeTxExist(sendMsg.zone, sendMsg.sequence, sendMsg.type);
        let isFeeTxExist = await prisma.zonesRestake.findUnique({
            where: {
                zone_sequence_type: {
                    zone: sendMsg.zone,
                    sequence: sendMsg.sequence,
                    type: sendMsg.type
                }
            }
        });

        if (isFeeTxExist != null)
            continue;

        await prisma.zonesRestake.create({
            data: {
                zone: sendMsg.zone,
                type: sendMsg.type,
                txhash: sendMsg.txhash,
                txcode: sendMsg.txcode,
                toAddress: sendMsg.toAddress,
                sequence: sendMsg.sequence,
                fromAddress: sendMsg.fromAddress,
                feeDenom: sendMsg.feeDenom,
                feeAmount: sendMsg.feeAmount,
                height: +tx.height,
                sender: tx.sender,
                amountAmount: sendMsg.amount.at(0)[1],
                amountDenom: sendMsg.amount.at(0)[0]
            }
        });
    }
}