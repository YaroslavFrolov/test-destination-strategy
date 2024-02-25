import { AsyncLocalStorage } from "node:async_hooks";
import pino from "pino";

import type { Request, Response, NextFunction } from "express";
import type { Logger } from "pino";

type AlsStore = Map<"__logger__", Logger>;

const als = new AsyncLocalStorage<AlsStore>();

const DB_HOST = process.env.NODE_ENV === "development" ? "localhost" : "mongo";

const transports = pino.transport({
  targets: [
    {
      target: "pino-pretty",
    },
    {
      target: "pino-mongodb",
      options: {
        uri: `mongodb://${DB_HOST}:27017/docker-db`,
        database: "db-events",
        collection: "log",
      },
    },
  ],
});

const logger = pino(transports);

export const getLogger = () => {
  const store = als.getStore();
  const childLogger = store?.get("__logger__");
  return childLogger || logger;
};

export const loggerMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  /**
   * We can get TRACE_ID, for example, from request.headers["x-request-id"]
   * of some other microservice.
   */
  const TRACE_ID = Date.now();

  als.run(new Map(), () => {
    const store = als.getStore();
    const childLogger = logger.child({ TRACE_ID });
    store?.set("__logger__", childLogger);
    next();
  });
};
