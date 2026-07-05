import { Pool } from "pg";
import { MAX_RANKING_SIZE } from "./ranking-constants";

// Reuse a single pool across dev hot reloads and serverless invocations
const globalForDb = globalThis as unknown as {
  pool?: Pool;
  rankingConstraintEnsured?: Promise<void>;
};

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add your Postgres connection string (e.g. from Neon) to .env.local or the Vercel environment."
    );
  }
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

export const pool = globalForDb.pool ?? (globalForDb.pool = createPool());

async function widenRankingConstraint() {
  const { rows } = await pool.query(
    `SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint
     WHERE conrelid = to_regclass('ranking') AND conname = 'ranking_position_check'`
  );
  const def = rows[0]?.def as string | undefined;
  const currentMax = def?.match(/<=\s*(\d+)/)?.[1];
  if (!currentMax || Number(currentMax) >= MAX_RANKING_SIZE) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Serialize concurrent server instances attempting the same swap
    await client.query("SELECT pg_advisory_xact_lock(727501)");
    await client.query(
      `ALTER TABLE ranking DROP CONSTRAINT IF EXISTS ranking_position_check`
    );
    await client.query(
      `ALTER TABLE ranking ADD CONSTRAINT ranking_position_check
       CHECK (position BETWEEN 1 AND ${MAX_RANKING_SIZE})`
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Databases migrated before extended rankings still have the position
// CHECK capped at 10, which rejects saves of 11-20 games. Widening it
// here (once per server instance) keeps saves working without requiring
// db:migrate to be re-run on every deployment.
export function ensureRankingConstraint(): Promise<void> {
  globalForDb.rankingConstraintEnsured ??= widenRankingConstraint().catch(
    (err) => {
      // Retry on the next save instead of caching the failure
      globalForDb.rankingConstraintEnsured = undefined;
      throw err;
    }
  );
  return globalForDb.rankingConstraintEnsured;
}
