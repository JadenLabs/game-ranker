import Link from "next/link";
import { getCommunityTop } from "@/lib/rankings";
import GameCover from "@/components/GameCover";

export const metadata = { title: "Games | Game Ranker" };

export default async function GamesPage() {
  const games = await getCommunityTop();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-mono text-xl font-bold">Games</h1>
        <p className="mt-1 text-sm text-muted">
          Every game ranked by the community, ordered by points. A #1 pick is
          worth 10 points, a #10 pick is worth 1.
        </p>
      </div>
      {games.length === 0 ? (
        <p className="rounded-md border border-dashed border-edge p-10 text-center text-sm text-muted">
          No games have been ranked yet. Be the first to{" "}
          <Link href="/rank" className="text-accent hover:underline">
            build your top 10
          </Link>
          .
        </p>
      ) : (
        <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {games.map((game, i) => (
            <li
              key={game.id}
              className="overflow-hidden rounded-lg border border-edge bg-surface"
            >
              <div className="relative aspect-[3/4]">
                <span className="absolute left-2 top-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-md bg-background/85 px-1 font-mono text-sm font-bold text-accent">
                  {i + 1}
                </span>
                <GameCover
                  imageId={game.coverImageId}
                  name={game.name}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 220px"
                  priority={i < 5}
                />
              </div>
              <div className="px-3 py-2">
                <p className="truncate font-mono text-sm font-medium" title={game.name}>
                  {game.name}
                </p>
                <p className="text-xs text-muted">
                  {game.points} pts, on {game.listCount}{" "}
                  {game.listCount === 1 ? "list" : "lists"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
