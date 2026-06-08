"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ContextMenu, KebabMenu, type ContextMenuItem } from "@/components/ui/context-menu"
import { ArticleCard } from "@/components/article"
import { useAuth } from "@/lib/auth"
import type { Category, Article } from "@/lib/db"
import type { CategoryColor } from "@/types"
import { Plus } from "lucide-react"
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

interface ArticlesClientProps {
  categories: Category[]
  articles: Article[]
}

export function ArticlesClient({ categories, articles }: ArticlesClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === "all" || article.category?.slug === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Context menu items for the page (shown on right-click anywhere)
  const pageContextItems: ContextMenuItem[] = user
    ? [
        {
          label: "新建文章",
          icon: <Plus className="w-4 h-4" />,
          onClick: () => router.push("/editor"),
        },
      ]
    : []

  return (
    <ContextMenu items={pageContextItems}>
      <div className="px-6 lg:px-8 pt-8 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-semibold mb-2">技术文章</h1>
              <p className="text-muted-foreground">深入底层原理，探索技术本质</p>
            </div>
            {user && (
              <Button onClick={() => router.push("/editor")} className="gap-2">
                <Plus className="w-4 h-4" />
                新建文章
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Input
              type="text"
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              全部
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.slug}
                variant={selectedCategory === cat.slug ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn(
                  selectedCategory !== cat.slug && colorMap[cat.color as CategoryColor]
                )}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCardWrapper key={article.id} article={article} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>没有找到匹配的文章</p>
            </div>
          )}
        </div>
      </div>
    </ContextMenu>
  )
}

// Wrapper for individual article cards with context menu
function ArticleCardWrapper({ article, user }: { article: Article; user: any }) {
  const router = useRouter()

  const cardContextItems: ContextMenuItem[] = user
    ? [
        {
          label: "编辑文章",
          icon: <span>✏️</span>,
          onClick: () => router.push(`/editor?id=${article.id}`),
        },
        {
          label: "删除文章",
          icon: <span>🗑️</span>,
          onClick: async () => {
            if (confirm(`确定要删除文章 "${article.title}" 吗？`)) {
              await fetch(`/api/articles/${article.id}`, { method: "DELETE" })
              window.location.reload()
            }
          },
          danger: true,
        },
      ]
    : []

  return (
    <ContextMenu items={cardContextItems}>
      <ArticleCard article={article} />
    </ContextMenu>
  )
}