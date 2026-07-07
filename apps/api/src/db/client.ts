import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5,
  idleTimeout: 60_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30_000,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: true } : undefined,
});

export const db = drizzle(pool, { schema, mode: "default" });

export { pool };
