import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import {
  getS3Client,
  getBucket,
  buildVariantKey,
} from "@/lib/storage/r2";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  try {
    const { mediaAssetId } = await request.json();
    const db = getDb();
    const [asset] = await db
      .select()
      .from(schema.mediaAssets)
      .where(eq(schema.mediaAssets.id, mediaAssetId))
      .limit(1);

    if (!asset) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (asset.mimeType.startsWith("image/")) {
      await processImage(asset.id, asset.storageKey, asset.mimeType);
    }

    await db
      .update(schema.mediaAssets)
      .set({ uploadStatus: "ready", updatedAt: new Date() })
      .where(eq(schema.mediaAssets.id, mediaAssetId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function processImage(
  assetId: string,
  storageKey: string,
  mimeType: string,
) {
  const client = getS3Client();
  const bucket = getBucket();

  const obj = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: storageKey }),
  );
  const bytes = await obj.Body!.transformToByteArray();
  let input = Buffer.from(bytes);

  if (mimeType === "image/heic" || mimeType === "image/heif") {
    input = await sharp(input).jpeg().toBuffer();
  }

  for (const [name, width] of [
    ["thumb_400.webp", 400],
    ["thumb_1200.webp", 1200],
  ] as const) {
    const variant = await sharp(input)
      .rotate()
      .resize(width, width, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const meta = await sharp(variant).metadata();
    const variantKey = buildVariantKey(assetId, name);

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: variantKey,
        Body: variant,
        ContentType: "image/webp",
      }),
    );

    const db = getDb();
    await db.insert(schema.mediaVariants).values({
      mediaAssetId: assetId,
      variantType: "thumbnail",
      storageKey: variantKey,
      width: meta.width ?? null,
      height: meta.height ?? null,
    });
  }
}
