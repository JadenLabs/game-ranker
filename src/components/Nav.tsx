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
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 sm:gap-5 sm:px-4">
        <Link
          href="/"
          className="whitespace-nowrap font-mono text-sm font-bold tracking-tight"
        >
          <span className="text-accent">#</span>
          <span className="hidden sm:inline">gameranker</span>
          <span className="sm:hidden">gr</span>
        </Link>
        <Link
          href="/users"
          className="whitespace-nowrap text-sm text-muted transition-colors hover:text-foreground"
        >
          Players
        </Link>
        {session && (
          <Link
            href="/rank"
            className="whitespace-nowrap text-sm text-muted transition-colors hover:text-foreground"
          >
            My Top 10
          </Link>
        )}
        <div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-4">
          {session ? (
            <>
              {username && (
                <Link
                  href={`/u/${username}`}
                  className="truncate font-mono text-sm text-muted transition-colors hover:text-foreground"
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
                className="whitespace-nowrap text-sm text-muted transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="whitespace-nowrap rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <span className="hidden sm:inline">Create account</span>
                <span className="sm:hidden">Sign up</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
