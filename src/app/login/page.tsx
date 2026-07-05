import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth, enabledSocialProviders } from "@/lib/auth";
import LoginForm from "@/components/auth/LoginForm";
import SocialButtons from "@/components/auth/SocialButtons";

export const metadata = { title: "Sign in | Game Ranker" };

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/rank");

  const { google, discord } = enabledSocialProviders;

  return (
    <div className="mx-auto mt-10 w-full max-w-sm">
      <h1 className="mb-6 font-mono text-xl font-bold">Sign in</h1>
      <div className="space-y-4 rounded-lg border border-edge bg-surface p-6">
        <SocialButtons google={google} discord={discord} />
        {(google || discord) && (
          <div className="flex items-center gap-3 text-xs text-muted">
            <div className="h-px flex-1 bg-edge" />
            or
            <div className="h-px flex-1 bg-edge" />
          </div>
        )}
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        No account yet?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
