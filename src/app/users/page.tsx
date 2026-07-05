import Link from "next/link";
import { listUsers } from "@/lib/rankings";
import CoverCollage from "@/components/CoverCollage";

export const metadata = { title: "Players | Game Ranker" };

export default async function UsersPage() {
  const users = (await listUsers()).filter((u) => u.username);

  return (
    <div>
      <h1 className="mb-6 font-mono text-xl font-bold">Players</h1>
      {users.length === 0 ? (
        <p className="rounded-md border border-dashed border-edge p-10 text-center text-sm text-muted">
          No players yet. Be the first to{" "}
          <Link href="/signup" className="text-accent hover:underline">
            create an account
          </Link>
          .
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {users.map((user) => (
            <li key={user.id}>
              <Link
                href={`/u/${user.username}`}
                className="block overflow-hidden rounded-lg border border-edge bg-surface transition-colors hover:border-muted"
              >
                <div className="relative aspect-[3/4]">
                  <CoverCollage games={user.games} />
                </div>
                <div className="px-3 py-2">
                  <p className="truncate font-mono text-sm font-medium">
                    @{user.displayUsername ?? user.username}
                  </p>
                  <p className="text-xs text-muted">
                    {user.gameCount > 0
                      ? `${user.gameCount} ranked`
                      : "No list yet"}
                    {user.likeCount > 0 &&
                      `, ${user.likeCount} ${user.likeCount === 1 ? "like" : "likes"}`}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
