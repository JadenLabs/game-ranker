import Link from "next/link";
import { notFound } from "next/navigation";
import {
  compareRankings,
  getRankingForUser,
  getUserByUsername,
  type PublicUser,
  type RankedGame,
} from "@/lib/rankings";

export const metadata = { title: "Compare | Game Ranker" };

function ComparisonColumn({
  user,
  ranking,
  shared,
  other,
}: {
  user: PublicUser;
  ranking: RankedGame[];
  shared: Set<number>;
  other: Map<number, number>;
}) {
  const displayName = user.displayUsername ?? user.username;
  return (
    <section>
      <h2 className="mb-3 font-mono text-base font-bold">
        <Link href={`/u/${user.username}`} className="hover:text-accent">
          @{displayName}
        </Link>
      </h2>
      {ranking.length === 0 ? (
        <p className="rounded-md border border-dashed border-edge p-6 text-center text-sm text-muted">
          No ranking yet
        </p>
      ) : (
        <ol className="space-y-2">
          {ranking.map((game) => {
            const isShared = shared.has(game.gameId);
            const otherPos = other.get(game.gameId);
            return (
              <li
                key={game.gameId}
                className={`flex items-center gap-3 rounded-md border px-3 py-2 ${
                  isShared
                    ? "border-accent bg-accent-soft"
                    : "border-edge bg-surface"
                }`}
              >
                <span className="w-7 text-center font-mono text-sm font-bold text-accent">
                  {game.position}
                </span>
                {game.coverImageId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://images.igdb.com/igdb/image/upload/t_cover_small/${game.coverImageId}.jpg`}
                    alt=""
                    width={30}
                    height={40}
                    className="h-10 w-[30px] rounded-sm object-cover"
                  />
                ) : (
                  <div className="h-10 w-[30px] rounded-sm bg-surface-hover" />
                )}
                <span className="min-w-0 flex-1 truncate font-mono text-sm">
                  {game.name}
                </span>
                {isShared && otherPos !== undefined && (
                  <span className="shrink-0 text-xs text-muted">
                    their #{otherPos}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;
  const [userA, userB] = await Promise.all([
    getUserByUsername(decodeURIComponent(a)),
    getUserByUsername(decodeURIComponent(b)),
  ]);
  if (!userA || !userB) notFound();

  const [rankingA, rankingB] = await Promise.all([
    getRankingForUser(userA.id),
    getRankingForUser(userB.id),
  ]);
  const { sharedGameIds, sharedCount, similarity } = compareRankings(
    rankingA,
    rankingB
  );
  const posByGameA = new Map(rankingA.map((g) => [g.gameId, g.position]));
  const posByGameB = new Map(rankingB.map((g) => [g.gameId, g.position]));

  return (
    <div>
      <h1 className="mb-2 font-mono text-xl font-bold">
        @{userA.displayUsername ?? userA.username} vs @
        {userB.displayUsername ?? userB.username}
      </h1>
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-edge bg-surface px-4 py-3">
        <div>
          <span className="font-mono text-2xl font-bold text-accent">
            {similarity}%
          </span>
          <span className="ml-2 text-sm text-muted">taste match</span>
        </div>
        <div className="text-sm text-muted">
          {sharedCount} {sharedCount === 1 ? "game" : "games"} in common
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <ComparisonColumn
          user={userA}
          ranking={rankingA}
          shared={sharedGameIds}
          other={posByGameB}
        />
        <ComparisonColumn
          user={userB}
          ranking={rankingB}
          shared={sharedGameIds}
          other={posByGameA}
        />
      </div>
    </div>
  );
}
