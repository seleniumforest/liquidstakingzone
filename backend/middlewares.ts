import { NextFunction, Request, Response } from "express";

export const caching = async (req: Request, res: Response, next: NextFunction) => {
    let isLocalhost = req.header('Origin')?.indexOf("http://localhost")! < 1;

    if (!isLocalhost) {
        if (req.originalUrl === "/status")
            res.setHeader('Cache-Control', 'no-store');
        else
            res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    }

    next();
}

export const logging = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date()} called ${req.originalUrl}`);
    next();
}

export const corsOptionsCheck = (req: any, callback: any) => {
    let isDomainAllowed = [
        'https://liquidstaking.zone',
        'http://localhost:3000',
        "https://analytics-backend.vercel.app"
    ].indexOf(req.header('Origin')) !== -1;

    callback(null, { origin: isDomainAllowed })
}

export const errHandle = async (handler: any, req: Request, res: Response, next: NextFunction) => {
    try {
        return await handler(req, res, next);
    } catch (err: any) {
        console.log(err?.message || err);
        return res.status(500).json(err);
    }
}