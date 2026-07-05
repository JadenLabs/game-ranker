"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SocialButtons({
  google,
  discord,
}: {
  google: boolean;
  discord: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  if (!google && !discord) return null;

  async function social(provider: "google" | "discord") {
    setError(null);
    const { error: err } = await authClient.signIn.social({
      provider,
      callbackURL: "/rank",
    });
    if (err) setError(err.message ?? "Sign in failed");
  }

  return (
    <div className="space-y-2">
      {google && (
        <button
          type="button"
          onClick={() => social("google")}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-edge bg-surface-hover px-4 py-2 text-sm font-medium transition-colors hover:border-muted"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.9z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-6-2.1-6.9-5.1L1.3 17.2C3.3 21.2 7.3 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.1 14.3c-.3-.8-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.3 6.8C.5 8.4 0 10.1 0 12s.5 3.6 1.3 5.2l3.8-2.9z"
            />
            <path
              fill="#EA4335"
              d="M12 4.7c2.3 0 3.8 1 4.7 1.8l3.4-3.3C18 1.2 15.2 0 12 0 7.3 0 3.3 2.8 1.3 6.8l3.8 2.9c1-3 3.7-5 6.9-5z"
            />
          </svg>
          Continue with Google
        </button>
      )}
      {discord && (
        <button
          type="button"
          onClick={() => social("discord")}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-edge bg-surface-hover px-4 py-2 text-sm font-medium transition-colors hover:border-muted"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#5865F2"
              d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3c-.2.4-.5.9-.6 1.3a18.3 18.3 0 0 0-5.5 0C9.1 3.9 8.8 3.4 8.6 3a19.7 19.7 0 0 0-4.9 1.5A20.4 20.4 0 0 0 .2 18.1a19.9 19.9 0 0 0 6 3c.5-.7.9-1.4 1.3-2.1-.7-.3-1.4-.6-2-1l.5-.4a14.2 14.2 0 0 0 12 0l.5.4c-.6.4-1.3.7-2 1 .4.7.8 1.5 1.3 2.1a19.8 19.8 0 0 0 6-3 20.3 20.3 0 0 0-3.5-13.7zM8.1 15.3c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4 2.2 1.1 2.1 2.4c0 1.3-.9 2.4-2.1 2.4zm7.8 0c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4 2.2 1.1 2.1 2.4c0 1.3-.9 2.4-2.1 2.4z"
            />
          </svg>
          Continue with Discord
        </button>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
