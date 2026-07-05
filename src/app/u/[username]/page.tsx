import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getLikeInfo, getRankingForUser, getUserByUsername } from "@/lib/rankings";
import GameCover from "@/components/GameCover";
import LikeButton from "@/components/LikeButton";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(decodeURIComponent(username));
  if (!user) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const viewerUsername = (
    session?.user as { username?: string | null } | undefined
  )?.username;
  const isOwner = session?.user.id === user.id;

  const [ranking, likeInfo] = await Promise.all([
    getRankingForUser(user.id),
    getLikeInfo(user.id, session?.user.id),
  ]);
  const displayName = user.displayUsername ?? user.username ?? user.name;
  const likeMode = isOwner ? "own" : session ? "toggle" : "signed-out";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold">@{displayName}</h1>
          <p className="mt-1 text-sm text-muted">
            {ranking.length > 0
              ? `Top ${ranking.length} favorite games`
              : "No ranking yet"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LikeButton
            likedUserId={user.id}
            initialCount={likeInfo.count}
            initialLiked={likeInfo.likedByViewer}
            mode={likeMode}
          />
          {isOwner && (
            <Link
              href="/rank"
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Edit my list
            </Link>
          )}
          {!isOwner && session && viewerUsername && user.username && (
            <Link
              href={`/compare/${viewerUsername}/${user.username}`}
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Compare with my list
            </Link>
          )}
        </div>
      </div>

      {ranking.length === 0 ? (
        <p className="rounded-md border border-dashed border-edge p-10 text-center text-sm text-muted">
          {isOwner
            ? "You have not ranked any games yet."
            : "This player has not ranked any games yet."}
          {isOwner && (
            <>
              {" "}
              <Link href="/rank" className="text-accent hover:underline">
                Build your top 10
              </Link>
            </>
          )}
        </p>
      ) : (
        <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {ranking.map((game) => (
            <li
              key={game.gameId}
              className="overflow-hidden rounded-lg border border-edge bg-surface"
            >
              <div className="relative aspect-[3/4]">
                <span className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-background/85 font-mono text-sm font-bold text-accent">
                  {game.position}
                </span>
                <GameCover
                  imageId={game.coverImageId}
                  name={game.name}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 220px"
                  priority={game.position <= 5}
                />
              </div>
              <div className="px-3 py-2">
                <p className="truncate font-mono text-sm font-medium" title={game.name}>
                  {game.name}
                </p>
                {game.releaseYear && (
                  <p className="text-xs text-muted">{game.releaseYear}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
