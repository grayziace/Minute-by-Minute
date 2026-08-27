import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAuthenticationOptions,
  verifyAuthentication,
} from "@/lib/auth/passkey";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { getSetupError, friendlyPasskeyError } from "@/lib/auth/rp-config";
import {
  defaultUserHasPassword,
  setDefaultUserPassword,
  verifyDefaultUserPassword,
} from "@/lib/auth/password-user";
import { validatePasswordStrength } from "@/lib/auth/password";

const CHALLENGE_COOKIE = "mbm_auth_challenge";

function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const configError = getSetupError();
  if (configError) {
    return apiError(configError, 503);
  }

  try {
    const body = await request.json();
    const cookieStore = await cookies();

    if (body.action === "login-options") {
      const options = await getAuthenticationOptions(request);
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
        return apiError("Login timed out. Please try again.", 400);
      }

      const userId = await verifyAuthentication(
        body.credential,
        expectedChallenge,
        request,
      );
      if (!userId) {
        return apiError("Passkey not recognised. Register first.", 401);
      }

      const sessionId = await createSession(userId);
      await setSessionCookie(sessionId);
      cookieStore.delete(CHALLENGE_COOKIE);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "password-login") {
      const password = typeof body.password === "string" ? body.password : "";
      if (!password) {
        return apiError("Enter your password.", 400);
      }

      const hasPassword = await defaultUserHasPassword();
      if (!hasPassword) {
        return apiError("No password set yet. Create one first.", 400);
      }

      const userId = await verifyDefaultUserPassword(password);
      if (!userId) {
        return apiError("Incorrect password.", 401);
      }

      const sessionId = await createSession(userId);
      await setSessionCookie(sessionId);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "set-password") {
      const password = typeof body.password === "string" ? body.password : "";
      const strengthError = validatePasswordStrength(password);
      if (strengthError) {
        return apiError(strengthError, 400);
      }

      const hasPassword = await defaultUserHasPassword();
      if (hasPassword) {
        return apiError("Password already set. Sign in instead.", 400);
      }

      await setDefaultUserPassword(password);
      const userId = await verifyDefaultUserPassword(password);
      if (!userId) {
        return apiError("Could not create password.", 500);
      }

      const sessionId = await createSession(userId);
      await setSessionCookie(sessionId);
      return NextResponse.json({ ok: true });
    }

    return apiError("Unknown action", 400);
  } catch (err) {
    console.error("Passkey login error:", err);
    return apiError(friendlyPasskeyError(err));
  }
}
