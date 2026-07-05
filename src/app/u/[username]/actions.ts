"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

export type ToggleLikeResult =
  | { ok: true; liked: boolean; count: number }
  | { ok: false; error: string };

export async function toggleLike(
  likedUserId: string
): Promise<ToggleLikeResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { ok: false, error: "Sign in to like rankings" };
  }
  if (typeof likedUserId !== "string" || !likedUserId) {
    return { ok: false, error: "Invalid user" };
  }
  if (likedUserId === session.user.id) {
    return { ok: false, error: "You cannot like your own ranking" };
  }
  const target = await pool.query(`SELECT 1 FROM "user" WHERE id = $1`, [
    likedUserId,
  ]);
  if (!target.rowCount) {
    return { ok: false, error: "User not found" };
  }

  const removed = await pool.query(
    `DELETE FROM ranking_like WHERE user_id = $1 AND liked_user_id = $2`,
    [session.user.id, likedUserId]
  );
  let liked = false;
  if (!removed.rowCount) {
    await pool.query(
      `INSERT INTO ranking_like (user_id, liked_user_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [session.user.id, likedUserId]
    );
    liked = true;
  }
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM ranking_like WHERE liked_user_id = $1`,
    [likedUserId]
  );
  return { ok: true, liked, count: rows[0].count };
}
