"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: err } = await authClient.signUp.email({
      email,
      password,
      name: username,
      username,
    });
    setBusy(false);
    if (err) {
      setError(err.message ?? "Sign up failed");
      return;
    }
    router.push("/rank");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label htmlFor="username" className="mb-1 block text-sm text-muted">
          Username
        </label>
        <input
          id="username"
          type="text"
          required
          minLength={3}
          maxLength={30}
          pattern="[a-zA-Z0-9_.]+"
          title="Letters, numbers, underscores and dots only"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-md border border-edge bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-muted">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-edge bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-muted">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-edge bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted">At least 8 characters</p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full cursor-pointer rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
