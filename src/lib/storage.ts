import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export class UploadError extends Error {}

/**
 * Store an uploaded image and return its public URL.
 * Dev (no R2 configured): writes to /public/uploads and serves at /uploads/...
 * Prod: uploads to the configured R2 bucket. Same call site either way.
 */
export async function putImage(file: File): Promise<string> {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new UploadError("unsupported_type");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("too_large");

  const key = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (process.env.R2_ACCOUNT_ID && process.env.R2_BUCKET) {
    return putToR2(key, bytes, file.type);
  }

  const dir = path.join(process.cwd(), "public", "uploads", path.dirname(key));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(process.cwd(), "public", "uploads", key), bytes);
  return `/uploads/${key}`;
}

async function putToR2(
  key: string,
  bytes: Buffer,
  contentType: string,
): Promise<string> {
  // Lazy-load the S3 client so dev installs don't need it.
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: bytes,
      ContentType: contentType,
    }),
  );
  return `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
}
