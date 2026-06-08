import { createClient } from "@/lib/supabase/server"

export interface Category {
  id: string
  name: string
  slug: string
  color: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  color: string
  count?: number
  created_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  category_id: string | null
  views: number
  reading_time: number
  published: boolean
  created_at: string
  updated_at: string
  category?: Category
  tags?: Tag[]
}

export interface LearningPath {
  id: string
  title: string
  description: string | null
  category_id: string | null
  total_time: string | null
  color: string
  created_at: string
  category?: Category
  chapters?: Chapter[]
}

export interface Chapter {
  id: string
  path_id: string
  title: string
  content: string | null
  article_id: string | null
  sort_order: number
  created_at: string
  article?: Article
}

export interface Project {
  id: string
  name: string
  description: string | null
  repo_url: string | null
  demo_url: string | null
  tags: string[]
  stars: number
  forks?: number
  created_at: string
}

export interface Demo {
  id: string
  title: string
  description: string | null
  demo_type: string
  icon?: string
  content: string | null
  category_id: string | null
  created_at: string
  category?: Category
}

export interface TechFeed {
  id: string
  content: string | null
  code_snippet: string | null
  likes: number
  created_at: string
}

// ============ Categories ============

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }
  return data || []
}

// ============ Tags ============

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("count", { ascending: false })

  if (error) {
    console.error("Error fetching tags:", error)
    return []
  }
  return data || []
}

// ============ Articles ============

export async function getArticles(options?: {
  published?: boolean
  limit?: number
}): Promise<Article[]> {
  const supabase = await createClient()

  let query = supabase
    .from("articles")
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `)
    .is("deleted_at", null) // Filter out soft-deleted articles
    .order("created_at", { ascending: false })

  if (options?.published !== undefined) {
    query = query.eq("published", options.published)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching articles:", error)
    return []
  }

  // Transform to flatten tags
  const articles = (data || []).map((article: any) => ({
    ...article,
    tags: article.tags?.map((t: any) => t.tag) || [],
  }))

  return articles
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `)
    .eq("slug", slug)
    .single()

  if (error) {
    console.error("Error fetching article:", error)
    return null
  }

  return data ? {
    ...data,
    tags: data.tags?.map((t: any) => t.tag) || [],
  } : null
}

export async function getArticlesByCategory(categorySlug: string): Promise<Article[]> {
  const supabase = await createClient()

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single()

  if (!category) return []

  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `)
    .eq("category_id", category.id)
    .eq("published", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching articles by category:", error)
    return []
  }

  return (data || []).map((article: any) => ({
    ...article,
    tags: article.tags?.map((t: any) => t.tag) || [],
  }))
}

// ============ Learning Paths ============

export async function getLearningPaths(): Promise<LearningPath[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("learning_paths")
    .select(`
      *,
      category:categories(*),
      chapters(*)
    `)
    .order("created_at")

  if (error) {
    console.error("Error fetching learning paths:", error)
    return []
  }

  // Sort chapters by sort_order
  return (data || []).map((path: any) => ({
    ...path,
    chapters: path.chapters?.sort((a: Chapter, b: Chapter) => a.sort_order - b.sort_order) || [],
  }))
}

// ============ Projects ============

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("stars", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }
  return data || []
}

// ============ Demos ============

export async function getDemos(): Promise<Demo[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("demos")
    .select(`
      *,
      category:categories(*)
    `)
    .order("created_at")

  if (error) {
    console.error("Error fetching demos:", error)
    return []
  }
  return data || []
}

// ============ Tech Feed ============

export async function getTechFeed(): Promise<TechFeed[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tech_feed")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tech feed:", error)
    return []
  }
  return data || []
}

// ============ Stats ============

export async function getStats() {
  const supabase = await createClient()

  const [articlesCount, demosCount, pathsCount] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact" }).eq("published", true),
    supabase.from("demos").select("id", { count: "exact" }),
    supabase.from("learning_paths").select("id", { count: "exact" }),
  ])

  return {
    articlesCount: articlesCount.count || 0,
    demosCount: demosCount.count || 0,
    pathsCount: pathsCount.count || 0,
  }
}