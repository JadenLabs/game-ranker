"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

export type RankEntry = {
  id: number;
  name: string;
  coverImageId: string | null;
  releaseYear: number | null;
};

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveRanking(entries: RankEntry[]): Promise<SaveResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false, error: "Sign in required" };
  }
  if (!Array.isArray(entries) || entries.length > 10) {
    return { ok: false, error: "A ranking can hold at most 10 games" };
  }
  const seen = new Set<number>();
  for (const e of entries) {
    if (
      !Number.isInteger(e.id) ||
      e.id <= 0 ||
      typeof e.name !== "string" ||
      !e.name.trim() ||
      (e.coverImageId !== null && typeof e.coverImageId !== "string") ||
      (e.releaseYear !== null && !Number.isInteger(e.releaseYear))
    ) {
      return { ok: false, error: "Invalid game data" };
    }
    if (seen.has(e.id)) {
      return { ok: false, error: "The same game appears twice" };
    }
    seen.add(e.id);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM ranking WHERE user_id = $1`, [
      session.user.id,
    ]);
    for (const [i, e] of entries.entries()) {
      await client.query(
        `INSERT INTO game (id, name, cover_image_id, release_year)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           cover_image_id = EXCLUDED.cover_image_id,
           release_year = EXCLUDED.release_year`,
        [e.id, e.name.trim().slice(0, 200), e.coverImageId, e.releaseYear]
      );
      await client.query(
        `INSERT INTO ranking (user_id, game_id, position) VALUES ($1, $2, $3)`,
        [session.user.id, e.id, i + 1]
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
