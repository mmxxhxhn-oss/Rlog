"use client"

import { useState } from "react"
import { Play, Cpu, Server, Lock, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Demo } from "@/lib/db"
import type { CategoryColor } from "@/types"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Server,
  Lock,
  Code2,
}

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

interface DemosClientProps {
  demos: Demo[]
}

export function DemosClient({ demos }: DemosClientProps) {
  const [selectedDemo, setSelectedDemo] = useState(demos[0])

  const colors = colorMap[selectedDemo.category?.color as CategoryColor] || colorMap.blue
  const Icon = iconMap[selectedDemo.icon || ""] || Code2

  return (
    <div className="px-6 lg:px-8 pt-8 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-semibold mb-2">Demo 演示</h1>
          <p className="text-muted-foreground">技术原理可视化演示</p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Demo List */}
          <div className="space-y-2">
            {demos.map((demo) => {
              const demoColors = colorMap[demo.category?.color as CategoryColor] || colorMap.blue
              const DemoIcon = iconMap[demo.icon || ""] || Code2
              const isSelected = selectedDemo.id === demo.id

              return (
                <button
                  key={demo.id}
                  onClick={() => setSelectedDemo(demo)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all",
                    isSelected
                      ? "bg-accent border-blue-200 shadow-sm"
                      : "bg-card border-border hover:bg-accent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center flex-shrink-0",
                        demoColors.gradient
                      )}
                    >
                      <DemoIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm mb-1">{demo.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {demo.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Demo Preview */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="secondary" className={cn("text-xs font-medium mb-3", colors.badge)}>
                    {selectedDemo.category?.name}
                  </Badge>
                  <h2 className="text-2xl font-semibold mb-2">{selectedDemo.title}</h2>
                  <p className="text-muted-foreground">{selectedDemo.description}</p>
                </div>
                <Button className="gap-2">
                  <Play className="w-5 h-5" />
                  播放
                </Button>
              </div>
            </div>

            <div className="aspect-video bg-gradient-to-br from-muted to-muted/80 relative flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-background rounded-full shadow-lg mb-4 border border-border">
                  <Play className="w-10 h-10 text-blue-600 ml-1" />
                </div>
                <p className="text-muted-foreground">点击播放按钮开始演示</p>
              </div>
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}