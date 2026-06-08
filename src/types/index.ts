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

export interface Profile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  role: string
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  category_id: string | null
  user_id: string | null
  views: number
  reading_time: number
  published: boolean
  deleted_at: string | null
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
  demo_type: "iframe" | "html" | "revealjs" | "canvas"
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
  image_url: string | null
  likes: number
  user_id: string | null
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

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface UploadResult {
  url: string
  key: string
  size: number
}