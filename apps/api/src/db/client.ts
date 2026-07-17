import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

// Aiven requires SSL. The `ssl-mode=REQUIRED` query param is a MySQL CLI
// convention and is not understood by mysql2 — strip it and use the `ssl`
// config option instead.
const cleanUrl = env.DATABASE_URL.replace(/[?&]ssl-mode=REQUIRED/i, "");

const pool = mysql.createPool({
  uri: cleanUrl,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5,
  idleTimeout: 60_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30_000,
  // Aiven uses a CA certificate not in the default trust store.
  // For full production hardening, download the Aiven CA cert and set
  // `ssl: { ca: fs.readFileSync('ca.pem') }`. For now, we accept the
  // Aiven-issued cert to keep setup simple.
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema, mode: "default" });

export { pool };
