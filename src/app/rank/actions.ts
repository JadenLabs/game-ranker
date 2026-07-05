"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { getGamesByIds, igdbConfigured } from "@/lib/igdb";

export type SaveResult = { ok: true } | { ok: false; error: string };

// Takes game ids only; names, covers, and years are fetched from IGDB
// server-side so clients cannot write arbitrary data into the shared
// game cache that other players' pages render from.
export async function saveRanking(gameIds: number[]): Promise<SaveResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false, error: "Sign in required" };
  }
  if (!Array.isArray(gameIds) || gameIds.length > 10) {
    return { ok: false, error: "A ranking can hold at most 10 games" };
  }
  if (!gameIds.every((id) => Number.isInteger(id) && id > 0)) {
    return { ok: false, error: "Invalid game data" };
  }
  if (new Set(gameIds).size !== gameIds.length) {
    return { ok: false, error: "The same game appears twice" };
  }
  if (gameIds.length > 0 && !igdbConfigured()) {
    return { ok: false, error: "Game search is not configured on the server" };
  }

  let games;
  try {
    games = await getGamesByIds(gameIds);
  } catch (err) {
    console.error("IGDB lookup failed while saving:", err);
    return { ok: false, error: "Could not verify games with IGDB. Try again." };
  }
  const byId = new Map(games.map((g) => [g.id, g]));
  if (gameIds.some((id) => !byId.has(id))) {
    return { ok: false, error: "One of the games could not be found on IGDB" };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM ranking WHERE user_id = $1`, [
      session.user.id,
    ]);
    for (const [i, id] of gameIds.entries()) {
      const game = byId.get(id)!;
      await client.query(
        `INSERT INTO game (id, name, cover_image_id, release_year)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           cover_image_id = EXCLUDED.cover_image_id,
           release_year = EXCLUDED.release_year`,
        [game.id, game.name.slice(0, 200), game.coverImageId, game.releaseYear]
      );
      await client.query(
        `INSERT INTO ranking (user_id, game_id, position) VALUES ($1, $2, $3)`,
        [session.user.id, id, i + 1]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to save ranking:", err);
    return { ok: false, error: "Could not save your ranking. Try again." };
  } finally {
    client.release();
  }

  return { ok: true };
}
