import { cache } from "react";
import { pool } from "./db";
import { SCORED_POSITIONS } from "./ranking-constants";

export type RankedGame = {
  position: number;
  gameId: number;
  name: string;
  coverImageId: string | null;
  releaseYear: number | null;
};

export type PublicUser = {
  id: string;
  name: string | null;
  username: string | null;
  displayUsername: string | null;
  image: string | null;
};

export type CollageGame = {
  name: string;
  coverImageId: string | null;
};

export type UserListItem = PublicUser & {
  gameCount: number;
  likeCount: number;
  games: CollageGame[];
};

export type CommunityGame = {
  id: number;
  name: string;
  coverImageId: string | null;
  releaseYear: number | null;
  points: number;
  listCount: number;
};

// Cached per request: profile pages read these from generateMetadata
// and the page component in the same render.
export const getRankingForUser = cache(async function getRankingForUser(
  userId: string
): Promise<RankedGame[]> {
  const { rows } = await pool.query(
    `SELECT r.position, g.id AS "gameId", g.name,
            g.cover_image_id AS "coverImageId", g.release_year AS "releaseYear"
     FROM ranking r JOIN game g ON g.id = r.game_id
     WHERE r.user_id = $1 ORDER BY r.position`,
    [userId]
  );
  return rows as RankedGame[];
});

export const getUserByUsername = cache(async function getUserByUsername(
  username: string
): Promise<PublicUser | undefined> {
  const { rows } = await pool.query(
    `SELECT id, name, username, "displayUsername", image
     FROM "user" WHERE username = $1`,
    [username.toLowerCase()]
  );
  return rows[0] as PublicUser | undefined;
});

export async function listUsers(): Promise<UserListItem[]> {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.username, u."displayUsername", u.image,
       (SELECT COUNT(*) FROM ranking r WHERE r.user_id = u.id)::int AS "gameCount",
       (SELECT COUNT(*) FROM ranking_like l WHERE l.liked_user_id = u.id)::int AS "likeCount",
       (SELECT COALESCE(
          json_agg(json_build_object('name', g.name, 'coverImageId', g.cover_image_id)
                   ORDER BY r.position),
          '[]')
          FROM ranking r JOIN game g ON g.id = r.game_id
          WHERE r.user_id = u.id AND r.position <= ${SCORED_POSITIONS}) AS games
     FROM "user" u
     ORDER BY u."createdAt" DESC`
  );
  return rows as UserListItem[];
}

// Without a limit, returns every game that appears in at least one ranking.
// Positions past SCORED_POSITIONS keep a game on lists but earn no points.
export async function getCommunityTop(limit?: number): Promise<CommunityGame[]> {
  const sql = `SELECT g.id, g.name, g.cover_image_id AS "coverImageId",
            g.release_year AS "releaseYear",
            SUM(GREATEST(${SCORED_POSITIONS + 1} - r.position, 0))::int AS points,
            COUNT(*)::int AS "listCount"
     FROM ranking r JOIN game g ON g.id = r.game_id
     GROUP BY g.id
     ORDER BY points DESC, "listCount" DESC, g.name ASC`;
  const { rows } =
    limit !== undefined
      ? await pool.query(`${sql} LIMIT $1`, [limit])
      : await pool.query(sql);
  return rows as CommunityGame[];
}

export type LikeInfo = { count: number; likedByViewer: boolean };

export async function getLikeInfo(
  profileUserId: string,
  viewerId?: string
): Promise<LikeInfo> {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count,
            COALESCE(BOOL_OR(user_id = $2), false) AS "likedByViewer"
     FROM ranking_like WHERE liked_user_id = $1`,
    [profileUserId, viewerId ?? ""]
  );
  return rows[0] as LikeInfo;
}

export type Comparison = {
  sharedGameIds: Set<number>;
  sharedCount: number;
  similarity: number;
};

// Overlap drives the score; rank closeness of shared games refines it.
// Identical lists in the same order score 100.
export function compareRankings(a: RankedGame[], b: RankedGame[]): Comparison {
  const bByGame = new Map(b.map((g) => [g.gameId, g.position]));
  const shared = a.filter((g) => bByGame.has(g.gameId));
  const sharedGameIds = new Set(shared.map((g) => g.gameId));
  const denom = Math.min(a.length, b.length);
  if (denom === 0 || shared.length === 0) {
    return { sharedGameIds, sharedCount: 0, similarity: 0 };
  }
  const overlap = shared.length / denom;
  const avgDistance =
    shared.reduce(
      (sum, g) => sum + Math.abs(g.position - (bByGame.get(g.gameId) ?? 0)),
      0
    ) / shared.length;
  // The largest possible rank gap between two shared games spans the
  // longer of the two lists.
  const maxDistance = Math.max(a.length, b.length) - 1;
  const orderScore = maxDistance > 0 ? 1 - avgDistance / maxDistance : 1;
  const similarity = Math.round(overlap * (0.7 + 0.3 * orderScore) * 100);
  return { sharedGameIds, sharedCount: shared.length, similarity };
}
