import Link from "next/link"
import { Clock, Eye, Tag as TagIcon } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Article } from "@/lib/db"
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

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const colorClass = article.category?.color
    ? colorMap[article.category.color as CategoryColor] || colorMap.blue
    : colorMap.blue

  const formatDate = (date: string) => {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  // Card with cover image on left
  if (article.cover_image) {
    return (
      <Link href={`/articles/${article.slug}`}>
        <Card className="h-full overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 group flex flex-row">
          <div className="w-48 h-full min-h-[160px] flex-shrink-0">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <CardHeader className="p-4 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className={cn("text-xs font-medium", colorClass)}>
                  {article.category?.name || "未分类"}
                </Badge>
              </div>
              <h3 className="font-medium text-base leading-snug group-hover:text-blue-600 transition-colors truncate">
                {article.title}
              </h3>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 truncate">
                {article.excerpt || "暂无摘要"}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {article.tags?.slice(0, 3).map((tag) => (
                  <span key={tag.id} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    <TagIcon className="w-3 h-3" />
                    {tag.name}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.reading_time} 分钟
                </span>
                <span className="flex items-center gap-1">
                  {formatDate(article.created_at)}
                </span>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    )
  }

  // Card without cover image - original layout with fixed positions
  return (
    <Link href={`/articles/${article.slug}`}>
      <Card className="h-full overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className={cn("text-xs font-medium", colorClass)}>
              {article.category?.name || "未分类"}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              {formatDate(article.created_at)}
            </span>
          </div>
          <h3 className="font-medium text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 truncate">
            {article.excerpt || "暂无摘要"}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags?.slice(0, 3).map((tag) => (
              <span key={tag.id} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                <TagIcon className="w-3 h-3" />
                {tag.name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.reading_time} 分钟
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}