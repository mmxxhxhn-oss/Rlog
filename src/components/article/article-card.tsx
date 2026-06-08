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

  return (
    <Link href={`/articles/${article.slug}`}>
      <Card className="h-full overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="secondary"
              className={cn("text-xs font-medium", colorClass)}
            >
              {article.category?.name || "未分类"}
            </Badge>
          </div>
          <h3 className="font-medium text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {article.excerpt}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
              >
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