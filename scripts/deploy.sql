/*
 Deploy DB Schema Script 
 clickhouse-client --multiquery < deploy.sql
 */
DROP DATABASE IF EXISTS Stride;
CREATE DATABASE Stride;
/*
 
 Сommon tables
 
 */
CREATE TABLE Stride.block_headers (
    height UInt64,
    hash String,
    time DateTime,
    chainId String,
    operatorAddress String
) ENGINE = MergeTree() PRIMARY KEY (height);
CREATE TABLE Stride.transactions (
    txhash String,
    /* "foreign key" to Stride.block_headers */
    height UInt64,
    sender String,
    code UInt8,
    rawdata String
) ENGINE = MergeTree() PRIMARY KEY (txhash);
/*
 
 Tables with common Cosmos SDK messages
 
 */
/* cosmos.bank.v1beta1.MsgSend transactions */
CREATE TABLE Stride.msgs_MsgSend (
    id UUID,
    /* "foreign key" to Stride.transactions */
    txhash String,
    fee Tuple (String, UInt256),
    fromAddress String,
    toAddress String,
    /* denom and amount */
    amount Array(Tuple (String, UInt256))
) ENGINE = MergeTree() PRIMARY KEY (id);
/* cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward */
CREATE TABLE Stride.msgs_MsgWithdrawDelegatorReward (
    id UUID,
    txhash String,
    fee Tuple (String, UInt256),
    delegatorAddress String,
    validatorAddress String,
    reward Tuple (String, UInt256)
) ENGINE = MergeTree() PRIMARY KEY (id);
/* cosmos.staking.v1beta1.MsgDelegate */
CREATE TABLE Stride.msgs_MsgDelegate (
    id UUID,
    txhash String,
    fee Tuple (String, UInt256),
    delegatorAddress String,
    validatorAddress String,
    amount Tuple (String, UInt256)
) ENGINE = MergeTree() PRIMARY KEY (id);
/* /cosmos.gov.v1beta1.MsgVote */
CREATE TABLE Stride.msgs_MsgVote (
    id UUID,
    txhash String,
    fee Tuple (String, UInt256),
    proposalId String,
    voter String,
    option UInt8
) ENGINE = MergeTree() PRIMARY KEY (id);
/*
 
 Tables with Stride specific messages
 
 */
/* stride.stakeibc.MsgLiquidStake */
CREATE TABLE Stride.msgs_MsgLiquidStake (
    id UUID,
    /* "foreign key" to Stride.transactions */
    txhash String,
    fee Tuple (String, UInt256),
    creator String,
    amount String,
    hostDenom String
) ENGINE = MergeTree() PRIMARY KEY (id);
/* stride.stakeibc.MsgRedeemStake */
CREATE TABLE Stride.msgs_MsgRedeemStake (
    id UUID,
    /* "foreign key" to Stride.transactions */
    txhash String,
    fee Tuple (String, UInt256),
    creator String,
    amount String,
    hostZone String,
    receiver String
) ENGINE = MergeTree() PRIMARY KEY (id);
