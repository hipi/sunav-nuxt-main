export default defineEventHandler((event) => {
  const query = getQuery(event)
  const level1Id = query.level1_id ? Number(query.level1_id) : undefined
  const level2Id = query.level2_id ? Number(query.level2_id) : undefined
  const search = query.search ? String(query.search) : undefined
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20

  const db = getDb()
  const conditions = []
  const values = []

  if (level1Id) {
    conditions.push('l.level1_id = ?')
    values.push(level1Id)
  }
  if (level2Id) {
    conditions.push('l.level2_id = ?')
    values.push(level2Id)
  }
  if (search) {
    conditions.push('(l.name LIKE ? OR l.url LIKE ?)')
    values.push(`%${search}%`, `%${search}%`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM links l ${whereClause}`)
  const { total } = countStmt.get(...values)

  const dataStmt = db.prepare(
    `SELECT l.*, c1.name as level1_name, c2.name as level2_name
     FROM links l
     LEFT JOIN categories_level1 c1 ON l.level1_id = c1.id
     LEFT JOIN categories_level2 c2 ON l.level2_id = c2.id
     ${whereClause}
     ORDER BY l.sort ASC, l.id ASC
     LIMIT ? OFFSET ?`
  )

  const data = dataStmt.all(...values, limit, (page - 1) * limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
