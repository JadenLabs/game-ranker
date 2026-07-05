import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_.]+/g, "")
    .slice(0, 20);
}

// Assign a unique username to OAuth users, who sign up without picking one
async function generateUsername(name: string, email: string) {
  let base = slugify(name) || slugify(email.split("@")[0]) || "player";
  if (base.length < 3) base = `${base}player`.slice(0, 10);
  let candidate = base;
  let n = 1;
  for (;;) {
    const { rowCount } = await pool.query(
      `SELECT 1 FROM "user" WHERE username = $1`,
      [candidate]
    );
    if (!rowCount) return candidate;
    n += 1;
    candidate = `${base}${n}`;
  }
}

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  socialProviders.discord = {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  database: pool,
  emailAndPassword: { enabled: true },
  socialProviders,
  plugins: [username(), nextCookies()],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const u = user as typeof user & {
            username?: string | null;
            displayUsername?: string | null;
          };
          if (u.username) return { data: user };
          const generated = await generateUsername(user.name ?? "", user.email);
          return {
            data: { ...user, username: generated, displayUsername: generated },
          };
        },
      },
    },
  },
});

export const enabledSocialProviders = {
  google: "google" in socialProviders,
  discord: "discord" in socialProviders,
};
