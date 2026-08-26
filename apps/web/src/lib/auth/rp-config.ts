/** WebAuthn relying party — domain must match the site URL. */
export function getRpConfig(request?: Pick<Request, "headers">) {
  if (process.env.RP_ID && process.env.RP_ORIGIN) {
    return {
      rpName: process.env.RP_NAME ?? "Minute by Minute",
      rpID: process.env.RP_ID,
      origin: process.env.RP_ORIGIN.replace(/\/$/, ""),
    };
  }

  const host =
    request?.headers.get("x-forwarded-host") ??
    request?.headers.get("host") ??
    process.env.VERCEL_URL ??
    null;

  if (host) {
    const rpID = host.split(":")[0]!;
    const proto =
      request?.headers.get("x-forwarded-proto") ??
      (host.includes("localhost") ? "http" : "https");
    return {
      rpName: process.env.RP_NAME ?? "Minute by Minute",
      rpID,
      origin: `${proto}://${host}`.replace(/\/$/, ""),
    };
  }

  return {
    rpName: process.env.RP_NAME ?? "Minute by Minute",
    rpID: process.env.RP_ID ?? "localhost",
    origin: process.env.RP_ORIGIN ?? "http://localhost:3000",
  };
}

export function getSetupError(): string | null {
  if (!process.env.DATABASE_URL) {
    return "Database not configured. Add DATABASE_URL in your hosting settings (e.g. Neon Postgres), then redeploy.";
  }
  return null;
}
