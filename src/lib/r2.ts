import { S3Client } from "@aws-sdk/client-s3";

type R2Config = {
  accountId: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  publicBaseUrl?: string;
};

let cachedClient: S3Client | null = null;

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getR2Config(): R2Config {
  const endpoint = requiredEnv("CLOUDFLARE_R2_S3_ENDPOINT");
  const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim();

  return {
    accountId: requiredEnv("CLOUDFLARE_R2_ACCOUNT_ID"),
    endpoint,
    accessKeyId: requiredEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
    bucketName: requiredEnv("CLOUDFLARE_R2_BUCKET_NAME"),
    region: process.env.CLOUDFLARE_R2_REGION?.trim() || "auto",
    publicBaseUrl: publicBaseUrl || undefined,
  };
}

export function getR2Client() {
  if (cachedClient) return cachedClient;

  const config = getR2Config();
  cachedClient = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });
  return cachedClient;
}

export function buildR2PublicUrl(objectKey: string) {
  const config = getR2Config();
  const normalizedKey = objectKey.replace(/^\/+/, "");
  if (config.publicBaseUrl) {
    return `${config.publicBaseUrl.replace(/\/+$/, "")}/${normalizedKey}`;
  }

  return `/api/storage/r2-object?key=${encodeURIComponent(normalizedKey)}`;
}
