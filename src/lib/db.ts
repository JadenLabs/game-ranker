import { Pool } from "pg";

// Reuse a single pool across dev hot reloads and serverless invocations
const globalForDb = globalThis as unknown as { pool?: Pool };

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add your Postgres connection string (e.g. from Neon) to .env.local or the Vercel environment."
    );
  }
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

export const pool = globalForDb.pool ?? (globalForDb.pool = createPool());
