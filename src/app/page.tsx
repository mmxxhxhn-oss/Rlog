import Link from "next/link"
import { ArrowRight, BookOpen, Code2, Rocket, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArticleCard } from "@/components/article"
import { getArticles, getStats } from "@/lib/db"

export default async function HomePage() {
  const [featuredArticles, stats] = await Promise.all([
    getArticles({ published: true, limit: 6 }),
    getStats(),
  ])

  const statsData = [
    { label: "技术文章", value: stats.articlesCount, icon: BookOpen },
    { label: "代码示例", value: stats.demosCount, icon: Code2 },
    { label: "学习路线", value: stats.pathsCount, icon: Rocket },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                个人技术知识平台
              </div>
              <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight mb-4 leading-tight">
                记录源码，沉淀技术
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  构建我的技术知识库
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                专注 JVM、Spring、OpenJDK 等底层原理与实践总结
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/articles">
                    开始阅读
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/roadmap">查看学习路线</Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-3xl blur-3xl" />
              <div className="relative bg-muted rounded-3xl p-8 border border-border">
                <div className="space-y-4">
                  {[
                    { icon: Code2, label: "JVM 类加载机制", color: "bg-blue-100 text-blue-600" },
                    { icon: BookOpen, label: "Spring Boot 自动配置", color: "bg-green-100 text-green-600" },
                    { icon: Rocket, label: "Redis 持久化", color: "bg-purple-100 text-purple-600" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 bg-background rounded-xl border border-border"
                    >
                      <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-muted-foreground/20 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-muted-foreground/10 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16">
            {statsData.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="text-center p-6 bg-card rounded-xl border border-border"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-semibold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-semibold mb-1">精选文章</h2>
              <p className="text-muted-foreground">深入底层原理，探索技术本质</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/articles">
                查看全部
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}