import Link from "next/link"
import { Calendar, FileText } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getArticles } from "@/lib/db"

export default async function ArchivePage() {
  const articles = await getArticles({ published: true })

  // Group by year and month
  const grouped = articles.reduce((acc, article) => {
    const date = new Date(article.created_at)
    const year = date.getFullYear().toString()
    const month = date.toLocaleDateString("zh-CN", { month: "long" })

    if (!acc[year]) acc[year] = {}
    if (!acc[year][month]) acc[year][month] = []
    acc[year][month].push(article)
    return acc
  }, {} as Record<string, Record<string, typeof articles>>)

  return (
    <div className="px-6 lg:px-8 pt-8 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-semibold mb-2">归档</h1>
          <p className="text-muted-foreground">按时间浏览技术文章</p>
        </div>

        <div className="space-y-8">
          {Object.entries(grouped)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, months]) => (
              <div key={year}>
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-semibold">{year}</h2>
                </div>

                <div className="space-y-6">
                  {Object.entries(months)
                    .sort(([a], [b]) => {
                      const monthOrder = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
                      return monthOrder.indexOf(b) - monthOrder.indexOf(a)
                    })
                    .map(([month, monthArticles]) => (
                      <Card key={month}>
                        <CardHeader className="bg-muted/50 py-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{month}</h3>
                            <span className="text-sm text-muted-foreground">
                              {monthArticles.length} 篇文章
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-border">
                            {monthArticles.map((article) => (
                              <Link
                                key={article.id}
                                href={`/articles/${article.slug}`}
                                className="flex items-center justify-between px-6 py-4 hover:bg-accent transition-colors group"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                  <div className="min-w-0">
                                    <h4 className="text-foreground group-hover:text-blue-600 transition-colors">
                                      {article.title}
                                    </h4>
                                    <span className="text-sm text-muted-foreground">
                                      {article.category?.name}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-sm text-muted-foreground flex-shrink-0 ml-4">
                                  {article.created_at.split("T")[0]}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}