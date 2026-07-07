import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./shared/logger.js";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      env: env.NODE_ENV,
      frontendUrl: env.FRONTEND_URL,
    },
    `🚀 Barber API running on port ${env.PORT}`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception — shutting down");
  process.exit(1);
});
