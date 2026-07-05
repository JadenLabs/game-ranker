import { ImageResponse } from "next/og";
import { getLikeInfo, getRankingForUser, getUserByUsername } from "@/lib/rankings";
import { coverUrl } from "@/lib/igdb";
import { SCORED_POSITIONS } from "@/lib/ranking-constants";

export const alt = "A player's game ranking on Game Ranker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mirrors the palette in globals.css.
const theme = {
  background: "#0a0a0f",
  foreground: "#e8e8f0",
  surface: "#14141c",
  edge: "#262634",
  muted: "#8b8ba0",
  accent: "#8b5cf6",
};

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(decodeURIComponent(username));
  const [ranking, likeInfo] = user
    ? await Promise.all([getRankingForUser(user.id), getLikeInfo(user.id)])
    : [[], { count: 0, likedByViewer: false }];
  const displayName = user
    ? user.displayUsername ?? user.username ?? user.name ?? "Player"
    : "Player";
  // Embeds only ever show cover art for the scored top 10, even when the
  // list extends to 20 games.
  const covers = ranking.slice(0, SCORED_POSITIONS);
  // Satori's flex-wrap misjudges widths, so lay the grid out as explicit rows.
  const rows = [covers.slice(0, 5), covers.slice(5)].filter((r) => r.length > 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: 56,
          backgroundColor: theme.background,
          color: theme.foreground,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 400,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
            <span style={{ color: theme.accent }}>#</span>
            <span>gameranker</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 52,
              fontWeight: 700,
              wordBreak: "break-all",
            }}
          >
            @{displayName}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 28,
              color: theme.muted,
            }}
          >
            {ranking.length > 0
              ? `Top ${ranking.length} favorite games`
              : "No ranking yet"}
          </div>
          {likeInfo.count > 0 && (
            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 24,
                color: theme.muted,
              }}
            >
              {`${likeInfo.count} ${likeInfo.count === 1 ? "like" : "likes"}`}
            </div>
          )}
        </div>
        {covers.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              flexGrow: 1,
            }}
          >
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: "flex", gap: 12 }}>
                {row.map((game) => (
                  <div
                    key={game.gameId}
                    style={{
                      position: "relative",
                      display: "flex",
                      width: 118,
                      height: 157,
                      borderRadius: 8,
                      overflow: "hidden",
                      backgroundColor: theme.surface,
                      border: `1px solid ${theme.edge}`,
                    }}
                  >
                    {game.coverImageId && (
                      <img
                        src={coverUrl(game.coverImageId)}
                        alt=""
                        width={118}
                        height={157}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: "rgba(10, 10, 15, 0.85)",
                        color: theme.accent,
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {game.position}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    size
  );
}
