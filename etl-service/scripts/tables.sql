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
    zone String,
    ibcSeq String DEFAULT ('0')
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