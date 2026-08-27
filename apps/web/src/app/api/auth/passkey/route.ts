import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getRegistrationOptions,
  hasPasskeys,
} from "@/lib/auth/passkey";
import { defaultUserHasPassword } from "@/lib/auth/password-user";
import {
  createSession,
  setSessionCookie,
  getOrCreateDefaultUser,
} from "@/lib/auth/session";
import { getRpConfig, getSetupError, friendlyPasskeyError } from "@/lib/auth/rp-config";

const CHALLENGE_COOKIE = "mbm_reg_challenge";

function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const configError = getSetupError();
  if (configError) {
    return NextResponse.json({ registered: false, setupError: configError });
  }

  try {
    const registered = await hasPasskeys();
    const hasPassword = await defaultUserHasPassword();
    return NextResponse.json({ registered, hasPassword });
  } catch {
    return NextResponse.json({
      registered: false,
      setupError: "Database connection failed. Check DATABASE_URL on your host.",
    });
  }
}

export async function POST(request: Request) {
  const configError = getSetupError();
  if (configError) {
    return apiError(configError, 503);
  }

  try {
    const body = await request.json();

    if (body.action === "register-options") {
      const userId = await getOrCreateDefaultUser();
      const options = await getRegistrationOptions(userId, request);
      const cookieStore = await cookies();
      cookieStore.set(CHALLENGE_COOKIE, options.challenge, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 300,
        path: "/",
      });
      return NextResponse.json(options);
    }

    if (body.action === "register-verify") {
      const userId = await getOrCreateDefaultUser();
      const cookieStore = await cookies();
      const expectedChallenge = cookieStore.get(CHALLENGE_COOKIE)?.value;
      if (!expectedChallenge) {
        return apiError("Registration timed out. Please try again.", 400);
      }

      const { verifyRegistrationResponse } = await import("@simplewebauthn/server");
      const { rpID, origin } = getRpConfig(request);

      const verification = await verifyRegistrationResponse({
        response: body.credential,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return apiError("Passkey verification failed. Try again.", 400);
      }

      const { credential } = verification.registrationInfo;
      const { getDb, schema } = await import("@/lib/db");
      const db = getDb();

      const credentialId =
        typeof credential.id === "string"
          ? credential.id
          : Buffer.from(credential.id).toString("base64url");

      await db.insert(schema.passkeyCredentials).values({
        id: credentialId,
        userId,
        publicKey: Buffer.from(credential.publicKey).toString("base64"),
        counter: credential.counter,
        transports: body.credential.response.transports?.join(","),
      });

      const sessionId = await createSession(userId);
      await setSessionCookie(sessionId);
      cookieStore.delete(CHALLENGE_COOKIE);
      return NextResponse.json({ ok: true });
    }

    return apiError("Unknown action", 400);
  } catch (err) {
    console.error("Passkey registration error:", err);
    return apiError(friendlyPasskeyError(err));
  }
}
