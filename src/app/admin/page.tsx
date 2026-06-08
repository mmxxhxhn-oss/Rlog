import Link from "next/link"
import { FileText, Plus, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from("articles")
    .select(`
      *,
      category:categories(name)
    `)
    .order("created_at", { ascending: false })

  const { data: stats } = await Promise.all([
    supabase.from("articles").select("id", { count: "exact" }),
    supabase.from("categories").select("id", { count: "exact" }),
  ])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">仪表盘</h1>
        <Link href="/admin/articles/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            新建文章
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              文章总数
            </CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.[0]?.count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              分类总数
            </CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.[1]?.count || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>最近文章</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>浏览</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles?.map((article: any) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {article.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {article.category?.name || "未分类"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={article.published ? "default" : "outline"}>
                      {article.published ? "已发布" : "草稿"}
                    </Badge>
                  </TableCell>
                  <TableCell>{article.views || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/articles/${article.slug}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/articles/${article.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}