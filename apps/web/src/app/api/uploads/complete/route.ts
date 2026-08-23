import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { completeMultipartUpload } from "@/lib/storage/r2";
import { getOrCreateDefaultUser, getSessionUserId } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    await getSessionUserId().catch(() => getOrCreateDefaultUser());
    const { mediaAssetId, storageKey, uploadId, parts } = await request.json();

    await completeMultipartUpload(
      storageKey,
      uploadId,
      parts.map((p: { partNumber: number; etag: string }) => ({
        PartNumber: p.partNumber,
        ETag: p.etag,
      })),
    );

    const db = getDb();
    await db
      .update(schema.mediaAssets)
      .set({ uploadStatus: "processing", updatedAt: new Date() })
      .where(eq(schema.mediaAssets.id, mediaAssetId));

    // Enqueue processing (worker picks up via polling or direct call)
    fetch(`${process.env.RP_ORIGIN ?? "http://localhost:3000"}/api/worker/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaAssetId }),
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Complete failed" }, { status: 500 });
  }
}
