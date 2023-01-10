# indexer

Grabs transactions from cosmos sdk chain and writes into clickhouse db

To run, deploy db first

``` clickhouse-client --multiquery < deploy.sql  ```

Then run 

``` ts-node src/collector/index.ts ```