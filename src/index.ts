import {
  globalAsyncErrorHandler,
  globalRejectPromiseHandler,
} from "./infrastructure/error-handlers";
import { initApp } from "./app";
import { getAppConfig } from "./infrastructure/app-config";
import { getLogger } from "./infrastructure/logger";

const app = initApp();

const { PORT } = getAppConfig();
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

process.on("uncaughtException", globalAsyncErrorHandler);
process.on("unhandledRejection", globalRejectPromiseHandler);
process.on("SIGTERM", gracefulShutdown);

function gracefulShutdown() {
  getLogger().info("Shutting down...");
  server.close((error) => {
    if (error) {
      getLogger().error(error);
      process.exit(1);
    } else {
      getLogger().info("HTTP server closed");
      process.exit(0);
    }
  });
}
