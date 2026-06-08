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
  category?: Category
  tags?: Tag[]
  views: number
  reading_time: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface LearningPath {
  id: string
  title: string
  description: string | null
  category_id: string | null
  category?: Category
  total_time: string | null
  color: string
  chapters?: Chapter[]
  created_at: string
}

export interface Chapter {
  id: string
  path_id: string
  title: string
  content: string | null
  article_id: string | null
  article?: Article
  sort_order: number
  created_at: string
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
  demo_type: "iframe" | "html" | "revealjs" | "canvas"
  icon?: string
  content: string | null
  category_id: string | null
  category?: Category
  created_at: string
}

export interface TechFeed {
  id: string
  content: string | null
  code_snippet: string | null
  likes: number
  created_at: string
}

export type CategoryColor =
  | "blue"
  | "green"
  | "emerald"
  | "red"
  | "orange"
  | "cyan"
  | "purple"
  | "pink"
  | "indigo"