import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth, enabledSocialProviders } from "@/lib/auth";
import SignupForm from "@/components/auth/SignupForm";
import SocialButtons from "@/components/auth/SocialButtons";

export const metadata = { title: "Create account | Game Ranker" };

export default async function SignupPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/rank");

  const { google, discord } = enabledSocialProviders;

  return (
    <div className="mx-auto mt-10 w-full max-w-sm">
      <h1 className="mb-6 font-mono text-xl font-bold">Create account</h1>
      <div className="space-y-4 rounded-lg border border-edge bg-surface p-6">
        <SocialButtons google={google} discord={discord} />
        {(google || discord) && (
          <div className="flex items-center gap-3 text-xs text-muted">
            <div className="h-px flex-1 bg-edge" />
            or
            <div className="h-px flex-1 bg-edge" />
          </div>
        )}
        <SignupForm />
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
