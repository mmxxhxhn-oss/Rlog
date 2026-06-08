# Next.js 技术知识平台重构 Prompt（高级架构版）

这是一个由 Figma AI 自动生成的 Vue3 + TypeScript + TailwindCSS 前端项目。

现在需要你将其：

# 重构为一个长期可维护的现代化个人技术知识平台

而不是简单的 Vue → React 转换。

---

# 一、项目目标（非常重要）

这是一个：

# 「个人技术知识平台」

主要内容：

* JVM 源码分析
* OpenJDK 学习
* Spring / SpringBoot 源码
* Vue 源码与原理
* Redis / MySQL / 中间件
* OAuth2 / JWT / 安全框架
* 支付系统（支付宝、微信支付）
* Docker / Linux / 部署
* 技术总结
* 学习路线
* 技术动态（类似朋友圈）
* Demo 演示系统

网站定位参考：

* Vercel
* 美团技术团队
* Apple Developer
* Linear
* GitHub
* Obsidian
* Notion

整体风格：

* 极简
* 高级感
* 技术感
* 大量留白
* SaaS 风格
* Apple 风格
* 黑白灰 + 蓝色点缀

---

# 二、最终技术栈（必须严格遵守）

请严格使用以下技术栈：

| 模块             | 技术                  |
| -------------- | ------------------- |
| Framework      | Next.js App Router  |
| Language       | TypeScript          |
| Styling        | TailwindCSS         |
| UI Library     | shadcn/ui           |
| Icons          | lucide-react        |
| Animation      | framer-motion       |
| Theme          | next-themes         |
| Database       | Supabase PostgreSQL |
| Auth           | Supabase Auth       |
| Storage        | Supabase Storage    |
| Markdown       | MDX                 |
| Code Highlight | Shiki               |
| Search         | Orama               |
| State          | Zustand（仅必要时）       |
| Validation     | Zod                 |
| Form           | React Hook Form     |

禁止：

* Redux
* MobX
* Vue相关代码
* Pinia
* Element Plus
* Ant Design
* Chakra UI
* Material UI

---

# 三、核心目标（非常重要）

这不是简单转换。

而是：

# 重构为现代化、模块化、长期可维护的 Next.js 项目。

需要：

1. 删除 AI 生成的冗余代码
2. 删除无意义状态
3. 删除无意义 hooks
4. 删除重复 Tailwind class
5. 删除假数据耦合
6. 提升组件复用性
7. 提升目录结构清晰度
8. 提升代码可维护性
9. 提升 SEO 结构
10. 提升阅读体验

---

# 四、必须转换为 Next.js App Router

必须使用：

```txt
src/app
```

结构。

禁止：

* pages router
* react-router-dom

必须使用：

* layout.tsx
* page.tsx
* server component 优先
* client component 最小化

---

# 五、请重新设计项目目录结构

请生成适合：

# 技术知识平台

的目录结构。

推荐类似：

```txt
src
├── app
│   ├── articles
│   ├── roadmap
│   ├── demo
│   ├── projects
│   ├── moments
│   └── admin
│
├── components
│   ├── layout
│   ├── article
│   ├── demo
│   ├── moments
│   ├── roadmap
│   └── ui
│
├── lib
├── hooks
├── services
├── types
├── styles
├── mdx
└── supabase
```

---

# 六、组件拆分要求（重点）

请不要保留：

Home.vue 这种巨型组件。

必须拆分为：

* Header
* Sidebar
* HeroSection
* ArticleCard
* ArticleList
* TechFeed
* DemoCard
* ProjectCard
* RoadmapCard
* Footer

组件必须：

* 高复用
* 单一职责
* 易维护
* 易扩展

---

# 七、UI 风格要求（重点）

必须统一为：

# shadcn/ui 风格

要求：

* 极简
* 高级感
* Apple 风格
* Linear 风格
* Vercel 风格
* 卡片化
* 圆角
* 微阴影
* 深色模式支持
* 响应式布局

禁止：

* 花哨渐变
* 过度动画
* 杂乱颜色
* UI 风格不统一

---

# 八、TailwindCSS 优化要求

请：

1. 删除重复 class
2. 提取公共 class
3. 使用 cn() 工具函数
4. 优化响应式
5. 减少嵌套
6. 保持 class 可读性

---

# 九、状态管理要求（非常重要）

原则：

# 能不用状态就不用状态。

要求：

* 删除无意义 useState
* 删除无意义 computed
* 删除冗余 watch
* Server Component 优先
* Zustand 仅用于：

  * Theme
  * Search
  * Global UI

禁止：

* 全局状态滥用
* 页面级状态全局化

---

# 十、文章系统要求（重点）

这是网站核心。

请围绕：

# 技术文章阅读体验

进行优化。

必须支持：

* MDX
* TOC
* 代码高亮
* Mermaid
* 深色模式
* 阅读进度
* 标签
* 分类
* SEO

文章页面必须类似：

* Vercel Docs
* shadcn docs
* 美团技术博客

---

# 十一、Demo 演示系统要求

需要支持：

* HTML Demo
* iframe Demo
* reveal.js PPT
* Canvas 动画
* 技术流程演示

请保留：

# 高扩展性

---

# 十二、技术动态（朋友圈）要求

需要实现：

# Tech Feed

类似：

* Twitter
* 即刻

但偏技术风。

支持：

* 文本
* 图片
* 代码片段
* 链接
* Markdown

风格：

* 极简技术社区风
* Notion 风格

---

# 十三、Supabase 集成要求

请预留：

* Supabase Auth
* Supabase Storage
* PostgreSQL
* Row Level Security

不要写死 mock 数据。

请设计：

* services
* api
* database types

结构。

---

# 十四、SEO 要求（重要）

必须：

* metadata
* OpenGraph
* sitemap
* robots
* semantic html

技术文章网站必须重视 SEO。

---

# 十五、最终目标（重要）

最终结果必须是：

# 一个真正可长期维护的现代化技术知识平台

而不是：

# “AI生成页面改一改”

要求：

* 架构合理
* 可扩展
* 组件化
* 技术栈统一
* UI统一
* 适合长期开发

---

# 十六、输出要求

请输出：

1. 重构后的目录结构
2. 页面拆分方案
3. 组件拆分方案
4. 状态管理方案
5. Tailwind 优化方案
6. Next.js App Router 改造方案
7. Supabase 集成方案
8. 示例 TSX 代码
9. 最佳实践建议

请一步一步分析，不要省略架构设计。
