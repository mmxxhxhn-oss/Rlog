"use client"

import { useState } from "react"
import { Play, Maximize2, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Demo } from "@/lib/db"
import { cn } from "@/lib/utils"

interface ArticleDemoProps {
  demoId: string
  title?: string
  demos: Demo[]
}

function ArticleDemo({ demoId, title, demos }: ArticleDemoProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const demo = demos.find((d) => d.id === demoId || d.content === demoId)

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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(true)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="aspect-video bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center relative">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-background rounded-full shadow-lg mb-4 border border-border">
              <Play className="w-8 h-8 text-blue-600 ml-1" />
            </div>
            <p className="text-muted-foreground text-sm">点击播放按钮开始演示</p>
          </div>

          {demo.content === "jvm-memory" && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
                <div className="bg-background rounded-lg p-3 shadow border-2 border-blue-300">
                  <div className="text-center text-xs font-medium text-blue-600 mb-2">
                    栈 (Stack)
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-blue-100 rounded" />
                    <div className="h-6 bg-blue-100 rounded" />
                    <div className="h-6 bg-blue-100 rounded" />
                  </div>
                </div>
                <div className="bg-background rounded-lg p-3 shadow border-2 border-green-300">
                  <div className="text-center text-xs font-medium text-green-600 mb-2">
                    堆 (Heap)
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 bg-green-100 rounded" />
                    <div className="h-10 bg-green-100 rounded" />
                  </div>
                </div>
                <div className="bg-background rounded-lg p-3 shadow border-2 border-purple-300">
                  <div className="text-center text-xs font-medium text-purple-600 mb-2">
                    方法区
                  </div>
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
                <div className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium">
                  Bootstrap ClassLoader
                </div>
                <div className="w-0.5 h-8 bg-blue-300" />
                <div className="bg-blue-400 text-white px-6 py-3 rounded-lg font-medium">
                  Extension ClassLoader
                </div>
                <div className="w-0.5 h-8 bg-blue-200" />
                <div className="bg-blue-300 text-white px-6 py-3 rounded-lg font-medium">
                  Application ClassLoader
                </div>
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

export function ArticleContent({ content, demos }: ArticleContentProps) {
  // Simple markdown-like rendering with Demo support
  const elements: React.ReactNode[] = []
  const lines = content.split("\n")
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Headers
    if (line.startsWith("## ")) {
      const text = line.replace("## ", "")
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, "-")
      elements.push(
        <h2
          key={i}
          id={id}
          className="text-2xl font-semibold mt-8 mb-4 scroll-mt-24"
        >
          {text}
        </h2>
      )
      i++
      continue
    }
    if (line.startsWith("### ")) {
      const text = line.replace("### ", "")
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, "-")
      elements.push(
        <h3
          key={i}
          id={id}
          className="text-xl font-semibold mt-6 mb-3 scroll-mt-24"
        >
          {text}
        </h3>
      )
      i++
      continue
    }

    // ArticleDemo component
    const demoMatch = line.match(/<ArticleDemo\s+demoId="([^"]+)"(?:\s+title="([^"]+)")?\s*\/>/)
    if (demoMatch) {
      elements.push(
        <ArticleDemo key={i} demoId={demoMatch[1]} title={demoMatch[2]} demos={demos} />
      )
      i++
      continue
    }

    // List items
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ""))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside mb-4 space-y-2">
          {items.map((item, j) => (
            <li key={j} className="text-muted-foreground">
              {item}
            </li>
          ))}
        </ol>
      )
      continue
    }
    if (line.startsWith("- ")) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].replace("- ", ""))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside mb-4 space-y-2">
          {items.map((item, j) => (
            <li key={j} className="text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Empty lines
    if (!line.trim()) {
      i++
      continue
    }

    // Regular paragraphs
    // Handle inline code
    const processedLine = line.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-muted rounded text-sm">$1</code>')
    elements.push(
      <p
        key={i}
        className="text-muted-foreground leading-relaxed mb-4"
        dangerouslySetInnerHTML={{ __html: processedLine }}
      />
    )
    i++
  }

  return <div className="prose-content">{elements}</div>
}