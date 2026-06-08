-- =============================================
-- AI Blog - Supabase Schema (Updated)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Articles (with soft delete and user_id)
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  views INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ, -- Soft delete
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Article Tags (Join Table)
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Learning Paths
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  total_time TEXT,
  color TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chapters
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  repo_url TEXT,
  demo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Demos
CREATE TABLE demos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  demo_type TEXT NOT NULL DEFAULT 'canvas',
  icon TEXT,
  content TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tech Feed
CREATE TABLE tech_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT,
  code_snippet TEXT,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE demos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_feed ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update only own
CREATE POLICY "Public read profiles" ON profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Categories: public read
CREATE POLICY "Public read categories" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can insert categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update categories" ON categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin can delete categories" ON categories FOR DELETE TO authenticated USING (true);

-- Tags: public read
CREATE POLICY "Public read tags" ON tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can manage tags" ON tags FOR ALL TO authenticated USING (true);

-- Articles: public read (non-deleted), auth write (own articles)
CREATE POLICY "Public read published articles" ON articles FOR SELECT TO anon, authenticated
  USING (published = true AND deleted_at IS NULL);
CREATE POLICY "Users can read own articles" ON articles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users can insert articles" ON articles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own articles" ON articles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users can delete own articles (soft)" ON articles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Article Tags: public read
CREATE POLICY "Public read article_tags" ON article_tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can manage article_tags" ON article_tags FOR ALL TO authenticated USING (true);

-- Learning Paths: public read
CREATE POLICY "Public read learning_paths" ON learning_paths FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can manage learning_paths" ON learning_paths FOR ALL TO authenticated USING (true);

-- Chapters: public read
CREATE POLICY "Public read chapters" ON chapters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can manage chapters" ON chapters FOR ALL TO authenticated USING (true);

-- Projects: public read
CREATE POLICY "Public read projects" ON projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can manage projects" ON projects FOR ALL TO authenticated USING (true);

-- Demos: public read
CREATE POLICY "Public read demos" ON demos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can manage demos" ON demos FOR ALL TO authenticated USING (true);

