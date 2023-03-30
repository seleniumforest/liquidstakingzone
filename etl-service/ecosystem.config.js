module.exports = [{
    "name": "Price Update Job",
    "script": "./build/jobs/priceUpdateJob.js",
    "error_file": "./logs/priceUpdateJob-err.log",
    "out_file": "./logs/priceUpdateJob-out.log"
},
{
    "name": "Fetch Blocks Job",
    "script": "./build/jobs/fetchBlocksJob.js",
    "error_file": "./logs/fetchBlocksJob-err.log",
    "out_file": "./logs/fetchBlocksJob-out.log"
},
{
    "name": "External account balance checkerJob",
    "script": "./build/jobs/externalAccountsCheckerJob.js",
    "error_file": "./logs/externalAccountsCheckerJob-err.log",
    "out_file": "./logs/externalAccountsCheckerJob-out.log"
}]