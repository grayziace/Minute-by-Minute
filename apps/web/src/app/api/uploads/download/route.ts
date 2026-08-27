import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import {
  getSessionUserId,
  getOrCreateDefaultUser,
} from "@/lib/auth/session";
import { getPresignedDownloadUrl } from "@/lib/storage/r2";

export async function GET(request: Request) {
  try {
    let userId = await getSessionUserId();
    if (!userId) {
      userId = await getOrCreateDefaultUser();
    }

    const { searchParams } = new URL(request.url);
    const mediaAssetId = searchParams.get("mediaAssetId");
    if (!mediaAssetId) {
      return NextResponse.json({ error: "mediaAssetId required" }, { status: 400 });
    }

    const db = getDb();
    const [asset] = await db
      .select()
      .from(schema.mediaAssets)
      .where(
        and(
          eq(schema.mediaAssets.id, mediaAssetId),
          eq(schema.mediaAssets.userId, userId),
        ),
      )
      .limit(1);

    if (!asset?.storageKey) {
      return NextResponse.json({ error: "Media not found or not uploaded" }, { status: 404 });
    }

    const url = await getPresignedDownloadUrl(asset.storageKey, 3600);

    return NextResponse.json({
      url,
      mimeType: asset.mimeType,
      filename: asset.originalFilename,
      byteSize: asset.byteSize,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
