import { cookies } from "next/headers";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "mbm_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const db = getDb();
  await db.insert(schema.sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });
  return sessionId;
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const db = getDb();
  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.id, sessionId))
    .limit(1);

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
    }
    return null;
  }
  return session.userId;
}

export async function requireUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getOrCreateDefaultUser(): Promise<string> {
  const db = getDb();
  const [existing] = await db.select().from(schema.users).limit(1);
  if (existing) return existing.id;

  const [user] = await db
    .insert(schema.users)
    .values({ email: "owner@minute-by-minute.local" })
    .returning();
  return user.id;
}
