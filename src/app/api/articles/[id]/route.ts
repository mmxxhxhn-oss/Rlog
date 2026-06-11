import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/articles/[id] - Get single article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `)
    .eq("id", id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 })
  }

  return NextResponse.json({
    ...data,
    tags: data.tags?.map((t: any) => t.tag) || [],
  })
}

// PUT /api/articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, excerpt, content, cover_image, category_id, published, tags } = body

    // Check ownership
    const { data: existing } = await supabase
      .from("articles")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    if (existing.user_id && existing.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update article
    const { data, error } = await supabase
      .from("articles")
      .update({
        title,
        slug,
        excerpt,
        content,
        cover_image,
        category_id,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update tags if provided
    if (tags !== undefined) {
      // Delete existing tags
      await supabase.from("article_tags").delete().eq("article_id", id)

      // Insert new tags (filter out temp IDs)
      const realTags = tags.filter((tagId: string) => !tagId.startsWith("temp-"))
      if (realTags.length > 0) {
        const tagInserts = realTags.map((tagId: string) => ({
          article_id: id,
          tag_id: tagId,
        }))
        await supabase.from("article_tags").insert(tagInserts)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Update article error:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

// DELETE /api/articles/[id] - Soft delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("DELETE article:", id)
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log("User:", user?.id)

    if (!user) {
      console.log("No user - returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check article exists
    const { data: existing, error: selectError } = await supabase
      .from("articles")
      .select("user_id")
      .eq("id", id)
      .single()
    console.log("Existing article:", existing, "Select error:", selectError)

    if (selectError || !existing) {
      console.log("Article not found")
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    // Check ownership (skip if user_id is null)
    if (existing.user_id && existing.user_id !== user.id) {
      console.log("Forbidden - user_id mismatch")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Soft delete - use update with deleted_at timestamp
    const { error: updateError } = await supabase
      .from("articles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
    console.log("Update error:", updateError)

    if (updateError) {
      console.log("Update failed with error:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log("Delete successful")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete article error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}