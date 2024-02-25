import http from "node:http";
import { ZodError } from "zod";
import { getLogger } from "./logger";

import type { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export class CustomHTTPerror extends Error {
  status: number;

  constructor(status: number, msg?: string) {
    super();
    this.status = status;
    this.message = msg || http.STATUS_CODES[status] || "Other error";
  }
}

export const globalSyncErrorHandler = (
  err: unknown,
  request?: Request,
  response?: Response,
  next?: NextFunction
) => {
  getLogger().error(err, "GLOBAL SYNC ERROR HANDLER");

  if (response && err instanceof CustomHTTPerror) {
    return response.status(err.status).json({ message: err.message });
  }

  if (response && err instanceof Error) {
    return response.status(500).json({
      message: err.message || "Something went wrong. Try again later",
    });
  }

  getLogger().error("Application encountered a critical error. Exiting...");
  process.exit(1);
};

export const globalAsyncErrorHandler = (error: Error) => {
  getLogger().error(error, "UNCAUGHT EXCEPTION:");
  process.exit(1);
};

export const globalRejectPromiseHandler = (reason: string) => {
  getLogger().error(`UNHANDLED PROMISE REJECTION: ${reason}`);
};

export const validateRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: err.errors });
      } else {
        globalSyncErrorHandler(err, req, res);
      }
    }
  };
