import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/articles - List all articles
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const published = searchParams.get("published")
  const category = searchParams.get("category")
  const limit = searchParams.get("limit")

  let query = supabase
    .from("articles")
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `)
    .order("created_at", { ascending: false })

  if (published !== null) {
    query = query.eq("published", published === "true")
  }

  if (category) {
    query = query.eq("category_id", category)
  }

  if (limit) {
    query = query.limit(parseInt(limit))
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const articles = (data || []).map((article: any) => ({
    ...article,
    tags: article.tags?.map((t: any) => t.tag) || [],
  }))

  return NextResponse.json(articles)
}

// POST /api/articles - Create article
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { title, slug, excerpt, content, cover_image, category_id, published } = body

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "title, slug, and content are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("articles")
      .insert({
        title,
        slug,
        excerpt,
        content,
        cover_image,
        category_id,
        published: published ?? false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}