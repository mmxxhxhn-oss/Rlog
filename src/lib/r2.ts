import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

// Generate unique ID
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// R2 Client - Server side only
let r2Client: S3Client | null = null

export function getR2Client(): S3Client {
  if (r2Client) return r2Client

  if (
    !process.env.CF_ACCOUNT_ID ||
    !process.env.CF_ACCESS_KEY_ID ||
    !process.env.CF_SECRET_ACCESS_KEY ||
    !process.env.CF_BUCKET_NAME
  ) {
    throw new Error("Cloudflare R2 configuration is missing")
  }

  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CF_ACCESS_KEY_ID,
      secretAccessKey: process.env.CF_SECRET_ACCESS_KEY,
    },
  })

  return r2Client
}

// Get public URL for uploaded file
export function getPublicUrl(key: string): string {
  if (process.env.CF_PUBLIC_DOMAIN) {
    return `https://${process.env.CF_PUBLIC_DOMAIN}/${key}`
  }
  // Fallback to R2 public URL
  const bucketName = process.env.CF_BUCKET_NAME
  const accountId = process.env.CF_ACCOUNT_ID
  return `https://pub.${accountId}.r2.dev/${bucketName}/${key}`
}

// Allowed MIME types for images
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export interface UploadOptions {
  folder?: string
  allowedTypes?: string[]
  maxSize?: number
}

/**
 * Upload a file to Cloudflare R2
 * @param file - File buffer or Blob
 * @param filename - Original filename
 * @param contentType - MIME type
 * @param options - Upload options
 * @returns Upload result with URL and key
 */
export async function uploadToR2(
  file: Buffer | ArrayBuffer | Blob,
  filename: string,
  contentType: string,
  options: UploadOptions = {}
): Promise<{ url: string; key: string; size: number }> {
  const { folder = "uploads", allowedTypes = ALLOWED_IMAGE_TYPES, maxSize = MAX_FILE_SIZE } = options

  // Validate file type
  if (!allowedTypes.includes(contentType)) {
    throw new Error(`File type ${contentType} is not allowed`)
  }

  // Get file size
  let fileSize: number
  if (file instanceof Blob) {
    fileSize = file.size
  } else if (file instanceof ArrayBuffer) {
    fileSize = file.byteLength
  } else {
    fileSize = file.length
  }

  if (fileSize > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`)
  }

  // Generate unique key
  const ext = filename.split(".").pop() || ""
  const uniqueId = generateUniqueId()
  const key = `${folder}/${uniqueId}${ext ? `.${ext}` : ""}`

  const client = getR2Client()

  // Convert to Buffer if needed
  let buffer: Buffer
  if (file instanceof Blob) {
    buffer = Buffer.from(await file.arrayBuffer())
  } else if (file instanceof ArrayBuffer) {
    buffer = Buffer.from(file)
  } else {
    buffer = file as Buffer
  }

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.CF_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Cache for 1 year (public assets)
      CacheControl: "public, max-age=31536000, immutable",
    })
  )

  return {
    url: getPublicUrl(key),
    key,
    size: fileSize,
  }
}

/**
 * Delete a file from Cloudflare R2
 * @param key - The file key (path in bucket)
 */
export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client()

  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.CF_BUCKET_NAME,
      Key: key,
    })
  )
}

/**
 * Extract R2 key from full URL
 */
export function extractKeyFromUrl(url: string): string | null {
  // Handle custom domain
  if (process.env.CF_PUBLIC_DOMAIN && url.includes(process.env.CF_PUBLIC_DOMAIN)) {
    return url.split(`${process.env.CF_PUBLIC_DOMAIN}/`)[1]
  }

  // Handle R2.dev domain
  if (url.includes(".r2.dev")) {
    const parts = url.split("/")
    return parts.slice(3).join("/") // Remove https:// and account.bucket
  }

  return null
}