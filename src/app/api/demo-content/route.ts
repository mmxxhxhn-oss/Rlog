import { NextRequest, NextResponse } from "next/server"
import { getStorageClient } from "@/lib/storage"
import { GetObjectCommand } from "@aws-sdk/client-s3"

// GET /api/demo-content?key=xxx - Get HTML content for demo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (!key) {
      return NextResponse.json({ error: "No key provided" }, { status: 400 })
    }

    const client = getStorageClient()
    const config = {
      bucket: process.env.STORAGE_BUCKET!,
    }

    // Get object directly from S3
    const response = await client.send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: decodeURIComponent(key),
      })
    )

    // Convert stream to string
    const stream = response.Body
    if (!stream) {
      return NextResponse.json({ error: "Empty body" }, { status: 500 })
    }

    const html = await stream.transformToString()

    // Return content directly without Content-Disposition
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Demo content error:", error)
    return NextResponse.json({ error: "Failed to get demo content" }, { status: 500 })
  }
}