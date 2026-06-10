import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Generate unique ID
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Storage config from environment
interface StorageConfig {
  endpoint: string
  region: string
  credentials: {
    accessKeyId: string
    secretAccessKey: string
  }
  bucket: string
  publicDomain: string
  urlExpiration: number
}

function getConfig(): StorageConfig {
  const endpoint = process.env.STORAGE_ENDPOINT
  const region = process.env.STORAGE_REGION || "auto"
  const accessKeyId = process.env.STORAGE_ACCESS_KEY
  const secretAccessKey = process.env.STORAGE_SECRET_KEY
  const bucket = process.env.STORAGE_BUCKET
  const publicDomain = process.env.STORAGE_PUBLIC_DOMAIN
  const urlExpiration = parseInt(process.env.STORAGE_URL_EXPIRATION || "3600")

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("Storage configuration is missing")
  }

  return {
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    bucket,
    publicDomain: publicDomain || "",
    urlExpiration,
  }
}

// S3 Client - singleton
let s3Client: S3Client | null = null

export function getStorageClient(): S3Client {
  if (s3Client) return s3Client

  const config = getConfig()

  s3Client = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: config.credentials,
    forcePathStyle: false, // For most S3-compatible services including 缤纷云
  })

  return s3Client
}

// Build public URL with bucket name included
// For 缤纷云: https://rlog.bfcdn.net/rlog/images/xxx.png
function buildPublicUrl(key: string): string {
  const config = getConfig()
  // Remove leading slash if present
  const cleanKey = key.startsWith("/") ? key.slice(1) : key
  // Format: {publicDomain}/{bucket}/{key}
  if (config.publicDomain) {
    return `${config.publicDomain.replace(/\/$/, "")}/${config.bucket}/${cleanKey}`
  }
  return `${config.endpoint.replace(/\/$/, "")}/${config.bucket}/${cleanKey}`
}

// Get public URL for uploaded file (without signature)
export function getPublicUrl(key: string): string {
  return buildPublicUrl(key)
}

// Extract key from URL
export function extractKeyFromUrl(url: string): string | null {
  const config = getConfig()
  const bucketPrefix = `/${config.bucket}/`

  // Try to extract key after /{bucket}/
  if (url.includes(bucketPrefix)) {
    return url.split(bucketPrefix)[1]
  }

  // Try public domain
  if (config.publicDomain && url.includes(config.publicDomain)) {
    const withoutDomain = url.split(config.publicDomain)[1]
    // Remove leading slash and bucket if present
    const parts = withoutDomain.split("/").filter(Boolean)
    if (parts.length > 0 && parts[0] === config.bucket) {
      return parts.slice(1).join("/")
    }
    return parts.join("/")
  }

  return null
}

// Generate a signed URL for private bucket access
export async function getSignedUrlForKey(key: string, expiresIn: number = 3600): Promise<string> {
  const config = getConfig()
  const client = getStorageClient()

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  })

  const signedUrl = await getSignedUrl(client, command, { expiresIn })

  // Replace endpoint with public domain if set
  if (config.publicDomain) {
    // The signed URL format from AWS is: {endpoint}/{bucket}/{key}
    // We need to replace {endpoint}/{bucket} with publicDomain/{bucket}
    const endpointWithBucket = `${config.endpoint.replace(/\/$/, "")}/${config.bucket}`
    return signedUrl.replace(endpointWithBucket, `${config.publicDomain.replace(/\/$/, "")}/${config.bucket}`)
  }

  return signedUrl
}

// Get signed URL from full public URL (extract key and generate new signed URL)
export async function getSignedUrlFromPublicUrl(publicUrl: string, expiresIn: number = 3600): Promise<string> {
  const key = extractKeyFromUrl(publicUrl)
  if (!key) {
    return publicUrl
  }
  return getSignedUrlForKey(key, expiresIn)
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

// Upload file to S3-compatible storage
export async function uploadToStorage(
  file: Buffer | ArrayBuffer | Blob,
  filename: string,
  contentType: string,
  options: UploadOptions = {}
): Promise<{ url: string; key: string; size: number }> {
  const { folder = "images", allowedTypes = ALLOWED_IMAGE_TYPES, maxSize = MAX_FILE_SIZE } = options

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
  const sanitizedName = filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9\u4e00-\u9fa5.-]/g, "-")
  const key = `${folder}/${uniqueId}-${sanitizedName}${ext ? `.${ext}` : ""}`

  const client = getStorageClient()
  const config = getConfig()

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
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  )

  return {
    url: buildPublicUrl(key), // Returns full public URL like https://rlog.bfcdn.net/rlog/images/xxx.png
    key,
    size: fileSize,
  }
}

// Delete a file from storage
export async function deleteFromStorage(key: string): Promise<void> {
  const client = getStorageClient()
  const config = getConfig()

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    })
  )
}