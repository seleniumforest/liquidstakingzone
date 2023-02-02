import { getMsgBaseData, msgData } from ".";
import { insertData } from "../clickhouse";
import { DecodedTx } from "../decoder";

export interface msgVoteData extends msgData {
    proposalId: string,
    voter: string,
    // const (
    // 	VoteOption_VOTE_OPTION_UNSPECIFIED VoteOption = 0
    // 	VoteOption_VOTE_OPTION_YES VoteOption = 1
    // 	VoteOption_VOTE_OPTION_ABSTAIN VoteOption = 2
    // 	VoteOption_VOTE_OPTION_NO VoteOption = 3
    // 	VoteOption_VOTE_OPTION_NO_WITH_VETO VoteOption = 4
    // )
    option: number
}

export const insertMsgVote = async (tx: DecodedTx, msg: any): Promise<void> => {
    let data: msgVoteData = {
        ...getMsgBaseData(tx),
        proposalId: msg.proposalId.toString(),
        voter: msg.voter,
        option: msg.option
    };

    await insertData("msgs_MsgVote", data);
}