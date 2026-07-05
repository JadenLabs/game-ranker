// Creates the app tables and runs the Better Auth migration.
// Usage: npm run db:migrate (loads .env.local if present),
// or set DATABASE_URL in the environment and run: node scripts/init-db.mjs
import { spawnSync } from "node:child_process";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

await pool.query(`
  CREATE TABLE IF NOT EXISTS game (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    cover_image_id TEXT,
    release_year INTEGER
  );
  CREATE TABLE IF NOT EXISTS ranking (
    user_id TEXT NOT NULL,
    game_id INTEGER NOT NULL REFERENCES game(id),
    position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 10),
    PRIMARY KEY (user_id, position),
    UNIQUE (user_id, game_id)
  );
`);
await pool.end();
console.log("App tables ready.");

console.log("Running Better Auth migration...");
const result = spawnSync("npx @better-auth/cli migrate -y", {
  stdio: "inherit",
  shell: true,
  env: process.env,
});
process.exit(result.status ?? 0);
