"use client";

import { useEffect, useRef, useState } from "react";

// Copies the profile's public URL so it can be pasted anywhere; the page
// ships Open Graph tags, so Discord and other apps unfurl it into an
// embed showing the ranking.
export default function ShareButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
      return;
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="cursor-pointer rounded-md border border-edge px-3 py-1.5 text-sm font-medium transition-colors hover:border-muted"
    >
      {copied ? "Link copied!" : "Share"}
    </button>
  );
}
