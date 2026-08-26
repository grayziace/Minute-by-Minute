import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getRpConfig } from "@/lib/auth/rp-config";

export async function getRegistrationOptions(userId: string, request?: Request) {
  const db = getDb();
  const credentials = await db
    .select()
    .from(schema.passkeyCredentials)
    .where(eq(schema.passkeyCredentials.userId, userId));

  const { rpName, rpID } = getRpConfig(request);

  return generateRegistrationOptions({
    rpName,
    rpID,
    userName: userId,
    userID: new TextEncoder().encode(userId),
    attestationType: "none",
    excludeCredentials: credentials.map((c) => ({
      id: c.id,
      transports: c.transports?.split(",") as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });
}

export async function getAuthenticationOptions(request?: Request) {
  const db = getDb();
  const credentials = await db.select().from(schema.passkeyCredentials);
  const { rpID } = getRpConfig(request);

  return generateAuthenticationOptions({
    rpID,
    allowCredentials: credentials.map((c) => ({
      id: c.id,
      transports: c.transports?.split(",") as AuthenticatorTransportFuture[],
    })),
    userVerification: "preferred",
  });
}

export async function verifyAuthentication(
  response: Parameters<typeof verifyAuthenticationResponse>[0]["response"],
  expectedChallenge: string,
  request?: Request,
) {
  const db = getDb();
  const credentialId = response.id;
  const [credential] = await db
    .select()
    .from(schema.passkeyCredentials)
    .where(eq(schema.passkeyCredentials.id, credentialId))
    .limit(1);

  if (!credential) return null;

  const { rpID, origin } = getRpConfig(request);
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey, "base64"),
      counter: credential.counter,
      transports: credential.transports?.split(",") as AuthenticatorTransportFuture[],
    },
  });

  if (!verification.verified) return null;

  await db
    .update(schema.passkeyCredentials)
    .set({ counter: verification.authenticationInfo.newCounter })
    .where(eq(schema.passkeyCredentials.id, credentialId));

  return credential.userId;
}

export async function hasPasskeys(): Promise<boolean> {
  const db = getDb();
  const credentials = await db.select().from(schema.passkeyCredentials).limit(1);
  return credentials.length > 0;
}
