# AGENTS.md - Sunav Nuxt UI 项目指南

## 项目概述

这是一个基于 Nuxt 4 + Nuxt UI 构建的**导航网站**（类似网址导航站）。项目使用 SQLite 数据库存储导航链接和分类数据，支持深色模式，使用 Tailwind CSS v4 进行样式开发。

## 技术栈

- **框架**: Nuxt 4.4.5
- **UI 组件库**: Nuxt UI 4.7.1
- **样式**: Tailwind CSS 4.3.0
- **数据库**: better-sqlite3 12.10.0 (SQLite)
- **加密**: bcryptjs 3.0.3
- **表单验证**: valibot 1.4.0
- **图标**: Iconify (lucide, simple-icons)
- **包管理器**: pnpm 10.33.4
- **语言**: TypeScript

## 项目结构

```
sunav-nuxt-main/
├── app/
│   ├── assets/          # 静态资源
│   ├── components/      # Vue 组件
│   │   ├── AppLogo.vue          # Logo 组件
│   │   └── TemplateMenu.vue     # 模板菜单组件
│   ├── layouts/         # 布局组件
│   │   ├── default.vue           # 默认布局（首页）
│   │   └── admin.vue            # 管理后台布局
│   ├── middleware/       # 路由中间件
│   │   └── admin-layout.global.js  # 全局中间件（/admin 路径使用 admin 布局）
│   ├── pages/           # 页面路由
│   │   ├── index.vue            # 首页
│   │   └── admin/
│   │       └── index.vue        # 管理后台页面
│   ├── app.config.ts    # App 配置
│   └── app.vue         # 根组件
├── server/
│   ├── api/            # 服务器 API 路由
│   │   └── links.get.js        # 获取链接列表 API
│   └── utils/          # 服务器工具函数
│       └── db.js               # 数据库操作封装
├── data/
│   └── nav.db          # SQLite 数据库文件
├── public/             # 公共资源
│   └── favicon.ico
├── nuxt.config.ts      # Nuxt 配置文件
├── package.json        # 项目依赖配置
├── tsconfig.json       # TypeScript 配置
└── README.md           # 项目说明文档
```

## 数据库结构

项目使用 SQLite 数据库，包含以下三张表：

### 1. categories_level1 (一级分类表)

```sql
CREATE TABLE categories_level1 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sort INTEGER DEFAULT 0
);
```

### 2. categories_level2 (二级分类表)

```sql
CREATE TABLE categories_level2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level1_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  sort INTEGER DEFAULT 0,
  FOREIGN KEY (level1_id) REFERENCES categories_level1(id) ON DELETE CASCADE
);
```

### 3. links (链接表)

```sql
CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level1_id INTEGER NOT NULL,
  level2_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  sort INTEGER DEFAULT 0,
  FOREIGN KEY (level1_id) REFERENCES categories_level1(id) ON DELETE CASCADE,
  FOREIGN KEY (level2_id) REFERENCES categories_level2(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_links_level1 ON links(level1_id);
CREATE INDEX idx_links_level2 ON links(level2_id);
CREATE INDEX idx_categories_level2 ON categories_level2(level1_id);
```

### 初始数据

数据库首次运行时会自动填充以下示例数据：

- **常用工具**: 搜索引擎、开发工具、在线服务
- **技术社区**: 前端技术、后端技术、人工智能
- **学习资源**: 在线课程、技术文档
- **娱乐生活**: 视频音乐、社交资讯

## API 接口

### GET /api/links

获取导航链接列表，支持分页和筛选。

**查询参数**:

- `level1_id` (可选): 一级分类 ID
- `level2_id` (可选): 二级分类 ID
- `search` (可选): 搜索关键词（模糊匹配 name 和 url）
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 20

**返回格式**:

```json
{
  "data": [
    {
      "id": 1,
      "level1_id": 1,
      "level2_id": 1,
      "name": "Google",
      "url": "https://www.google.com",
      "description": "全球最大的搜索引擎",
      "icon": "https://www.google.com/favicon.ico",
      "sort": 1,
      "level1_name": "常用工具",
      "level2_name": "搜索引擎"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (http://localhost:3000)
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 类型检查
pnpm typecheck
```

## 关键配置

### Nuxt 配置 (nuxt.config.ts)

