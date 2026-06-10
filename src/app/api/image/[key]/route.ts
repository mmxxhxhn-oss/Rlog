import { NextRequest, NextResponse } from "next/server"
import { getSignedUrlForKey } from "@/lib/storage"

// GET /api/image/[key] - Redirect to signed URL for image access
// Key is URL encoded, e.g., /api/image/images%2Fxxx.png -> images/xxx.png
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    // Decode the URL-encoded key (e.g., "images%2Fxxx.png" -> "images/xxx.png")
    const decodedKey = decodeURIComponent(key)

    // Generate signed URL with 1 hour expiration
    const signedUrl = await getSignedUrlForKey(decodedKey, 3600)

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error("Image proxy error:", error)
    return NextResponse.json({ error: "Failed to get image URL" }, { status: 500 })
  }
}