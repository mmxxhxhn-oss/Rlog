import Link from "next/link"
import { Clock, Eye, Tag as TagIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Article } from "@/lib/db"

// Placeholder icon SVG (simple document icon)
const PlaceholderIcon = () => (
  <svg className="w-8 h-8 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

export function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (date: string) => {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  return (
    <Link href={`/articles/${article.slug}`}>
      <Card className="h-full overflow-hidden border border-border/50 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group p-4 bg-background rounded-xl">
        {/* Row 1: Title */}
        <h3 className="font-semibold text-base leading-5 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1 overflow-hidden">
          {article.title}
        </h3>

        {/* Row 2: Image + Excerpt */}
        <div className="flex gap-3 mb-2 h-16">
          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
            {article.cover_image ? (
              <img src={article.cover_image} alt="" className="w-full h-full object-cover" />
            ) : (
              <PlaceholderIcon />
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-5 line-clamp-2 flex-1 overflow-hidden">
            {article.excerpt || "暂无摘要"}
          </p>
        </div>

        {/* Row 3: Tags */}
        <div className="flex gap-2 mb-2 h-5 overflow-hidden">
          {article.tags?.slice(0, 3).map((tag) => (
            <span key={tag.id} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded whitespace-nowrap">
              <TagIcon className="w-3 h-3" />
              {tag.name}
            </span>
          ))}
        </div>

        {/* Row 4: Stats + Date */}
        <div className="flex items-center justify-between h-5">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Eye className="w-3 h-3" />
              {article.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-3 h-3" />
              {article.reading_time} 分钟
            </span>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(article.created_at)}
          </span>
        </div>
      </Card>
    </Link>
  )
}