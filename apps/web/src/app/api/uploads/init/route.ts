import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import {
  getSessionUserId,
  getOrCreateDefaultUser,
} from "@/lib/auth/session";
import {
  buildOriginalKey,
  createMultipartUpload,
} from "@/lib/storage/r2";

export async function POST(request: Request) {
  try {
    let userId = await getSessionUserId();
    if (!userId) userId = await getOrCreateDefaultUser();

    const body = await request.json();
    const {
      mediaAssetId,
      filename,
      mimeType,
      byteSize,
      sha256,
      entryId,
      capturedAt,
      exifJson,
      gpsJson,
    } = body;

    const storageKey = buildOriginalKey(userId, mediaAssetId, filename);
    const uploadId = await createMultipartUpload(storageKey, mimeType);

    const db = getDb();
    await db.insert(schema.mediaAssets).values({
      id: mediaAssetId,
      userId,
      entryId: entryId ?? null,
      storageKey,
      originalFilename: filename,
      mimeType,
      byteSize,
      sha256: sha256 ?? null,
      capturedAt: capturedAt ? new Date(capturedAt) : null,
      exifJson: exifJson ?? null,
      gpsJson: gpsJson ?? null,
      uploadStatus: "uploading",
      uploadMultipartId: uploadId,
      visibility: "private",
    }).onConflictDoUpdate({
      target: schema.mediaAssets.id,
      set: {
        storageKey,
        uploadStatus: "uploading",
        uploadMultipartId: uploadId,
      },
    });

    if (!entryId) {
      await db.insert(schema.inboxItems).values({
        mediaAssetId,
        suggestedDate: capturedAt ? new Date(capturedAt) : null,
        status: "unprocessed",
      }).onConflictDoNothing();
    }

    return NextResponse.json({ uploadId, storageKey, mediaAssetId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Init failed" }, { status: 500 });
  }
}
