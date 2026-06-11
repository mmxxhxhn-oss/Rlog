"use client"

import { use, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Upload, X, Loader2, Box, ImagePlus, Check, Tag as TagIcon, XCircle } from "lucide-react"
import type { Category, Tag } from "@/lib/db"

// 动态导入 MD 编辑器，避免 SSR 问题
const MdEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-[600px] bg-muted/50 rounded-lg animate-pulse" /> }
)

export default function EditorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = use(searchParams)
  const router = useRouter()
  const { user, loading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [tagInput, setTagInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [published, setPublished] = useState(false)

  // Image upload modal
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imageModalData, setImageModalData] = useState<{ file: File } | null>(null)
  const [imageUploading, setImageUploading] = useState(false)

  // Demo insert modal
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const [demoIdInput, setDemoIdInput] = useState("")
  const [demoUploading, setDemoUploading] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!params.id

  // Check auth and load data
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(console.error)

    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTags(data)
      })
      .catch(console.error)

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
            if (data.tags) {
              setSelectedTags(data.tags.slice(0, 3))
            }
          }
        })
        .catch(console.error)
    }
  }, [user, loading, params.id, router])

  // Handle paste for images
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) continue

        // Upload image directly
        const formData = new FormData()
        formData.append("file", file)

        try {
          const res = await fetch("/api/upload", { method: "POST", body: formData })
          const data = await res.json()
          if (data.url) {
            const imageMd = `\n![${file.name}](${data.url})\n`
            setContent((prev) => prev + imageMd)
          }
        } catch (error) {
          console.error("Upload failed", error)
        }
        break
      }
    }
  }

  // Auto-generate slug from title and category
  useEffect(() => {
    if (!isEditing && title) {
      const categorySlug = categories.find(c => c.id === categoryId)?.slug || ""
      const titleSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-+|-+$/g, "")
      const finalSlug = categorySlug ? `${categorySlug}-${titleSlug}` : titleSlug
      if (!slug || slug !== finalSlug) {
        setSlug(finalSlug)
      }
    }
  }, [title, categoryId, categories, isEditing])

  // Handle category change to regenerate slug
  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId)
    if (!isEditing && title) {
      const categorySlug = categories.find(c => c.id === newCategoryId)?.slug || ""
      const titleSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setSlug(categorySlug ? `${categorySlug}-${titleSlug}` : titleSlug)
    }
  }

  // Handle image selection from toolbar
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageModalData({ file })
    setImageModalOpen(true)
  }

  // Upload image
  const handleImageUpload = async () => {
    if (!imageModalData) return
    setImageUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", imageModalData.file)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (data.url) {
        // Insert markdown image at cursor
        const imageMd = `\n![${imageModalData.file.name}](${data.url})\n`
        setContent((prev) => prev + imageMd)
        setImageModalOpen(false)
        setImageModalData(null)
      } else {
        alert(data.error || "上传失败")
      }
    } catch (error) {
      alert("上传失败")
    } finally {
      setImageUploading(false)
    }
  }

  // Cover image upload
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    fetch("/api/upload", { method: "POST", body: formData })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setCoverImage(data.url)
        } else {
          alert(data.error || "上传失败")
        }
      })
      .catch(() => alert("上传失败"))
  }

  // Insert Demo
  const handleInsertDemo = () => {
    if (!demoIdInput.trim()) {
      alert("请输入 Demo ID")
      return
    }
    const demoMd = `\n<Demo id="${demoIdInput.trim()}" />\n`
    setContent((prev) => prev + demoMd)
    setDemoIdInput("")
    setDemoModalOpen(false)
  }

  // Upload Demo file
  const [demoFile, setDemoFile] = useState<File | null>(null)
  const handleDemoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setDemoFile(file)
    setDemoUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (data.url) {
        // Insert demo with key as id and src as url
        const demoMd = `\n<Demo id="${data.key}" src="${data.url}" />\n`
        setContent((prev) => prev + demoMd)
        setDemoModalOpen(false)
        setDemoFile(null)
      } else {
        alert(data.error || "上传失败")
      }
    } catch (error) {
      alert("上传失败")
    } finally {
      setDemoUploading(false)
    }
  }

  // Handle tag input
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      const existingTag = tags.find(t => t.name.toLowerCase() === tagInput.toLowerCase())
      if (existingTag && !selectedTags.find(t => t.id === existingTag.id) && selectedTags.length < 3) {
        setSelectedTags([...selectedTags, existingTag])
      } else if (!existingTag && selectedTags.length < 3) {
        // Create new tag locally (will be created on save if needed)
        const newTag: Tag = { id: `temp-${Date.now()}`, name: tagInput.trim(), slug: tagInput.trim().toLowerCase().replace(/\s+/g, "-") }
        setSelectedTags([...selectedTags, newTag])
      }
      setTagInput("")
    }
  }

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tagId))
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
      published: saveAsDraft ? false : true,
      tags: selectedTags.map(t => t.id),
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
        alert(data.error || "保存失败")
        return
      }

      router.push(`/articles/${data.slug}`)
    } catch (error) {
      alert("保存失败")
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/articles" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">标题</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="输入文章标题" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="article-url-slug" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">摘要</Label>
                <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="文章摘要" rows={2} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Select value={categoryId} onValueChange={handleCategoryChange}>
                    <SelectTrigger><SelectValue placeholder="选择分类" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>封面图片</Label>
                  <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                  {coverImage ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        更换封面
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full h-32" onClick={() => coverInputRef.current?.click()}>
                      <ImagePlus className="w-6 h-6 mr-2" />
                      上传封面图片
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>标签（按回车添加，最多3个）</Label>
                <div className="flex flex-wrap gap-2 p-3 border border-input rounded-lg bg-background">
                  {selectedTags.map((tag) => (
                    <span key={tag.id} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                      <TagIcon className="w-3 h-3" />
                      {tag.name}
                      <button type="button" onClick={() => removeTag(tag.id)} className="ml-1 hover:text-destructive">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedTags.length < 3 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="输入标签名后按回车"
                      className="flex-1 min-w-[150px] bg-transparent outline-none text-sm"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MD Editor */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>文章内容</CardTitle>
              <div className="flex items-center gap-2">
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <Button variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
                  <ImagePlus className="w-4 h-4 mr-2" />
                  插入图片
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDemoModalOpen(true)}>
                  <Box className="w-4 h-4 mr-2" />
                  插入 Demo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div data-color-mode="light" className="md-editor-wrapper" onPaste={handlePaste}>
                <MdEditor
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  height="500px"
                  preview="live"
                  style={{ padding: "16px" }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Upload Modal */}
      {imageModalOpen && imageModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>上传图片</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setImageModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={URL.createObjectURL(imageModalData.file)} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium">{imageModalData.file.name}</p>
                  <p className="text-sm text-muted-foreground">{(imageModalData.file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setImageModalOpen(false)}>取消</Button>
                <Button className="flex-1" onClick={handleImageUpload} disabled={imageUploading}>
                  {imageUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />上传中...</> : <><Upload className="w-4 h-4 mr-2" />上传</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Demo Insert Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>插入 Demo</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setDemoModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demoId">Demo ID</Label>
                <Input
                  id="demoId"
                  value={demoIdInput}
                  onChange={(e) => setDemoIdInput(e.target.value)}
                  placeholder="输入已有的 Demo ID"
                />
                <p className="text-xs text-muted-foreground">使用已有的 Demo ID，如: jvm-memory, classloader</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setDemoModalOpen(false)}>取消</Button>
                <Button
                  className="flex-1"
                  onClick={handleInsertDemo}
                  disabled={!demoIdInput.trim()}
                >
                  插入
                </Button>
              </div>
              <div className="relative">
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={demoUploading}
                >
                  {demoUploading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />上传中...</>
                  ) : demoFile ? (
                    <><Check className="w-4 h-4 mr-2" />已选择: {demoFile.name}</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" />上传 HTML 文件创建新 Demo</>
                  )}
                </Button>
                <input
                  type="file"
                  accept=".html"
                  onChange={handleDemoFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}