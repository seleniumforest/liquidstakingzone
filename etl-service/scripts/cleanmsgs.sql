ALTER TABLE Stride.transactions DELETE WHERE date >= 1693353600;
ALTER TABLE Stride.block_headers DELETE WHERE date >= 1693353600;
ALTER TABLE Stride.msgs_MsgSend DELETE WHERE date >= 1693353600;
ALTER TABLE Stride.msgs_MsgWithdrawDelegatorReward DELETE WHERE date >= 1693353600;
ALTER TABLE Stride.msgs_MsgDelegate DELETE WHERE date >= 1693353600;
ALTER TABLE Stride.msgs_MsgLiquidStake DELETE WHERE date >= 1693353600;
ALTER TABLE Stride.msgs_MsgRedeemStake DELETE WHERE date >= 1693353600;