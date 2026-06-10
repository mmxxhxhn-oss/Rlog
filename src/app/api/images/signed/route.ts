import { NextRequest, NextResponse } from "next/server"
import { getSignedUrlFromPublicUrl } from "@/lib/storage"

// GET /api/images/signed?url=xxx - Get signed URL for an existing image
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    const signedUrl = await getSignedUrlFromPublicUrl(url)

    return NextResponse.json({ url: signedUrl })
  } catch (error) {
    console.error("Get signed URL error:", error)
    return NextResponse.json({ error: "Failed to get signed URL" }, { status: 500 })
  }
}