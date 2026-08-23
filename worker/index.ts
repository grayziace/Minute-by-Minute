import postgres from "postgres";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const DATABASE_URL = process.env.DATABASE_URL!;
const POLL_INTERVAL = 5000;

function getS3() {
  return new S3Client({
    region: process.env.S3_REGION ?? "us-east-1",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
  });
}

async function processPendingMedia(sql: ReturnType<typeof postgres>) {
  const pending = await sql`
    SELECT id, storage_key, mime_type FROM media_assets
    WHERE upload_status = 'processing'
    LIMIT 5
  `;

  for (const asset of pending) {
    if (!String(asset.mime_type).startsWith("image/")) {
      await sql`
        UPDATE media_assets SET upload_status = 'ready', updated_at = NOW()
        WHERE id = ${asset.id}
      `;
      continue;
    }

    try {
      const s3 = getS3();
      const obj = await s3.send(
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: asset.storage_key,
        }),
      );
      const bytes = await obj.Body!.transformToByteArray();
      let input = Buffer.from(bytes);

      if (asset.mime_type === "image/heic") {
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

        const variantKey = `variants/${asset.id}/${name}`;
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: variantKey,
            Body: variant,
            ContentType: "image/webp",
          }),
        );

        await sql`
          INSERT INTO media_variants (media_asset_id, variant_type, storage_key)
          VALUES (${asset.id}, 'thumbnail', ${variantKey})
          ON CONFLICT DO NOTHING
        `;
      }

      await sql`
        UPDATE media_assets SET upload_status = 'ready', updated_at = NOW()
        WHERE id = ${asset.id}
      `;
    } catch (err) {
      console.error("Processing failed:", asset.id, err);
      await sql`
        UPDATE media_assets SET upload_status = 'failed', updated_at = NOW()
        WHERE id = ${asset.id}
      `;
    }
  }
}

async function main() {
  console.log("MBM worker started");
  const sql = postgres(DATABASE_URL, { prepare: false });

  while (true) {
    try {
      await processPendingMedia(sql);
    } catch (err) {
      console.error("Worker loop error:", err);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
}

main().catch(console.error);
