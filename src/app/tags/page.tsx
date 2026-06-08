import { Tag as TagIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getTags } from "@/lib/db"
import type { CategoryColor } from "@/types"
import { cn } from "@/lib/utils"

const colorMap: Record<CategoryColor, string> = {
  blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  green: "bg-green-50 text-green-600 hover:bg-green-100",
  emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
  red: "bg-red-50 text-red-600 hover:bg-red-100",
  orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
  cyan: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100",
  purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  pink: "bg-pink-50 text-pink-600 hover:bg-pink-100",
  indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
}

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <div className="px-6 lg:px-8 pt-8 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-semibold mb-2">标签</h1>
          <p className="text-muted-foreground">按标签浏览技术文章</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => {
                const colorClass = colorMap[tag.color as CategoryColor] || colorMap.blue
                const size = Math.min(Math.max((tag.count || 0) / 2, 14), 24)

                return (
                  <button
                    key={tag.id}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                      colorClass
                    )}
                    style={{ fontSize: `${size}px` }}
                  >
                    <TagIcon className="w-4 h-4" />
                    {tag.name}
                    <span className="text-xs opacity-75">({tag.count})</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}