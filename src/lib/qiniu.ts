import qiniu from "qiniu"

// Qiniu config - server side only
interface QiniuConfig {
  accessKey: string
  secretKey: string
  bucket: string
  zone: qiniu.conf.Zone
  domain: string // CDN domain, e.g., https://cdn.example.com
}

// Get Qiniu configuration from environment
function getConfig(): QiniuConfig {
  const accessKey = process.env.QINIU_ACCESS_KEY
  const secretKey = process.env.QINIU_SECRET_KEY
  const bucket = process.env.QINIU_BUCKET
  const zoneStr = process.env.QINIU_ZONE || "zone0"
  const domain = process.env.QINIU_DOMAIN

  if (!accessKey || !secretKey || !bucket || !domain) {
    throw new Error("Qiniu configuration is missing")
  }

  // Map zone string to Qiniu zone
  const zoneMap: Record<string, qiniu.conf.Zone> = {
    zone0: qiniu.zone.Zone_z0, // 华东
    zone1: qiniu.zone.Zone_z1, // 华北
    zone2: qiniu.zone.Zone_z2, // 华南
    zoneNa0: qiniu.zone.Zone_na0, // 北美
  }

  return {
    accessKey,
    secretKey,
    bucket,
    zone: zoneMap[zoneStr] || qiniu.zone.Zone_z0,
    domain: domain.endsWith("/") ? domain.slice(0, -1) : domain,
  }
}

// Generate unique filename
function generateKey(originalName: string, folder: string = "images"): string {
  const ext = originalName.split(".").pop() || ""
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const baseName = originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "-")
  return `${folder}/${timestamp}-${random}-${baseName}${ext ? `.${ext}` : ""}`
}

// Upload file buffer to Qiniu
export async function uploadToQiniu(
  fileBuffer: Buffer,
  key: string,
  mimeType: string = "application/octet-stream"
): Promise<{ url: string; key: string; size: number }> {
  const config = getConfig()

  // Create upload token
  const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey)
  const putPolicy = new qiniu.rs.PutPolicy({ scope: config.bucket })
  const uploadToken = putPolicy.uploadToken(mac)

  // Configure upload manager
  const qiniuConfig = new qiniu.conf.Config({ zone: config.zone })
  const formUploader = new qiniu.form_up.FormUploader(qiniuConfig)
  const putExtra = new qiniu.form_up.PutExtra()

  return new Promise((resolve, reject) => {
    formUploader.put(
      uploadToken,
      key,
      fileBuffer,
      putExtra,
      (respErr, respBody, respInfo) => {
        if (respErr) {
          reject(respErr)
          return
        }

        if (respInfo.statusCode === 200) {
          const url = `${config.domain}/${key}`
          resolve({
            url,
            key,
            size: fileBuffer.length,
          })
        } else {
          reject(new Error(`Upload failed with status ${respInfo.statusCode}: ${JSON.stringify(respBody)}`))
        }
      }
    )
  })
}

// Upload file from request (for API route)
export async function uploadFileToQiniu(
  file: File | Buffer,
  filename: string,
  folder: string = "images"
): Promise<{ url: string; key: string; size: number }> {
  let buffer: Buffer

  if (file instanceof File) {
    buffer = Buffer.from(await file.arrayBuffer())
  } else {
    buffer = file
  }

  const key = generateKey(filename, folder)
  return uploadToQiniu(buffer, key, file instanceof File ? file.type : "application/octet-stream")
}

// Delete file from Qiniu
export async function deleteFromQiniu(key: string): Promise<void> {
  const config = getConfig()

  const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey)
  const bucketManager = new qiniu.rs.BucketManager(mac, new qiniu.conf.Config({ zone: config.zone }))

  return new Promise((resolve, reject) => {
    bucketManager.delete(config.bucket, key, (err, respBody, respInfo) => {
      if (err) {
        reject(err)
        return
      }

      if (respInfo.statusCode === 200) {
        resolve()
      } else if (respInfo.statusCode === 612) {
        // File not found, considered as success
        resolve()
      } else {
        reject(new Error(`Delete failed with status ${respInfo.statusCode}`))
      }
    })
  })
}