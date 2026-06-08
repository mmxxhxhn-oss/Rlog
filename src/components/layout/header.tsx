"use client"

import { Search, Moon, Sun, Globe, User } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="hidden lg:flex fixed top-0 right-0 left-64 h-16 border-b border-border bg-background/80 backdrop-blur-sm z-10">
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索技术文章、标签..."
              className="w-full pl-10 pr-4 py-2 bg-muted border-0 rounded-lg text-sm focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Globe className="w-5 h-5 text-muted-foreground" />
          </a>
          <Button variant="ghost" size="icon" className="rounded-full">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </Button>
        </div>
      </div>
    </header>
  )
}