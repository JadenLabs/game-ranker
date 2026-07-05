import { pool } from "./db";

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

export type UserListItem = PublicUser & {
  gameCount: number;
  topGameName: string | null;
  topCoverImageId: string | null;
};

export type CommunityGame = {
  id: number;
  name: string;
  coverImageId: string | null;
  releaseYear: number | null;
  points: number;
  listCount: number;
};

export async function getRankingForUser(userId: string): Promise<RankedGame[]> {
  const { rows } = await pool.query(
    `SELECT r.position, g.id AS "gameId", g.name,
            g.cover_image_id AS "coverImageId", g.release_year AS "releaseYear"
     FROM ranking r JOIN game g ON g.id = r.game_id
     WHERE r.user_id = $1 ORDER BY r.position`,
    [userId]
  );
  return rows as RankedGame[];
}

export async function getUserByUsername(
  username: string
): Promise<PublicUser | undefined> {
  const { rows } = await pool.query(
    `SELECT id, name, username, "displayUsername", image
     FROM "user" WHERE username = $1`,
    [username.toLowerCase()]
  );
  return rows[0] as PublicUser | undefined;
}

export async function listUsers(): Promise<UserListItem[]> {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.username, u."displayUsername", u.image,
       (SELECT COUNT(*) FROM ranking r WHERE r.user_id = u.id)::int AS "gameCount",
       (SELECT g.name FROM ranking r JOIN game g ON g.id = r.game_id
          WHERE r.user_id = u.id AND r.position = 1) AS "topGameName",
       (SELECT g.cover_image_id FROM ranking r JOIN game g ON g.id = r.game_id
          WHERE r.user_id = u.id AND r.position = 1) AS "topCoverImageId"
     FROM "user" u
     ORDER BY u."createdAt" DESC`
  );
  return rows as UserListItem[];
}

export async function getCommunityTop(limit = 10): Promise<CommunityGame[]> {
  const { rows } = await pool.query(
    `SELECT g.id, g.name, g.cover_image_id AS "coverImageId",
            g.release_year AS "releaseYear",
            SUM(11 - r.position)::int AS points,
            COUNT(*)::int AS "listCount"
     FROM ranking r JOIN game g ON g.id = r.game_id
     GROUP BY g.id
     ORDER BY points DESC, "listCount" DESC, g.name ASC
     LIMIT $1`,
    [limit]
  );
  return rows as CommunityGame[];
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
  const orderScore = 1 - avgDistance / 9;
  const similarity = Math.round(overlap * (0.7 + 0.3 * orderScore) * 100);
  return { sharedGameIds, sharedCount: shared.length, similarity };
}
