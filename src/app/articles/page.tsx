import { getCategories, getArticles } from "@/lib/db"
import { ArticlesClient } from "./ArticlesClient"

export default async function ArticlesPage() {
  const [categories, articles] = await Promise.all([
    getCategories(),
    getArticles({ published: true }),
  ])

  return<ArticlesClient categories={categories} articles={articles} />
}