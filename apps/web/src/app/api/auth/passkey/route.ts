import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getRegistrationOptions,
  hasPasskeys,
} from "@/lib/auth/passkey";
import {
  createSession,
  setSessionCookie,
  getOrCreateDefaultUser,
} from "@/lib/auth/session";

const CHALLENGE_COOKIE = "mbm_reg_challenge";

export async function GET() {
  const registered = await hasPasskeys();
  return NextResponse.json({ registered });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.action === "register-options") {
    const userId = await getOrCreateDefaultUser();
    const options = await getRegistrationOptions(userId);
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
      return NextResponse.json({ error: "No challenge" }, { status: 400 });
    }

    const { verifyRegistrationResponse } = await import("@simplewebauthn/server");
    const { rpID, origin } = {
      rpID: process.env.RP_ID ?? "localhost",
      origin: process.env.RP_ORIGIN ?? "http://localhost:3000",
    };

    const verification = await verifyRegistrationResponse({
      response: body.credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    const { credential } = verification.registrationInfo;
    const { getDb, schema } = await import("@/lib/db");
    const db = getDb();
    await db.insert(schema.passkeyCredentials).values({
      id: credential.id,
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

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
