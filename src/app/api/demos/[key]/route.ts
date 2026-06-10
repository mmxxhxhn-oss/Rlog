import { NextRequest, NextResponse } from "next/server"
import { getSignedUrlForKey } from "@/lib/storage"

// GET /api/demos/[key] - Return signed URL for demo access
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    // Decode the URL-encoded key
    const decodedKey = decodeURIComponent(key)

    // Generate signed URL with 1 hour expiration
    const signedUrl = await getSignedUrlForKey(decodedKey, 3600)

    // Return signed URL as JSON
    return NextResponse.json({ url: signedUrl })
  } catch (error) {
    console.error("Demo proxy error:", error)
    return NextResponse.json({ error: "Failed to get demo URL" }, { status: 500 })
  }
}