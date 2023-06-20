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
    date UInt64,
    chainId String,
    operatorAddress String
) ENGINE = MergeTree() PRIMARY KEY (height);
CREATE TABLE Stride.transactions (
    txhash String,
    date UInt64,
    /* "foreign key" to Stride.block_headers */
    height UInt64,
    sender String,
    code UInt8,
    /*rawdata String */
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
    txcode UInt8,
    date UInt64,
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
    date UInt64,
    txcode UInt8,
    delegatorAddress String,
    validatorAddress String,
    reward Tuple (String, UInt256)
) ENGINE = MergeTree() PRIMARY KEY (id);
/* cosmos.staking.v1beta1.MsgDelegate */
CREATE TABLE Stride.msgs_MsgDelegate (
    id UUID,
    txhash String,
    fee Tuple (String, UInt256),
    date UInt64,
    txcode UInt8,
    delegatorAddress String,
    validatorAddress String,
    amount Tuple (String, UInt256)
) ENGINE = MergeTree() PRIMARY KEY (id);
/* /cosmos.gov.v1beta1.MsgVote */
CREATE TABLE Stride.msgs_MsgVote (
    id UUID,
    txhash String,
    fee Tuple (String, UInt256),
    date UInt64,
    txcode UInt8,
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
    date UInt64,
    /* "foreign key" to Stride.transactions */
    txhash String,
    fee Tuple (String, UInt256),
    creator String,
    txcode UInt8,
    amount Tuple (String, UInt256),
    recievedStTokenAmount Tuple (String, UInt256),
    zone String
) ENGINE = MergeTree() PRIMARY KEY (id);
/* stride.stakeibc.MsgRedeemStake */
CREATE TABLE Stride.msgs_MsgRedeemStake (
    id UUID,
    date UInt64,
    /* "foreign key" to Stride.transactions */
    txhash String,
    fee Tuple (String, UInt256),
    txcode UInt8,
    creator String,
    amount String,
    hostZone String,
    receiver String,
    zone String
) ENGINE = MergeTree() PRIMARY KEY (id);
/* Stride epochs and redemption rates */
CREATE TABLE Stride.redemptionRates (
    epochNumber UInt32,
    dateStart UInt64,
    dateEnd UInt64,
    redemptionRate Float64,
    zone String,
) ENGINE = MergeTree() PRIMARY KEY (epochNumber, zone);
/*
 
 Tables with other data
 
 */
/* Coingecko price history by days in usd */
CREATE TABLE Stride.price_history (
    id UUID,
    coin String,
    date UInt64,
    price Float32,
    vsCurrency String
) ENGINE = MergeTree() PRIMARY KEY (id);
/* Zones data */
CREATE TABLE Stride.zones_info (
    zone String,
    decimals UInt8,
    coingeckoId String
) ENGINE = MergeTree() PRIMARY KEY (zone);
INSERT INTO Stride.zones_info
	(*)
SELECT 'cosmos', 6, 'cosmos'
UNION ALL
SELECT 'stars', 6, 'stargaze'
UNION ALL
SELECT 'osmo', 6, 'osmosis'
UNION ALL
SELECT 'juno', 6, 'juno-network'
UNION ALL
SELECT 'terra', 6, 'terra-luna-2'
UNION ALL
SELECT 'evmos', 18, 'evmos'
UNION ALL
SELECT 'inj', 18, 'injective-protocol'
UNION ALL
SELECT 'scrt', 6, 'secret'
UNION ALL
SELECT 'umee', 6, 'umee';
/* Txs on Cosmoshub/Juno/Osmo/Stars on fees account */
CREATE TABLE Stride.zones_restakes (
    txhash String,
    height UInt64,
    sender String,
    code UInt8,
    fee Tuple (String, UInt256),
    zone String,
    type String,
    toAddress String,
    sequence UInt32,
    fromAddress String,
    amount Array(Tuple (String, UInt256))
) ENGINE = MergeTree() PRIMARY KEY (txhash);
/* Acccount balances, used for  */
CREATE TABLE Stride.account_balances_history (
    id UUID,
    zone String,
    address String,
    date UInt64,
    assets Array(Tuple (String, UInt256))
) ENGINE = MergeTree() PRIMARY KEY (id);
/* General data snapshots */
CREATE TABLE Stride.general_data (
    id UUID,
    date UInt64,
    mcap UInt64,
    vol UInt64
) ENGINE = MergeTree() PRIMARY KEY (id);