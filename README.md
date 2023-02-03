# indexer

Grabs transactions from cosmos sdk chain and writes into clickhouse db

To run, first edit .env file and run 

``` yarn run deploydb ``` -- deploys db schema

``` yarn run populatedb ``` -- populates db with transactions history on fee accounts at cosmoshub/juno/stars/osmo !!! existing hardcoded rpc may go down, need rpcs with full history !!!

``` pm2 start ``` -- runs pm2 jobs described in ecosystem.config.js

Project directories: 

0) /scripts - .sql script for clickhouse to deploy db schema

1) src/db - read/write operations with clickhouse
2) src/externalServices - integrations with other services
3) src/jobs - entry points to program, that composed by pm2
4) src/messagaes - handlers for each message type 

tsc binaries in build/ 

pm2 saves logs in logs/ 