import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger.js";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction {
    logger.error({ err }, "Unhandled error");
    const status = Number(err?.status) || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ error: "ERROR", message})
} )