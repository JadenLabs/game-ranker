// Shared between server code and client components, so it must not
// import anything server-only (like the pg pool).

// A ranking can hold up to 20 games, but only the top 10 earn points
// toward the community chart: #1 is worth 10, #10 is worth 1, and
// positions 11-20 are worth nothing.
export const MAX_RANKING_SIZE = 20;
export const SCORED_POSITIONS = 10;

export function pointsForPosition(position: number): number {
  return Math.max(SCORED_POSITIONS + 1 - position, 0);
}
