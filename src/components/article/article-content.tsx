"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Maximize2, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Demo } from "@/lib/db"
import { cn } from "@/lib/utils"

interface ArticleDemoProps {
  demoId: string
  title?: string
  src?: string
  demos: Demo[]
}

function ArticleDemo({ demoId, title, src, demos }: ArticleDemoProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const demo = demos.find((d) => d.id === demoId || d.content === demoId)

  useEffect(() => {
    if (!src || src.trim() === "") return

    const match = src.match(/^\/api\/demos\/(.+)$/)
    if (match) {
      const key = match[1]
      fetch(`/api/demo-content?key=${encodeURIComponent(key)}`)
          .then((res) => res.text())
          .then((html) => {
            setIframeUrl("data:text/html;charset=utf-8," + encodeURIComponent(html))
          })
          .catch(console.error)
    } else if (src.startsWith("/api/demo-content")) {
      fetch(src)
          .then((res) => res.text())
          .then((html) => {
            setIframeUrl("data:text/html;charset=utf-8," + encodeURIComponent(html))
          })
          .catch(console.error)
    } else {
      setIframeUrl(src)
    }
  }, [src])

  if (src && src.trim() !== "") {
    if (!iframeUrl) {
      return (
          <div className="my-6 p-4 bg-muted rounded-lg text-muted-foreground text-sm">
            加载中...
          </div>
      )
    }

    return (
        <>
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
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(true)}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="aspect-video bg-white">
              <iframe src={iframeUrl} className="w-full h-full" title={title || demoId} sandbox="allow-scripts allow-same-origin" />
            </div>
          </div>

          {isExpanded && (
              <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center">
                <div className="absolute top-4 right-4">
                  <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <div className="w-full h-full max-w-6xl max-h-[90vh] m-4 bg-white rounded-xl border border-border overflow-hidden">
                  <iframe src={iframeUrl} className="w-full h-full" title={title || demoId} sandbox="allow-scripts allow-same-origin" />
                </div>
              </div>
          )}
        </>
    )
  }

  if (!demo) {
    return (
        <div className="my-6 p-4 bg-muted rounded-lg text-muted-foreground text-sm">
          Demo "{demoId}" not found
        </div>
    )
  }

  return (
      <>
        <div className="my-6 rounded-xl border border-border overflow-hidden">
          <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-sm font-medium ml-2">{title || demo.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(true)}>
                <Maximize2 className="w-4 h-4" />
              </Button>
              {demo.content && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={src || "#"} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
              )}
            </div>
          </div>
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center relative">
            {demo.content === "jvm-memory" && (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
                    <div className="bg-background rounded-lg p-3 shadow border-2 border-blue-300">
                      <div className="text-center text-xs font-medium text-blue-600 mb-2">栈 (Stack)</div>
                      <div className="space-y-2">
                        <div className="h-6 bg-blue-100 rounded" />
                        <div className="h-6 bg-blue-100 rounded" />
                        <div className="h-6 bg-blue-100 rounded" />
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-3 shadow border-2 border-green-300">
                      <div className="text-center text-xs font-medium text-green-600 mb-2">堆 (Heap)</div>
                      <div className="space-y-2">
                        <div className="h-8 bg-green-100 rounded" />
                        <div className="h-10 bg-green-100 rounded" />
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-3 shadow border-2 border-purple-300">
                      <div className="text-center text-xs font-medium text-purple-600 mb-2">方法区</div>
                      <div className="space-y-2">
                        <div className="h-7 bg-purple-100 rounded" />
                        <div className="h-7 bg-purple-100 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {demo.content === "classloader" && (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium">Bootstrap ClassLoader</div>
                    <div className="w-0.5 h-8 bg-blue-300" />
                    <div className="bg-blue-400 text-white px-6 py-3 rounded-lg font-medium">Extension ClassLoader</div>
                    <div className="w-0.5 h-8 bg-blue-200" />
                    <div className="bg-blue-300 text-white px-6 py-3 rounded-lg font-medium">Application ClassLoader</div>
                  </div>
                </div>
            )}
          </div>
        </div>

        {isExpanded && (
            <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center">
              <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="w-full h-full max-w-6xl max-h-[80vh] m-8 bg-muted rounded-xl border border-border overflow-hidden">
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">全屏演示区域</p>
                </div>
              </div>
            </div>
        )}
      </>
  )
}

interface ArticleContentProps {
  content: string
  demos: Demo[]
}

function processContent(content: string): string {
  return content
      .replace(
          /<Demo\s+id="([^"]+)"(?:\s+src="([^"]+)")?(?:\s+title="([^"]+)")?\s*\/>/g,
          (_, demoId, src, title) => `:::article-demo{${demoId}|${src || ""}|${title || ""}}:::`
      )
      .replace(
          /<Demo\s+id="([^"]+)"\s*\/>/g,
          (_, demoId) => `:::article-demo{${demoId}||}:::`
      )
      .replace(
          /<ArticleDemo\s+demoId="([^"]+)"(?:\s+title="([^"]+)")?\s*\/>/g,
          (_, demoId, title) => `:::article-demo{${demoId}||${title || ""}}:::`
      )
}

export function ArticleContent({ content, demos }: ArticleContentProps) {
  const processedContent = processContent(content)
  const parts = processedContent.split(/:::article-demo\{([^}]+)\}:::/g)

  return (
      <div className="prose-content max-w-none">
        {parts.map((part, index) => {
          if (index % 2 === 0) {
            return (
                <ReactMarkdown
                    key={index}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-semibold mt-8 mb-4 border-l-4 border-blue-500 pl-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold mt-8 mb-4 border-l-4 border-blue-400 pl-4">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-semibold mt-6 mb-3 border-l-4 border-blue-300 pl-4">{children}</h3>,
                      p: ({ children }) => <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-muted-foreground">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-muted-foreground">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      code: ({ className, children, ...props }) => {
                        const isInline = !className
                        if (isInline) {
                          return <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono" {...props}>{children}</code>
                        }
                        return <code className={cn("block", className)} {...props}>{children}</code>
                      },
                      pre: ({ children }) => <pre className="bg-muted rounded-lg p-4 overflow-x-auto mb-4 text-sm">{children}</pre>,
                      table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="min-w-full border border-border rounded-lg overflow-hidden">{children}</table></div>,
                      thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                      th: ({ children }) => <th className="px-4 py-2 text-left font-medium border-b border-border">{children}</th>,
                      td: ({ children }) => <td className="px-4 py-2 border-b border-border">{children}</td>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-muted-foreground mb-4 bg-blue-50/50 py-2">{children}</blockquote>,
                      a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      hr: () => <hr className="my-8 border-border" />,
                      img: ({ src, alt, ...props }) => <img src={src} alt={alt || ""} {...props} className="max-w-full h-auto rounded-lg my-4" />,
                    }}
                >
                  {part}
                </ReactMarkdown>
            )
          }

          const [demoId, src, title] = part.split("|")
          return (
              <ArticleDemo
                  key={`demo-${index}`}
                  demoId={demoId}
                  src={src || undefined}
                  title={title || undefined}
                  demos={demos}
              />
          )
        })}
      </div>
  )
}