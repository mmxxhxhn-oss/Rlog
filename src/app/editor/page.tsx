"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Upload, X } from "lucide-react"
import type { Category, Article } from "@/lib/db"

export default function EditorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = use(searchParams)
  const router = useRouter()
  const { user, loading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [published, setPublished] = useState(false)

  const isEditing = !!params.id

  // Check auth and load data
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    // Load categories
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data)
        }
      })
      .catch(console.error)

    // Load article if editing
    if (params.id) {
      fetch(`/api/articles/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setTitle(data.title || "")
            setSlug(data.slug || "")
            setExcerpt(data.excerpt || "")
            setContent(data.content || "")
            setCoverImage(data.cover_image || "")
            setCategoryId(data.category_id || "")
            setPublished(data.published || false)
          }
        })
        .catch(console.error)
    }
  }, [user, loading, params.id, router])

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title && !slug) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setSlug(generated)
    }
  }, [title, isEditing])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (data.url) {
        // Insert image URL at cursor position or append
        const imageMd = `![${file.name}](${data.url})`
        setContent((prev) => prev + "\n" + imageMd)
      } else {
        alert(data.error || "Upload failed")
      }
    } catch (error) {
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault()
    setSaving(true)

    const articleData = {
      title,
      slug,
      excerpt,
      content,
      cover_image: coverImage || null,
      category_id: categoryId || null,
      published: saveAsDraft ? false : published,
    }

    try {
      const url = isEditing ? `/api/articles/${params.id}` : "/api/articles"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articleData),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Save failed")
        return
      }

      router.push(`/articles/${data.slug}`)
    } catch (error) {
      alert("Save failed")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/articles"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Link>
            <h1 className="text-xl font-semibold">{isEditing ? "编辑文章" : "新建文章"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={(e) => handleSubmit(e, true)} disabled={saving}>
              保存草稿
            </Button>
            <Button onClick={(e) => handleSubmit(e, false)} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "保存中..." : "发布"}
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入文章标题"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="article-url-slug"
                />
                <p className="text-xs text-muted-foreground">
                  用于生成文章 URL: /articles/[slug]
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">摘要</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="文章摘要（可选）"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover">封面图片 URL</Label>
                  <Input
                    id="cover"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="published" className="cursor-pointer">
                  发布文章（取消勾选则为草稿）
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>文章内容 (MDX)</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "上传中..." : "上传图片"}
                    </span>
                  </Button>
                </Label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="使用 Markdown 编写文章内容..."
                className="min-h-[500px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                支持 Markdown 语法。图片会上传到 R2 并替换为 URL。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}