import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getSetupError } from "@/lib/auth/rp-config";

export async function GET() {
  const configError = getSetupError();
  if (configError) {
    return NextResponse.json({ authenticated: false, setupError: configError });
  }

  try {
    const userId = await getSessionUserId();
    return NextResponse.json({ authenticated: !!userId });
  } catch {
    return NextResponse.json({
      authenticated: false,
      setupError: "Database connection failed.",
    });
  }
}
