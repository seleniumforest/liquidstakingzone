# indexer

Grabs transactions from cosmos sdk chain and writes into clickhouse db

To run, first edit .env file and deploy DB schema

``` clickhouse-client --multiquery < deploy.sql  ```

Then run 

``` ts-node src/collector/index.ts ```
