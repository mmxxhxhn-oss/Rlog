import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { uploadToStorage, getSignedUrlForKey } from "@/lib/storage"

// POST /api/upload - Upload file to storage
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Determine folder based on file type
    const isHtml = file.type === "text/html" || file.name.endsWith(".html")
    const folder = isHtml ? "demos" : "images"
    // Force correct content type for HTML files
    const contentType = isHtml ? "text/html" : file.type
    const allowedTypes = isHtml ? ["text/html"] : [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ]

    // Upload to storage
    const result = await uploadToStorage(file, file.name, contentType, {
      folder,
      allowedTypes,
    })

    // For demos, return proxy path (will generate signed URL on access)
    const url = isHtml
      ? `/api/demos/${encodeURIComponent(result.key)}`
      : `/api/image/${encodeURIComponent(result.key)}`

    return NextResponse.json({
      key: result.key,
      url,
      size: result.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}