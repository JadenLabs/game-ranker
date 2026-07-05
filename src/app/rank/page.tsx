import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getRankingForUser } from "@/lib/rankings";
import RankEditor from "./RankEditor";

export const metadata = { title: "My Top 10 | Game Ranker" };

export default async function RankPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const username = (session.user as { username?: string | null }).username;
  const ranking = await getRankingForUser(session.user.id);
  const initial = ranking.map((r) => ({
    id: r.gameId,
    name: r.name,
    coverImageId: r.coverImageId,
    releaseYear: r.releaseYear,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-mono text-xl font-bold">My Top 10</h1>
        {username && (
          <Link
            href={`/u/${username}`}
            className="text-sm text-accent hover:underline"
          >
            View my public page
          </Link>
        )}
      </div>
      <RankEditor initial={initial} />
    </div>
  );
}
