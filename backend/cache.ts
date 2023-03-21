import { NextFunction, Request, Response } from "express";
import NodeCache from "node-cache";

export const cache = new NodeCache({ stdTTL: 60 * 15, checkperiod: 120 });

export const caching = async (req: Request, res: Response, next: NextFunction) => {
    let key = req.originalUrl;
    let cached = cache.get<{ date: string, users: number }[]>(key);

    if (cached)
        return res.json(cached);

    next();
}
