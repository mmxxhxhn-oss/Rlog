import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Eye, Tag as TagIcon, Share2, Bookmark, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArticleCard, ArticleContent } from "@/components/article"
import { getArticleBySlug, getArticles, getDemos } from "@/lib/db"
import type { CategoryColor } from "@/types"
import { cn } from "@/lib/utils"

const colorMap: Record<CategoryColor, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  emerald: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
  orange: "bg-orange-50 text-orange-600",
  cyan: "bg-cyan-50 text-cyan-600",
  purple: "bg-purple-50 text-purple-600",
  pink: "bg-pink-50 text-pink-600",
  indigo: "bg-indigo-50 text-indigo-600",
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) {
    return { title: "文章未找到" }
  }
  return {
    title: article.title,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      type: "article",
    },
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [article, allArticles, demos] = await Promise.all([
    getArticleBySlug(slug),
    getArticles({ published: true }),
    getDemos(),
  ])

  if (!article) {
    notFound()
  }
  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id && a.category_id === article.category_id)
    .slice(0, 3)

  const colorClass = article.category?.color
    ? colorMap[article.category.color as CategoryColor] || colorMap.blue
    : colorMap.blue

  return (
    <div className="px-6 lg:px-8 pt-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回文章列表
        </Link>

        <div className="grid lg:grid-cols-[1fr_280px] gap-12">
          {/* Article Content */}
          <article>
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className={cn("text-sm font-medium", colorClass)}>
                  {article.category?.name || "未分类"}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {article.created_at.split("T")[0]}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  {article.views.toLocaleString()}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-semibold mb-4 leading-tight">
                {article.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                {article.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                  >
                    <TagIcon className="w-3 h-3" />
                    {tag.name}
                  </span>
                ))}
              </div>
            </header>

            <ArticleContent content={article.content} demos={demos} />

            {/* Actions */}
            <div className="flex items-center gap-3 mt-12 pt-8 border-t border-border">
              <Button className="gap-2">
                <ThumbsUp className="w-4 h-4" />
                点赞 (128)
              </Button>
              <Button variant="outline" className="gap-2">
                <Bookmark className="w-4 h-4" />
                收藏
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                分享
              </Button>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                    相关文章
                  </h3>
                  <div className="space-y-3">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.id}
                        href={`/articles/${related.slug}`}
                        className="block p-3 bg-muted rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          {related.category?.name}
                        </div>
                        <div className="text-sm font-medium">{related.title}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}