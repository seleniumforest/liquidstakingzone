/*
    Deploy DB Schema Script 
    clickhouse-client --multiquery < deploy.sql
*/

CREATE DATABASE IF NOT EXISTS Stride;

/* Table with block headers */
CREATE TABLE IF NOT EXISTS Stride.block_headers
(
    height UInt32,
    hash String,
    time DateTime,
    chainId String,
    operatorAddress String
)
ENGINE = MergeTree()
PRIMARY KEY (height);

-- /* Table with /cosmos.bank.v1beta1.MsgSend transactions */
-- CREATE TABLE IF NOT EXISTS Stride.txs_MsgSend
-- (
--     height UInt32, /* "foreign key" to Stride.block_headers */
--     txhash String,
--     sender String,
--     code UInt8,
--     operator_address String
-- )
-- ENGINE = MergeTree()
-- PRIMARY KEY (height)