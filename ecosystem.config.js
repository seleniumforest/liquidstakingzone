module.exports = [{
    "name": "Price Update Job",
    "script": "./build/jobs/priceUpdateJob.js",
    "error_file": "./logs/priceUpdateJob-err.log",
    "out_file": "./logs/priceUpdateJob-out.log"
},
{
    "name": "Host Zone Watcher Job",
    "script": "./build/jobs/hostZoneWatcherJob.js",
    "error_file": "./logs/hostZoneWatcherJob-err.log",
    "out_file": "./logs/hostZoneWatcherJob-out.log"
},
{
    "name": "Fetch Blocks Job",
    "script": "./build/jobs/fetchBlocksJob.js",
    "error_file": "./logs/fetchBlocksJob-err.log",
    "out_file": "./logs/fetchBlocksJob-out.log"
}]