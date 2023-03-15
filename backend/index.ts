import express, { NextFunction, Request, Response } from "express";
import { caching } from "./cache";
import * as handlers from "./handlers";

const app = express();

const errHandle = async (handler: any, req: Request, res: Response, next: NextFunction) => {
    try {
        return await handler(req, res, next);
    } catch (e: any) {
        return res.status(500).json(e);
    }
}

app.get('/activeUsers', caching, (...args) => errHandle(handlers.activeUsers, ...args));
app.get('/assetsDeposited', caching, (...args) => errHandle(handlers.assetsDeposited, ...args));
app.get('/assetsOnStakingWallets', caching, (...args) => errHandle(handlers.assetsOnStakingWallets, ...args));
app.get('/assetsRedeemed', caching, (...args) => errHandle(handlers.assetsRedeemed, ...args));
app.get('/depositorsVolume', caching, (...args) => errHandle(handlers.depositorsVolume, ...args));
app.get('/latestEvents', caching, (...args) => errHandle(handlers.latestEvents, ...args));
app.get('/protocolRevenue', caching, (...args) => errHandle(handlers.protocolRevenue, ...args));
app.get('/redemptionRates', caching, (...args) => errHandle(handlers.redemptionRates, ...args));
app.get('/tvlByChains', caching, (...args) => errHandle(handlers.tvlByChains, ...args));

const server = app.listen(8081, function () {
    console.log("Backend started at", server.address())
})