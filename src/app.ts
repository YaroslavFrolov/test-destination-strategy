import express from "express";
import {
  CustomHTTPerror,
  globalSyncErrorHandler,
} from "./infrastructure/error-handlers";
import { initDestiantions } from "./infrastructure/destinations";
import { initAppConfig } from "./infrastructure/app-config";
import { loggerMiddleware } from "./infrastructure/logger";
import apiRouter from "./routes/api";
import jwtRouter from "./routes/jwt";

export const initApp = () => {
  initAppConfig();
  initDestiantions();

  const app = express();

  app.use(express.json());
  app.use(loggerMiddleware);
  app.use("/api", apiRouter);
  app.use("/jwt", jwtRouter);
  app.use(() => {
    throw new CustomHTTPerror(404, "Can't find page or route");
  });
  app.use(globalSyncErrorHandler);

  return app;
};
