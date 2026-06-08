import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider, Sidebar, Header } from "@/components/layout"
import { AuthProvider } from "@/lib/auth"

export const metadata: Metadata = {
  title: {
    default: "技术知识库",
    template: "%s | 技术知识库",
  },
  description: "专注 JVM、Spring、OpenJDK 等底层原理与实践总结的个人技术知识平台",
  keywords: ["JVM", "Spring", "OpenJDK", "技术博客", "源码分析"],
  authors: [{ name: "技术探索者" }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "技术知识库",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Sidebar />
            <Header />
            <main className="lg:ml-64 lg:pt-16 pt-16 min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}