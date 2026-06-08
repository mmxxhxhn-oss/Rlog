import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, FileText, LogOut } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const signOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            仪表盘
          </Link>
          <Link
            href="/admin/articles"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            <FileText className="w-5 h-5" />
            文章管理
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-2 w-full rounded-lg hover:bg-accent transition-colors text-red-600"
            >
              <LogOut className="w-5 h-5" />
              退出登录
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-muted/30">
        {children}
      </main>
    </div>
  )
}