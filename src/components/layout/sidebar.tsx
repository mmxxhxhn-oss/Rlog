"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  FileText,
  Map,
  FolderGit2,
  Code2,
  MessageSquare,
  Tag,
  Archive,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { name: "首页", path: "/", icon: Home },
  { name: "技术文章", path: "/articles", icon: FileText },
  { name: "学习路线", path: "/roadmap", icon: Map },
  { name: "项目仓库", path: "/projects", icon: FolderGit2 },
  { name: "Demo 演示", path: "/demos", icon: Code2 },
  { name: "技术动态", path: "/moments", icon: MessageSquare },
  { name: "标签", path: "/tags", icon: Tag },
  { name: "归档", path: "/archive", icon: Archive },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-border bg-sidebar">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-sidebar-foreground">
              技术知识库
            </span>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-accent text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-6">
            <Link
              href="/"
              className="flex items-center gap-2 mb-8"
              onClick={() => setMobileOpen(false)}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">技术知识库</span>
            </Link>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      active
                        ? "bg-accent text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}