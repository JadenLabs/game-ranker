export type GameSearchResult = {
  id: number;
  name: string;
  coverImageId: string | null;
  releaseYear: number | null;
};

type IgdbGame = {
  id: number;
  name: string;
  cover?: { image_id: string };
  first_release_date?: number;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

export function igdbConfigured() {
  return Boolean(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID!,
    client_secret: process.env.TWITCH_CLIENT_SECRET!,
    grant_type: "client_credentials",
  });
  const res = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Twitch token request failed with status ${res.status}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

export async function searchGames(query: string): Promise<GameSearchResult[]> {
  const token = await getAccessToken();
  const safe = query.replace(/["\\]/g, "").slice(0, 100);
  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: `search "${safe}"; fields name, cover.image_id, first_release_date; where version_parent = null & game_type = (0, 4, 8, 9, 10); limit 12;`,
  });
  if (!res.ok) {
    throw new Error(`IGDB search failed with status ${res.status}`);
  }
  const games = (await res.json()) as IgdbGame[];
  return games.map((g) => ({
    id: g.id,
    name: g.name,
    coverImageId: g.cover?.image_id ?? null,
    releaseYear: g.first_release_date
      ? new Date(g.first_release_date * 1000).getUTCFullYear()
      : null,
  }));
}

export function coverUrl(
  imageId: string,
  size: "cover_big" | "cover_small" = "cover_big"
) {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}
