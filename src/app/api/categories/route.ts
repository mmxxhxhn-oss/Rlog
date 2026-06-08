import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/categories - List all categories
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}