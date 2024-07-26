# Dashboard for liquid staked assets in Cosmos 

Deployed at https://liquidstaking.zone/ 


# ui

Edit .env and ``` yarn start ```

# etl-service

Edit .env and then
``` 
npx prisma migrate dev 
pm2 start ecosystem.config.js
```

Project directories: 

1) prisma - everything that deploys db and views
2) externalServices - integrations with other services
3) jobs - entry points to program, that composed by pm2
    - backend.ts - backend for ui. Runs on .env.PORT || 8081 Port
    - fetchBlocksJob - fetches blocks and handles txs and messages
    - priceUpdateJob - updates prices for STassets and base assets
    - externalAccountsCheckerJob - looks for Stride external account balances
    - statusWatcherJob - watches for latest sync status and sends notifications in case of failure. Runs on :3000
4) messagaes - handlers for each message type 
