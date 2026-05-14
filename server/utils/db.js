import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'


const dbPath = join(process.cwd(), 'data', 'nav.db')

let db = null

export function getDb() {
  if (!db) {
    const dir = dirname(dbPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')

    // 创建表（如果不存在）
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories_level1 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        sort INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS categories_level2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level1_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        sort INTEGER DEFAULT 0,
        FOREIGN KEY (level1_id) REFERENCES categories_level1(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS links (
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

      CREATE INDEX IF NOT EXISTS idx_links_level1 ON links(level1_id);
      CREATE INDEX IF NOT EXISTS idx_links_level2 ON links(level2_id);
      CREATE INDEX IF NOT EXISTS idx_categories_level2 ON categories_level2(level1_id);
    `)

    // 首次运行时填充初始数据
    seedData()
  }
  return db
}

export function seedData() {
  const database = db
  const count = database.prepare('SELECT COUNT(*) as count FROM categories_level1').get()
  if (count.count > 0) return

  const insertL1 = database.prepare('INSERT INTO categories_level1 (name, sort) VALUES (?, ?)')
  const insertL2 = database.prepare('INSERT INTO categories_level2 (level1_id, name, sort) VALUES (?, ?, ?)')
  const insertLink = database.prepare('INSERT INTO links (level1_id, level2_id, name, url, description, icon, sort) VALUES (?, ?, ?, ?, ?, ?, ?)')

  const seed = database.transaction(() => {
    // 1. 常用工具
    const l1_1 = Number(insertL1.run('常用工具', 1).lastInsertRowid)
    const l2_1_1 = Number(insertL2.run(l1_1, '搜索引擎', 1).lastInsertRowid)
    const l2_1_2 = Number(insertL2.run(l1_1, '开发工具', 2).lastInsertRowid)
    const l2_1_3 = Number(insertL2.run(l1_1, '在线服务', 3).lastInsertRowid)

    insertLink.run(l1_1, l2_1_1, 'Google', 'https://www.google.com', '全球最大的搜索引擎', 'https://www.google.com/favicon.ico', 1)
    insertLink.run(l1_1, l2_1_1, 'Bing', 'https://www.bing.com', '微软搜索引擎', 'https://www.bing.com/favicon.ico', 2)
    insertLink.run(l1_1, l2_1_1, '百度', 'https://www.baidu.com', '中文搜索引擎', 'https://www.baidu.com/favicon.ico', 3)

    insertLink.run(l1_1, l2_1_2, 'GitHub', 'https://github.com', '代码托管平台', 'https://github.com/favicon.ico', 1)
    insertLink.run(l1_1, l2_1_2, 'Stack Overflow', 'https://stackoverflow.com', '开发者问答社区', 'https://stackoverflow.com/favicon.ico', 2)
    insertLink.run(l1_1, l2_1_2, 'VS Code', 'https://code.visualstudio.com', '轻量级代码编辑器', 'https://code.visualstudio.com/favicon.ico', 3)
    insertLink.run(l1_1, l2_1_2, 'Postman', 'https://www.postman.com', 'API 开发协作平台', 'https://www.postman.com/favicon.ico', 4)

    insertLink.run(l1_1, l2_1_3, 'Notion', 'https://www.notion.so', '全能工作空间', 'https://www.notion.so/favicon.ico', 1)
    insertLink.run(l1_1, l2_1_3, 'Figma', 'https://www.figma.com', '在线设计协作工具', 'https://www.figma.com/favicon.ico', 2)
    insertLink.run(l1_1, l2_1_3, 'Vercel', 'https://vercel.com', '前端部署平台', 'https://vercel.com/favicon.ico', 3)

    // 2. 技术社区
    const l1_2 = Number(insertL1.run('技术社区', 2).lastInsertRowid)
    const l2_2_1 = Number(insertL2.run(l1_2, '前端技术', 1).lastInsertRowid)
    const l2_2_2 = Number(insertL2.run(l1_2, '后端技术', 2).lastInsertRowid)
    const l2_2_3 = Number(insertL2.run(l1_2, '人工智能', 3).lastInsertRowid)

    insertLink.run(l1_2, l2_2_1, 'MDN Web Docs', 'https://developer.mozilla.org', 'Web 技术权威文档', 'https://developer.mozilla.org/favicon.ico', 1)
    insertLink.run(l1_2, l2_2_1, 'Vue.js', 'https://vuejs.org', '渐进式 JavaScript 框架', 'https://vuejs.org/favicon.ico', 2)
    insertLink.run(l1_2, l2_2_1, 'React', 'https://react.dev', '用于构建用户界面的 JavaScript 库', 'https://react.dev/favicon.ico', 3)
    insertLink.run(l1_2, l2_2_1, 'Tailwind CSS', 'https://tailwindcss.com', '实用优先的 CSS 框架', 'https://tailwindcss.com/favicon.ico', 4)

    insertLink.run(l1_2, l2_2_2, 'Node.js', 'https://nodejs.org', 'JavaScript 运行时', 'https://nodejs.org/favicon.ico', 1)
    insertLink.run(l1_2, l2_2_2, 'Go', 'https://go.dev', 'Go 编程语言', 'https://go.dev/favicon.ico', 2)
    insertLink.run(l1_2, l2_2_2, 'Rust', 'https://www.rust-lang.org', 'Rust 编程语言', 'https://www.rust-lang.org/favicon.ico', 3)

    insertLink.run(l1_2, l2_2_3, 'OpenAI', 'https://openai.com', '人工智能研究公司', 'https://openai.com/favicon.ico', 1)
    insertLink.run(l1_2, l2_2_3, 'Hugging Face', 'https://huggingface.co', 'AI 模型社区', 'https://huggingface.co/favicon.ico', 2)
    insertLink.run(l1_2, l2_2_3, 'TensorFlow', 'https://www.tensorflow.org', '机器学习平台', 'https://www.tensorflow.org/favicon.ico', 3)

    // 3. 学习资源
    const l1_3 = Number(insertL1.run('学习资源', 3).lastInsertRowid)
    const l2_3_1 = Number(insertL2.run(l1_3, '在线课程', 1).lastInsertRowid)
    const l2_3_2 = Number(insertL2.run(l1_3, '技术文档', 2).lastInsertRowid)

    insertLink.run(l1_3, l2_3_1, 'Coursera', 'https://www.coursera.org', '全球知名在线学习平台', 'https://www.coursera.org/favicon.ico', 1)
    insertLink.run(l1_3, l2_3_1, 'freeCodeCamp', 'https://www.freecodecamp.org', '免费编程学习平台', 'https://www.freecodecamp.org/favicon.ico', 2)
    insertLink.run(l1_3, l2_3_1, 'LeetCode', 'https://leetcode.com', '编程练习平台', 'https://leetcode.com/favicon.ico', 3)
    insertLink.run(l1_3, l2_3_1, 'Udemy', 'https://www.udemy.com', '技能学习平台', 'https://www.udemy.com/favicon.ico', 4)

    insertLink.run(l1_3, l2_3_2, 'Nuxt Docs', 'https://nuxt.com', 'Nuxt 官方文档', 'https://nuxt.com/favicon.ico', 1)
    insertLink.run(l1_3, l2_3_2, 'TypeScript', 'https://www.typescriptlang.org', 'TypeScript 文档', 'https://www.typescriptlang.org/favicon.ico', 2)
    insertLink.run(l1_3, l2_3_2, 'Docker Docs', 'https://docs.docker.com', 'Docker 官方文档', 'https://docs.docker.com/favicon.ico', 3)

    // 4. 娱乐生活
    const l1_4 = Number(insertL1.run('娱乐生活', 4).lastInsertRowid)
    const l2_4_1 = Number(insertL2.run(l1_4, '视频音乐', 1).lastInsertRowid)
    const l2_4_2 = Number(insertL2.run(l1_4, '社交资讯', 2).lastInsertRowid)

    insertLink.run(l1_4, l2_4_1, 'YouTube', 'https://www.youtube.com', '视频分享平台', 'https://www.youtube.com/favicon.ico', 1)
    insertLink.run(l1_4, l2_4_1, 'Bilibili', 'https://www.bilibili.com', '哔哩哔哩视频弹幕网', 'https://www.bilibili.com/favicon.ico', 2)
    insertLink.run(l1_4, l2_4_1, 'Spotify', 'https://open.spotify.com', '流媒体音乐平台', 'https://open.spotify.com/favicon.ico', 3)

    insertLink.run(l1_4, l2_4_2, 'Twitter/X', 'https://x.com', '社交网络与资讯平台', 'https://x.com/favicon.ico', 1)
    insertLink.run(l1_4, l2_4_2, 'Reddit', 'https://www.reddit.com', '社区讨论平台', 'https://www.reddit.com/favicon.ico', 2)
    insertLink.run(l1_4, l2_4_2, 'V2EX', 'https://www.v2ex.com', '创意工作者社区', 'https://www.v2ex.com/favicon.ico', 3)
    insertLink.run(l1_4, l2_4_2, '知乎', 'https://www.zhihu.com', '中文问答社区', 'https://www.zhihu.com/favicon.ico', 4)
  })

  seed()
  console.log('[db] 初始数据已填充')
}