-- Tech Feed: public read, auth create (own)
CREATE POLICY "Public read tech_feed" ON tech_feed FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert tech_feed" ON tech_feed FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own tech_feed" ON tech_feed FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\u4e00-\u9fa5]+', '-', 'g'));
  base_slug := trim(BOTH '-' FROM base_slug);
  final_slug := base_slug;

  -- Check for uniqueness
  WHILE EXISTS (SELECT 1 FROM articles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for articles updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_deleted_at ON articles(deleted_at);
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_chapters_path_id ON chapters(path_id);
CREATE INDEX idx_chapters_sort_order ON chapters(sort_order);
CREATE INDEX idx_tech_feed_user_id ON tech_feed(user_id);

-- =============================================
-- DEFAULT DATA
-- =============================================

-- Categories
INSERT INTO categories (id, name, slug, color, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'JVM', 'jvm', 'blue', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Spring', 'spring', 'green', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'OpenJDK', 'openjdk', 'blue', NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Vue', 'vue', 'emerald', NOW()),
  ('55555555-5555-5555-5555-555555555555', 'Redis', 'redis', 'red', NOW()),
  ('66666666-6666-6666-6666-666666666666', 'MySQL', 'mysql', 'orange', NOW()),
  ('77777777-7777-7777-7777-777777777777', 'Docker', 'docker', 'cyan', NOW()),
  ('88888888-8888-8888-8888-888888888888', '安全框架', 'security', 'purple', NOW());

-- Tags
INSERT INTO tags (id, name, slug, color, count, created_at) VALUES
  ('aaaa1111-a111-1111-1111-111111111111', '类加载', 'classloader', 'blue', 8, NOW()),
  ('aaaa2222-a222-2222-2222-222222222222', '双亲委派', 'delegation', 'blue', 5, NOW()),
  ('aaaa3333-a333-3333-3333-333333333333', '源码分析', 'source', 'purple', 45, NOW()),
  ('aaaa4444-a444-4444-4444-444444444444', 'Spring Boot', 'spring-boot', 'green', 32, NOW()),
  ('aaaa5555-a555-5555-5555-555555555555', '自动配置', 'auto-config', 'green', 12, NOW()),
  ('aaaa6666-a666-6666-6666-666666666666', 'Redis', 'redis', 'red', 21, NOW()),
  ('aaaa7777-a777-7777-7777-777777777777', '性能优化', 'optimization', 'pink', 28, NOW()),
  ('aaaa8888-a888-8888-8888-888888888888', 'OAuth2', 'oauth2', 'indigo', 12, NOW());

-- Articles (now with user_id - will be null for existing)
INSERT INTO articles (id, title, slug, excerpt, content, cover_image, category_id, views, reading_time, published, created_at, updated_at) VALUES
  ('b1111111-b111-1111-1111-111111111111', '深入理解 JVM 类加载机制', 'jvm-classloader', '详细解析 JVM 类加载的全过程，包括加载、验证、准备、解析和初始化五个阶段，以及双亲委派模型的实现原理。', '## 引言

类加载机制是 JVM 最核心的功能之一，理解类加载过程对于深入掌握 Java 虚拟机至关重要。

## 类加载过程

JVM 的类加载过程包括以下五个阶段：

1. **加载（Loading）**：通过类的全限定名获取二进制字节流
2. **验证（Verification）**：确保 Class 文件的字节流符合虚拟机规范
3. **准备（Preparation）**：为类变量分配内存并设置初始值
4. **解析（Resolution）**：将常量池内的符号引用替换为直接引用
5. **初始化（Initialization）**：执行类构造器 <clinit> 方法

## 双亲委派模型

当一个类加载器收到类加载请求时，它首先不会自己去尝试加载这个类，而是把这个请求委派给父类加载器完成。

<ArticleDemo demoId="classloader-demo" />

## 总结

理解类加载机制对于解决 ClassNotFoundException、NoClassDefFoundError 等问题至关重要。', NULL, '11111111-1111-1111-1111-111111111111', 2847, 15, true, '2026-06-05T00:00:00Z', '2026-06-05T00:00:00Z'),

  ('b2222222-b222-2222-2222-222222222222', 'Spring Boot 自动配置源码解析', 'spring-boot-auto-config', '深入分析 Spring Boot 自动配置的实现原理，@EnableAutoConfiguration 注解的工作机制，以及如何自定义 Starter。', '## 引言

Spring Boot 的自动配置是其核心特性之一，极大地简化了 Spring 应用的配置过程。

## 自动配置原理

自动配置主要通过以下步骤实现：

1. `@EnableAutoConfiguration` 启用自动配置
2. `spring.factories` 文件定义配置类
3. 条件注解判断是否生效

## 自定义 Starter

通过实现 `AutoConfiguration` 类并注册，可以创建自定义的 Starter。', NULL, '22222222-2222-2222-2222-222222222222', 3241, 20, true, '2026-06-03T00:00:00Z', '2026-06-03T00:00:00Z'),

  ('b3333333-b333-3333-3333-333333333333', 'Redis 持久化机制 RDB 与 AOF', 'redis-persistence', 'Redis 两种持久化方式的原理、优缺点对比，以及在生产环境中的最佳实践。', '## 引言

Redis 提供了两种持久化方式：RDB 和 AOF，各有优劣。

## RDB 持久化

RDB 是内存快照方式，通过 `bgsave` 或 `save` 命令生成 dump.rdb 文件。

## AOF 持久化

AOF 是命令日志方式，记录每个写操作到 .aof 文件。', NULL, '55555555-5555-5555-5555-555555555555', 2834, 16, true, '2026-05-22T00:00:00Z', '2026-05-22T00:00:00Z');

-- Article Tags
INSERT INTO article_tags (article_id, tag_id) VALUES
  ('b1111111-b111-1111-1111-111111111111', 'aaaa1111-a111-1111-1111-111111111111'),
  ('b1111111-b111-1111-1111-111111111111', 'aaaa2222-a222-2222-2222-222222222222'),
  ('b1111111-b111-1111-1111-111111111111', 'aaaa3333-a333-3333-3333-333333333333'),
  ('b2222222-b222-2222-2222-222222222222', 'aaaa4444-a444-4444-4444-444444444444'),
  ('b2222222-b222-2222-2222-222222222222', 'aaaa5555-a555-5555-5555-555555555555'),
  ('b2222222-b222-2222-2222-222222222222', 'aaaa3333-a333-3333-3333-333333333333'),
  ('b3333333-b333-3333-3333-333333333333', 'aaaa6666-a666-6666-6666-666666666666'),
  ('b3333333-b333-3333-3333-333333333333', 'aaaa7777-a777-7777-7777-777777777777');

-- Learning Paths
INSERT INTO learning_paths (id, title, description, category_id, total_time, color, created_at) VALUES
  ('c1111111-c111-1111-1111-111111111111', 'JVM 深度学习路线', '从零开始系统学习 JVM 底层原理，掌握类加载、内存管理、垃圾回收等核心机制', '11111111-1111-1111-1111-111111111111', '30 小时', 'blue', '2026-01-01T00:00:00Z'),

  ('c2222222-c222-2222-2222-222222222222', 'Spring 源码剖析路线', 'Spring Framework 核心源码深度解析，IoC、AOP、事务管理等核心功能实现原理', '22222222-2222-2222-2222-222222222222', '40 小时', 'green', '2026-01-01T00:00:00Z');

-- Chapters
INSERT INTO chapters (id, path_id, title, content, article_id, sort_order, created_at) VALUES
  ('d1111111-d111-1111-1111-111111111111', 'c1111111-c111-1111-1111-111111111111', '类加载机制', NULL, 'b1111111-b111-1111-1111-111111111111', 1, '2026-01-01T00:00:00Z'),
  ('d2222222-d222-2222-2222-222222222222', 'c1111111-c111-1111-1111-111111111111', '内存模型', NULL, NULL, 2, '2026-01-01T00:00:00Z'),
  ('d3333333-d333-3333-3333-333333333333', 'c1111111-c111-1111-1111-111111111111', '垃圾回收', NULL, NULL, 3, '2026-01-01T00:00:00Z');

-- Projects
INSERT INTO projects (id, name, description, repo_url, demo_url, tags, stars, forks, created_at) VALUES
  ('e1111111-e111-1111-1111-111111111111', 'jvm-source-analysis', 'JVM 源码分析项目，包含类加载、内存管理、垃圾回收等核心模块的详细注释和示例代码', 'https://github.com/example/jvm-source-analysis', NULL, ARRAY['Java', 'JVM', 'OpenJDK'], 1243, 0, '2026-01-01T00:00:00Z'),

  ('e2222222-e222-2222-2222-222222222222', 'spring-boot-deep-dive', 'Spring Boot 深度解析，包含自动配置、Starter 开发、条件注解等核心功能的源码分析', 'https://github.com/example/spring-boot-deep-dive', NULL, ARRAY['Java', 'Spring Boot', 'Spring Framework'], 2156, 0, '2026-01-01T00:00:00Z');

-- Demos
INSERT INTO demos (id, title, description, demo_type, icon, content, category_id, created_at) VALUES
  ('f1111111-f111-1111-1111-111111111111', 'JVM 内存模型演示', '可视化展示 JVM 堆、栈、方法区等内存区域的结构和工作原理', 'canvas', 'Cpu', 'jvm-memory', '11111111-1111-1111-1111-111111111111', '2026-01-01T00:00:00Z'),

  ('f2222222-f222-2222-2222-222222222222', '双亲委派机制演示', 'JVM 类加载器双亲委派模型的工作流程可视化', 'canvas', 'Code2', 'classloader', '11111111-1111-1111-1111-111111111111', '2026-01-01T00:00:00Z');

-- Tech Feed
INSERT INTO tech_feed (id, content, code_snippet, likes, created_at) VALUES
  ('a1111111-a111-1111-1111-111111111111', '今天终于搞懂了 JVM 双亲委派机制的设计初衷。原来是为了防止核心类库被篡改，保证 Java 程序的安全性。', NULL, 42, '2026-06-07T10:00:00Z'),

  ('a2222222-a222-2222-2222-222222222222', 'Spring Security 的过滤器链是真的复杂，但理解了 FilterChainProxy 的工作原理后，整个认证流程就清晰多了。', '@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/public/**").permitAll()
            .anyRequest().authenticated()
        );
        return http.build();
    }
}', 67, '2026-06-07T08:00:00Z');

-- =============================================
-- ADMIN USER (temporary - change password after setup!)
-- Note: This creates an auth.users entry, but for email auth you need to use
-- Supabase Dashboard > Authentication > Users > Create user
-- or use the signup API. The SQL below is for reference only.
-- =============================================

-- To create admin user via SQL (if you have service role key):
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'admin@example.com',
--   crypt('admin123', gen_salt('bf')),
--   NOW(),
--   '{"name": "Admin"}'::jsonb
-- );