import express, { Response } from "express";
import { caching, corsOptionsCheck, errHandle, logging } from "./middlewares";
import * as handlers from "./handlers";
import cors from 'cors';
import { zones } from "./constants";

const app = express();

app.use(cors(corsOptionsCheck));
app.use(caching);
app.use(logging);

app.get('/activeUsers', (...args) => errHandle(handlers.activeUsers, ...args));
app.get('/assetsDeposited', (...args) => errHandle(handlers.assetsDeposited, ...args));
app.get('/assetsOnStakingWallets', (...args) => errHandle(handlers.assetsOnStakingWallets, ...args));
app.get('/assetsRedeemed', (...args) => errHandle(handlers.assetsRedeemed, ...args));
app.get('/depositorsVolume', (...args) => errHandle(handlers.depositorsVolume, ...args));
app.get('/latestEvents', (...args) => errHandle(handlers.latestEvents, ...args));
app.get('/protocolRevenue', (...args) => errHandle(handlers.protocolRevenue, ...args));
app.get('/redemptionRates', (...args) => errHandle(handlers.redemptionRates, ...args));
app.get('/tvlByChains', (...args) => errHandle(handlers.tvlByChains, ...args));
app.get('/uniqueDepositors', (...args) => errHandle(handlers.uniqueDepositors, ...args));
app.get('/generalData', (...args) => errHandle(handlers.generalData, ...args));
app.get('/zonesInfo', (_, res: Response) => res.json(zones));
app.get('/status', (...args) => errHandle(handlers.statusPage, ...args));

const server = app.listen(process.env.PORT || 8081, function () {
    console.log("Backend started at", server.address())
})