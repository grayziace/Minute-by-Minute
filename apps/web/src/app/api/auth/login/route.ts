import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAuthenticationOptions,
  verifyAuthentication,
} from "@/lib/auth/passkey";
import { createSession, setSessionCookie } from "@/lib/auth/session";

const CHALLENGE_COOKIE = "mbm_auth_challenge";

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = await cookies();

  if (body.action === "login-options") {
    const options = await getAuthenticationOptions();
    cookieStore.set(CHALLENGE_COOKIE, options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    });
    return NextResponse.json(options);
  }

  if (body.action === "login-verify") {
    const expectedChallenge = cookieStore.get(CHALLENGE_COOKIE)?.value;
    if (!expectedChallenge) {
      return NextResponse.json({ error: "No challenge" }, { status: 400 });
    }

    const userId = await verifyAuthentication(body.credential, expectedChallenge);
    if (!userId) {
      return NextResponse.json({ error: "Verification failed" }, { status: 401 });
    }

    const sessionId = await createSession(userId);
    await setSessionCookie(sessionId);
    cookieStore.delete(CHALLENGE_COOKIE);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
