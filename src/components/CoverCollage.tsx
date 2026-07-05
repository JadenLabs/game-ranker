import GameCover from "./GameCover";
import type { CollageGame } from "@/lib/rankings";

// The #1 game gets a full-width hero tile; the rest form a mosaic below it
// (up to 2 columns for small lists, 3 beyond), with an uneven last row
// stretching to fill the width. A 10-game list tiles perfectly: hero + 3x3.
export default function CoverCollage({ games }: { games: CollageGame[] }) {
  if (games.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-hover font-mono text-2xl text-muted">
        ?
      </div>
    );
  }
  const [first, ...rest] = games;
  if (rest.length === 0) {
    return <GameCover imageId={first.coverImageId} name={first.name} sizes="180px" />;
  }
  const heroHeight = rest.length <= 2 ? 60 : rest.length === 3 ? 50 : 40;
  const cols = Math.min(rest.length, 3);
  const rows = Math.ceil(rest.length / cols);
  return (
    <div className="flex h-full w-full flex-wrap">
      <div className="relative w-full" style={{ height: `${heroHeight}%` }}>
        <GameCover imageId={first.coverImageId} name={first.name} sizes="180px" />
      </div>
      {rest.map((game, i) => (
        <div
          key={i}
          className="relative min-w-0"
          style={{
            height: `${(100 - heroHeight) / rows}%`,
            flex: `1 0 ${100 / cols}%`,
          }}
        >
          <GameCover imageId={game.coverImageId} name={game.name} sizes="90px" />
        </div>
      ))}
    </div>
  );
}
