/** WebAuthn relying party — domain must match the site URL. */
export function getRpConfig(request?: Pick<Request, "headers">) {
  const rpName = process.env.RP_NAME?.trim() || "Minute by Minute";

  // Prefer the live request URL so passkeys match what the browser sees.
  if (request) {
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (host) {
      const rpID = host.split(":")[0]!;
      const proto =
        request.headers.get("x-forwarded-proto") ??
        (host.includes("localhost") ? "http" : "https");
      return {
        rpName,
        rpID,
        origin: `${proto}://${host}`.replace(/\/$/, ""),
      };
    }
  }

  const rpID = process.env.RP_ID?.trim();
  const origin = process.env.RP_ORIGIN?.trim();
  if (rpID && origin) {
    return { rpName, rpID, origin: origin.replace(/\/$/, "") };
  }

  if (process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.replace(/\/$/, "");
    return {
      rpName,
      rpID: host.split(":")[0]!,
      origin: `https://${host}`,
    };
  }

  return {
    rpName,
    rpID: process.env.RP_ID?.trim() || "localhost",
    origin: process.env.RP_ORIGIN?.trim() || "http://localhost:3000",
  };
}

export function getSetupError(): string | null {
  if (!process.env.DATABASE_URL?.trim()) {
    return "Database not configured. Add DATABASE_URL in your hosting settings (e.g. Neon Postgres), then redeploy.";
  }
  return null;
}

function friendlyPasskeyError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Passkey registration failed. Please try again.";
  }

  const msg = err.message;
  if (msg.includes("DATABASE_URL")) {
    return "Database not configured. Add DATABASE_URL in Vercel → Settings → Environment Variables.";
  }
  if (/origin|Origin/i.test(msg)) {
    return "Passkey origin mismatch. Open the site from your main Vercel URL (https), then try again.";
  }
  if (/challenge/i.test(msg)) {
    return "Registration timed out. Click Register passkey again.";
  }
  if (/duplicate|unique/i.test(msg)) {
    return "This passkey is already registered. Try Sign in instead.";
  }

  return `Passkey error: ${msg.slice(0, 160)}`;
}

export { friendlyPasskeyError };
