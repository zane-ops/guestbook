import { createSessionStorage } from "react-router";
import { RedisKV } from "./kv.server";
import { nanoid } from "nanoid";
import { db } from "./database";
import { usersTable } from "./database/schema";
import { eq } from "drizzle-orm";

const kv = new RedisKV();
const SEVEN_DAYS_IN_SECONDS = 3600 * 24 * 7;

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error?: string;
  success?: string;
};

const { getSession, commitSession, destroySession } = createSessionStorage<
  SessionData,
  SessionFlashData
>({
  // a Cookie from `createCookie` or the CookieOptions to create one
  cookie: {
    name: "__session",
    // all of these are optional
    domain: process.env.SESSION_DOMAIN ?? "localhost",
    httpOnly: true,
    maxAge: SEVEN_DAYS_IN_SECONDS,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.SESSION_SECURE === "true"
  },
  async createData(data, expires) {
    const sessionId = nanoid();
    let ttl: number | undefined;
    if (expires) {
      const now = new Date().getTime();
      ttl = Math.round((expires.getTime() - now) / 1000);
    }
    await kv.set(`auth:session:${sessionId}`, data, ttl);
    return sessionId;
  },
  async readData(id) {
    return await kv.get(`auth:session:${id}`);
  },
  async updateData(id, data, expires) {
    let ttl: number | undefined;
    if (expires) {
      const now = new Date().getTime();
      ttl = Math.round((expires.getTime() - now) / 1000);
    }
    await kv.set(`auth:session:${id}`, data, ttl);
  },
  async deleteData(id) {
    await kv.delete(`auth:session:${id}`);
  }
});

export type Session = Awaited<ReturnType<typeof getSession>>;

export async function getUser(session: Session) {
  const users = await db
    .select({
      username: usersTable.username,
      id: usersTable.github_id
    })
    .from(usersTable)
    .where(eq(usersTable.github_id, session.get("userId") ?? ""));

  return users.length > 0 ? users[0] : null;
}

export { getSession, commitSession, destroySession };
