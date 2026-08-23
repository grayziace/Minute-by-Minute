import { NextResponse } from "next/server";
import { getPresignedPartUrl } from "@/lib/storage/r2";
import { getOrCreateDefaultUser, getSessionUserId } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    await getSessionUserId().catch(() => getOrCreateDefaultUser());
    const { storageKey, uploadId, partNumber } = await request.json();
    const url = await getPresignedPartUrl(storageKey, uploadId, partNumber);
    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Part URL failed" }, { status: 500 });
  }
}
