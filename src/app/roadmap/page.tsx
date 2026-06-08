import Link from "next/link"
import { Clock, BookOpen, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getLearningPaths } from "@/lib/db"
import type { CategoryColor } from "@/types"
import { cn } from "@/lib/utils"

const colorMap: Record<CategoryColor, { gradient: string; badge: string }> = {
  blue: { gradient: "from-blue-500 to-blue-600", badge: "bg-blue-50 text-blue-600" },
  green: { gradient: "from-green-500 to-green-600", badge: "bg-green-50 text-green-600" },
  emerald: { gradient: "from-emerald-500 to-emerald-600", badge: "bg-emerald-50 text-emerald-600" },
  red: { gradient: "from-red-500 to-red-600", badge: "bg-red-50 text-red-600" },
  orange: { gradient: "from-orange-500 to-orange-600", badge: "bg-orange-50 text-orange-600" },
  cyan: { gradient: "from-cyan-500 to-cyan-600", badge: "bg-cyan-50 text-cyan-600" },
  purple: { gradient: "from-purple-500 to-purple-600", badge: "bg-purple-50 text-purple-600" },
  pink: { gradient: "from-pink-500 to-pink-600", badge: "bg-pink-50 text-pink-600" },
  indigo: { gradient: "from-indigo-500 to-indigo-600", badge: "bg-indigo-50 text-indigo-600" },
}

export default async function RoadmapPage() {
  const learningPaths = await getLearningPaths()

  return (
    <div className="px-6 lg:px-8 pt-8 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-semibold mb-2">学习路线</h1>
          <p className="text-muted-foreground">系统化的技术学习路径，循序渐进掌握核心知识</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths.map((path) => {
            const colors = colorMap[path.color as CategoryColor] || colorMap.blue
            const chapterCount = path.chapters?.length || 0
            const completedCount = path.chapters?.filter(c => c.article_id).length || 0
            const progress = chapterCount > 0 ? Math.round((completedCount / chapterCount) * 100) : 0

            return (
              <Link key={path.id} href={`/roadmap/${path.id}`}>
                <Card className="h-full overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
                  <div className={cn("h-1.5 bg-gradient-to-r", colors.gradient)} />
                  <CardHeader className="p-6 pb-3">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="secondary" className={cn("text-xs font-medium", colors.badge)}>
                        {path.category?.name}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {path.total_time}
                      </div>
                    </div>
                    <h3 className="font-medium text-lg group-hover:text-blue-600 transition-colors">
                      {path.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {path.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">学习进度</span>
                        <span className={colors.badge.replace("bg-", "text-").replace("-50", "-600")}>
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={cn("h-full bg-gradient-to-r transition-all", colors.gradient)}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {chapterCount} 章节
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          {completedCount} 已完成
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}