- 使用 `@nuxt/ui` 模块
- 禁用 UI 字体（使用系统字体）
- 启用开发工具
- 自定义 CSS: `~/assets/css/main.css`
- 首页预渲染: `routeRules: { "/": { prerender: true } }`
- 颜色模式: 跟随系统，回退到浅色模式

### 数据库配置 (server/utils/db.js)

- 数据库文件路径: `data/nav.db`
- 使用 WAL 日志模式
- 启用外键约束
- 自动创建数据库目录和表结构
- 首次运行时自动填充初始数据

## 开发规范

### 组件开发

- 使用 `<template>` + `<script setup>` 语法
- 优先使用 Nuxt UI 组件（UButton, UHeader, UPageHero 等）
- 图标使用 Iconify，格式: `i-lucide-xxx` 或 `i-simple-icons-xxx`
- 支持自动导入，无需手动 import 组件和 composables

### 样式开发

- 使用 Tailwind CSS v4 实用类
- 支持深色模式，使用 `dark:` 前缀
- 主题色使用 `--ui-primary` CSS 变量
- 避免编写自定义 CSS，优先使用 Tailwind 类

### 数据库操作

- 使用 `better-sqlite3` 进行数据库操作
- 通过 `server/utils/db.js` 的 `getDb()` 获取数据库连接
- 使用参数化查询防止 SQL 注入
- 事务操作使用 `db.transaction()`

### API 开发

- 文件基于路由: `server/api/*.js` 或 `server/api/*.ts`
- 使用 `defineEventHandler()` 定义处理器
- 获取查询参数: `getQuery(event)`
- 返回 JSON 数据（自动序列化）

### 布局系统

- 默认布局: `app/layouts/default.vue`
- 管理布局: `app/layouts/admin.vue`
- 通过中间件自动切换布局: `/admin/*` 路径使用 admin 布局
- 在页面中使用 `definePageMeta({ layout: 'xxx' })` 指定布局

## 待办事项

- [ ] 完善管理后台功能（目前 admin/index.vue 仅为占位内容）
- [ ] 添加链接的增删改 API 接口
- [ ] 实现分类管理功能
- [ ] 添加用户认证和权限控制
- [ ] 优化首页导航展示
- [ ] 添加链接搜索功能前端实现

## 注意事项

1. **数据库文件**: `data/nav.db` 和 `data/nav.db-wal` 是 SQLite 数据库文件，请勿手动编辑
2. **自动导入**: Nuxt 3+ 支持自动导入，composables、utils、components 会自动注册
3. **类型检查**: 运行 `pnpm typecheck` 进行 TypeScript 类型检查
4. **深色模式**: 项目支持深色模式，使用 `UColorModeButton` 切换
5. **图标使用**: 确保已安装 `@iconify-json/lucide` 和 `@iconify-json/simple-icons`

## AI 协作指南

当你需要修改此项目时，请遵循以下原则：

1. **理解现有结构**: 先阅读相关文件，理解现有实现方式
2. **保持一致性**: 新代码应遵循项目的代码风格和命名约定
3. **组件复用**: 优先使用 Nuxt UI 组件，避免重复造轮子
4. **数据库操作**: 所有数据库操作应通过 `server/utils/db.js` 进行
5. **类型安全**: 使用 TypeScript 并添加适当的类型注解
6. **响应式设计**: 确保 UI 在不同屏幕尺寸下正常显示
7. **错误处理**: API 路由应包含适当的错误处理
8. **性能优化**: 使用分页加载大量数据，避免一次加载所有数据
9. **运行检测**: 优先检测端口号是否被占用，避免重复运行

## 常见问题

**Q: 如何重置数据库？**
A: 删除 `data/nav.db` 和 `data/nav.db-wal` 文件，重启开发服务器，系统会自动重新创建并填充初始数据。

**Q: 如何添加新的导航链接？**
A: 目前可以通过直接操作数据库或等待管理后台功能完善。临时方案：在 `server/utils/db.js` 的 `seedData()` 函数中添加。

**Q: 如何自定义主题色？**
A: 在 `app/app.config.ts` 中取消注释并修改 `ui.colors.primary` 和 `ui.colors.neutral`。

**Q: 如何部署到生产环境？**
A: 运行 `pnpm build` 构建，然后将输出部署到支持 Node.js 的服务器，或使用 Vercel、Netlify 等平台。
