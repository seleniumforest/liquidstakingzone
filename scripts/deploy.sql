/*
 Deploy DB Schema Script 
 clickhouse-client --multiquery < deploy.sql
 */
DROP DATABASE IF EXISTS Stride;
CREATE DATABASE Stride;
/* Table with block headers */
CREATE TABLE Stride.block_headers (
    height UInt64,
    hash String,
    time DateTime,
    chainId String,
    operatorAddress String
) ENGINE = MergeTree() PRIMARY KEY (height);
/* Table with /cosmos.bank.v1beta1.MsgSend transactions */
CREATE TABLE Stride.transactions (
    txhash String,
    /* "foreign key" to Stride.block_headers */
    height UInt64,
    sender String,
    code UInt8
) ENGINE = MergeTree() PRIMARY KEY (txhash);
/* Table with /cosmos.bank.v1beta1.MsgSend transactions */
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
/* Table with /stride.stakeibc.MsgLiquidStake */
CREATE TABLE Stride.msgs_MsgLiquidStake (
    id UUID,
    /* "foreign key" to Stride.transactions */
    txhash String,
    fee Tuple (String, UInt256),
    creator String,
    amount String,
    hostDenom String
) ENGINE = MergeTree() PRIMARY KEY (id);