"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PreviewArticle {
  title: string
  content: string
  excerpt?: string
}

// Process content to handle Demo component with src support
function processContent(content: string): string[] {
  return content
    .replace(
      /<Demo\s+id="([^"]+)"(?:\s+src="([^"]+)")?(?:\s+title="([^"]+)")?\s*\/>/g,
      (_, demoId, src, title) => `:::demo{${demoId}|${src || ""}|${title || ""}}:::`
    )
    .split(/:::demo\{([^}]+)\}:::/g)
}

function PreviewDemo({ demoId, src, title }: { demoId: string; src: string; title: string }) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!src) return

    // Extract key from /api/demos/xxx format
    const match = src.match(/^\/api\/demos\/(.+)$/)
    if (match) {
      const key = match[1]
      fetch(`/api/demo-content?key=${encodeURIComponent(key)}`)
        .then((res) => res.text())
        .then((html) => {
          setIframeUrl("data:text/html;charset=utf-8," + encodeURIComponent(html))
        })
        .catch(console.error)
    } else {
      setIframeUrl(src)
    }
  }, [src])

  if (!iframeUrl) {
    return (
      <div className="my-6 p-4 bg-muted rounded-lg text-muted-foreground text-sm">
        加载中...
      </div>
    )
  }

  return (
    <div className="my-6 rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm font-medium ml-2">{title || demoId}</span>
        </div>
      </div>
      <div className="aspect-video bg-white">
        <iframe src={iframeUrl} className="w-full h-full" title={title || demoId} sandbox="allow-scripts allow-same-origin" />
      </div>
    </div>
  )
}

export default function PreviewPage() {
  const [article, setArticle] = useState<PreviewArticle | null>(null)

  useEffect(() => {
    const data = localStorage.getItem("preview-article")
    if (data) {
      setArticle(JSON.parse(data))
    }
  }, [])

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">没有找到预览内容</p>
          <Link href="/editor">
            <Button>返回编辑器</Button>
          </Link>
        </div>
      </div>
    )
  }

  const parts = processContent(article.content)

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/editor"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            返回编辑器
          </Link>
          <div className="text-sm text-muted-foreground">预览模式</div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-8 py-8">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-semibold mb-4">{article.title}</h1>
            {article.excerpt && (
              <p className="text-lg text-muted-foreground">{article.excerpt}</p>
            )}
          </header>

          <div className="prose-content">
            {parts.map((part, index) => {
              if (index % 4 === 0) {
                return (
                  <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
                    {part}
                  </ReactMarkdown>
                )
              }

              // Parse demo: demoId|src|title
              const [demoId, src, title] = part.split("|")
              if (src) {
                return (
                  <PreviewDemo
                    key={`demo-${index}`}
                    demoId={demoId}
                    src={src}
                    title={title}
                  />
                )
              }

              return (
                <div key={`demo-${index}`} className="my-8 p-4 bg-muted rounded-lg text-muted-foreground text-sm">
                  Demo "{demoId}" not found
                </div>
              )
            })}
          </div>
        </article>
      </div>
    </div>
  )
}