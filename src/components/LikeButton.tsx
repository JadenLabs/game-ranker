"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleLike } from "@/app/u/[username]/actions";

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

export default function LikeButton({
  likedUserId,
  initialCount,
  initialLiked,
  mode,
}: {
  likedUserId: string;
  initialCount: number;
  initialLiked: boolean;
  mode: "toggle" | "own" | "signed-out";
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const baseClass =
    "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-sm transition-colors";

  if (mode === "own") {
    return (
      <span
        className={`${baseClass} border-edge text-muted`}
        title="Likes on your ranking"
      >
        <Heart filled={count > 0} />
        {count}
      </span>
    );
  }

  if (mode === "signed-out") {
    return (
      <Link
        href="/login"
        className={`${baseClass} border-edge text-muted hover:border-muted hover:text-foreground`}
        title="Sign in to like this ranking"
      >
        <Heart filled={false} />
        {count}
      </Link>
    );
  }

  function onClick() {
    const wasLiked = liked;
    const wasCount = count;
    setLiked(!wasLiked);
    setCount(wasCount + (wasLiked ? -1 : 1));
    setError(null);
    startTransition(async () => {
      const result = await toggleLike(likedUserId);
      if (result.ok) {
        setLiked(result.liked);
        setCount(result.count);
      } else {
        setLiked(wasLiked);
        setCount(wasCount);
        setError(result.error);
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={liked}
        aria-label={liked ? "Unlike this ranking" : "Like this ranking"}
        className={`${baseClass} cursor-pointer disabled:opacity-60 ${
          liked
            ? "border-accent bg-accent-soft text-accent"
            : "border-edge text-muted hover:border-muted hover:text-foreground"
        }`}
      >
        <Heart filled={liked} />
        {count}
      </button>
      {error && <span className="text-sm text-red-400">{error}</span>}
    </span>
  );
}
