import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import SignOutButton from "./SignOutButton";

export default async function Nav() {
  const session = await auth.api.getSession({ headers: await headers() });
  const username = (session?.user as { username?: string | null } | undefined)
    ?.username;

  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-5 px-4">
        <Link href="/" className="font-mono text-sm font-bold tracking-tight">
          <span className="text-accent">#</span>gameranker
        </Link>
        <Link
          href="/users"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          Players
        </Link>
        {session && (
          <Link
            href="/rank"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            My Top 10
          </Link>
        )}
        <div className="ml-auto flex items-center gap-4">
          {session ? (
            <>
              {username && (
                <Link
                  href={`/u/${username}`}
                  className="font-mono text-sm text-muted transition-colors hover:text-foreground"
                >
                  @{username}
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
