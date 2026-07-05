import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCommunityTop, listUsers } from "@/lib/rankings";
import GameCover from "@/components/GameCover";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const [topGames, allUsers] = await Promise.all([
    getCommunityTop(10),
    listUsers(),
  ]);
  const recentUsers = allUsers
    .filter((u) => u.username && u.gameCount > 0)
    .slice(0, 6);

  return (
    <div className="space-y-12">
      <section className="pt-8 text-center">
        <h1 className="font-mono text-3xl font-bold sm:text-4xl">
          Rank your <span className="text-accent">favorite games</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Build your list, share your page, and see how your taste matches up
          against other players.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {session ? (
            <Link
              href="/rank"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Edit my list
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
              <Link
                href="/users"
                className="rounded-md border border-edge px-5 py-2.5 text-sm font-medium transition-colors hover:border-muted"
              >
                Browse players
              </Link>
            </>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wide text-muted">
            Community top games
          </h2>
          <Link href="/games" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>
        {topGames.length === 0 ? (
          <p className="rounded-md border border-dashed border-edge p-10 text-center text-sm text-muted">
            No rankings yet. The community chart appears once players save
            their lists.
          </p>
        ) : (
          <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {topGames.map((game, i) => (
              <li
                key={game.id}
                className="overflow-hidden rounded-lg border border-edge bg-surface"
              >
                <div className="relative aspect-[3/4]">
                  <span className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-background/85 font-mono text-sm font-bold text-accent">
                    {i + 1}
                  </span>
                  <GameCover
                    imageId={game.coverImageId}
                    name={game.name}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
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
      </section>

      {recentUsers.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wide text-muted">
              Recent players
            </h2>
            <Link href="/users" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <ul className="flex flex-wrap gap-3">
            {recentUsers.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/u/${user.username}`}
                  className="inline-flex items-center gap-2 rounded-md border border-edge bg-surface px-3 py-2 font-mono text-sm transition-colors hover:border-muted"
                >
                  @{user.displayUsername ?? user.username}
                  <span className="text-xs text-muted">
                    {user.gameCount} ranked
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
