import { NextFunction, Request, Response } from "express";
import NodeCache from "node-cache";

export const cache = new NodeCache({ stdTTL: 60 * 5, checkperiod: 120, deleteOnExpire: true });

export const caching = async (req: Request, res: Response, next: NextFunction) => {
    let key = req.originalUrl;
    let cached = cache.get(key);

    if (cached) {
        return res.json(cached);
    }

    next();
}

export const logging = (req: Request, res: Response, next: NextFunction) => {
    let cached = cache.get(req.originalUrl);
    console.log(`${new Date()} called ${req.originalUrl} ${cached ? "cached" : "not cached"}`);
    next();
}

const whitelist = ['https://liquidstaking.zone', 'http://localhost:3000', "https://analytics-backend.vercel.app"];

export const corsOptionsCheck = (req: any, callback: any) => {
    let corsOptions;

    let isDomainAllowed = whitelist.indexOf(req.header('Origin')) !== -1;
    if (isDomainAllowed) {
        // Enable CORS for this request
        corsOptions = { origin: true }
    } else {
        // Disable CORS for this request
        corsOptions = { origin: false }
    }
    callback(null, corsOptions)
}