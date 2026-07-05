import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { igdbConfigured, searchGames } from "@/lib/igdb";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!igdbConfigured()) {
    return NextResponse.json(
      {
        error:
          "Game search is not configured. Add TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET to .env.local and restart the server.",
      },
      { status: 503 }
    );
  }
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  try {
    const results = await searchGames(q);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("Game search error:", err);
    return NextResponse.json(
      { error: "Game search failed. Try again in a moment." },
      { status: 502 }
    );
  }
}
