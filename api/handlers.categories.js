const { getDb, parseJsonBody, ok, fail } = require('./handlers.shared');

function listCategories(_, res) {
  const rows = getDb().prepare('SELECT * FROM habit_categories ORDER BY id DESC').all();
  return ok(res, rows);
}

function listHabitTemplates(_, res) {
  const rows = getDb().prepare('SELECT * FROM habit_templates ORDER BY title ASC').all();
  return ok(res, rows);
}

async function createCategory(req, res) {
  const body = await parseJsonBody(req);
  if (!body.name) return fail(res, 400, 'name is required');

  const db = getDb();
  const result = db.prepare('INSERT INTO habit_categories (name, color) VALUES (?, ?)').run(body.name, body.color || null);
  const row = db.prepare('SELECT * FROM habit_categories WHERE id = ?').get(result.lastInsertRowid);
  return ok(res, row, 201);
}

module.exports = {
  listCategories,
  listHabitTemplates,
  createCategory,
};
