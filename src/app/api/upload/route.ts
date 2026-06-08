import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { uploadToR2 } from "@/lib/r2"

// GET /api/upload - Check auth status
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

// POST /api/upload - Upload image to R2
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

    // Upload to R2
    const result = await uploadToR2(file, file.name, file.type, {
      folder: "images",
    })

    return NextResponse.json({
      url: result.url,
      key: result.key,
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