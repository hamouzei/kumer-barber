import pino from "pino";
import { env } from "../config/env.js";

// In Vercel serverless environments or production, standard JSON output is required.
// pino-pretty uses worker threads and dynamic imports that fail in Vercel serverless functions.
const isVercel = Boolean(process.env.VERCEL);
const isProduction = env.NODE_ENV === "production" || isVercel;

export const logger = pino({
  level: isProduction ? "info" : "debug",
  ...(!isProduction && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
        ignore: "pid,hostname",
      },
    },
  }),
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});
