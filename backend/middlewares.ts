import { NextFunction, Request, Response } from "express";
import NodeCache from "node-cache";

export const cache = new NodeCache({ stdTTL: 60 * 5, checkperiod: 120, deleteOnExpire: true });

export const caching = async (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl === "/status")
        res.setHeader('Cache-Control', 'no-store');
    else
        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');

    next();
}

export const logging = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date()} called ${req.originalUrl}`);
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