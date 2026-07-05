"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function deleteAccount() {
    setBusy(true);
    setError(null);
    const { error: err } = await authClient.deleteUser(
      password ? { password } : {}
    );
    setBusy(false);
    if (err) {
      setError(err.message ?? "Could not delete the account. Try signing in again first.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="cursor-pointer text-sm text-muted underline transition-colors hover:text-red-400"
      >
        Delete my account
      </button>
    );
  }

  return (
    <div className="max-w-sm space-y-3 rounded-md border border-red-400/40 bg-surface p-4">
      <p className="text-sm">
        This permanently removes your account, your ranking, and your sign-in
        methods. There is no undo.
      </p>
      <div>
        <label htmlFor="delete-password" className="mb-1 block text-sm text-muted">
          Password (leave empty for Google or Discord accounts)
        </label>
        <input
          id="delete-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-edge bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={deleteAccount}
          disabled={busy}
          className="cursor-pointer rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Deleting..." : "Permanently delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="cursor-pointer rounded-md border border-edge px-3 py-1.5 text-sm transition-colors hover:border-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
