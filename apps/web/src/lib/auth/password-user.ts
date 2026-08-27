import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getOrCreateDefaultUser } from "@/lib/auth/session";

export async function defaultUserHasPassword(): Promise<boolean> {
  const userId = await getOrCreateDefaultUser();
  const db = getDb();
  const [user] = await db
    .select({ passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return !!user?.passwordHash;
}

export async function setDefaultUserPassword(password: string): Promise<void> {
  const userId = await getOrCreateDefaultUser();
  const passwordHash = await hashPassword(password);
  const db = getDb();
  await db
    .update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.id, userId));
}

export async function verifyDefaultUserPassword(
  password: string,
): Promise<string | null> {
  const userId = await getOrCreateDefaultUser();
  const db = getDb();
  const [user] = await db
    .select({ passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user?.passwordHash) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  return ok ? userId : null;
}
