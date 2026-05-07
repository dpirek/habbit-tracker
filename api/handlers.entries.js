const { getDb, parseJsonBody, ok, fail, toInt } = require('./handlers.shared');

function listEntries(_, res, params) {
  const habitId = toInt(params.id, 'id');
  const rows = getDb().prepare('SELECT * FROM habit_entries WHERE habit_id = ? ORDER BY entry_date DESC').all(habitId);
  return ok(res, rows);
}

async function createEntry(req, res, params) {
  const habitId = toInt(params.id, 'id');
  const body = await parseJsonBody(req);
  if (!body.entry_date) return fail(res, 400, 'entry_date is required');

  const db = getDb();
  const result = db.prepare('INSERT INTO habit_entries (habit_id, entry_date, value, notes) VALUES (?, ?, ?, ?)').run(
    habitId,
    body.entry_date,
    body.value || 1,
    body.notes || null
  );

  return ok(res, db.prepare('SELECT * FROM habit_entries WHERE id = ?').get(result.lastInsertRowid), 201);
}

async function updateEntry(req, res, params) {
  const entryId = toInt(params.id, 'id');
  const body = await parseJsonBody(req);
  const db = getDb();
  const existing = db.prepare('SELECT * FROM habit_entries WHERE id = ?').get(entryId);
  if (!existing) return fail(res, 404, 'Entry not found');

  db.prepare('UPDATE habit_entries SET entry_date = ?, value = ?, notes = ? WHERE id = ?').run(
    body.entry_date || existing.entry_date,
    body.value ?? existing.value,
    body.notes ?? existing.notes,
    entryId
  );

  return ok(res, db.prepare('SELECT * FROM habit_entries WHERE id = ?').get(entryId));
}

function deleteEntry(_, res, params) {
  const entryId = toInt(params.id, 'id');
  const result = getDb().prepare('DELETE FROM habit_entries WHERE id = ?').run(entryId);
  if (!result.changes) return fail(res, 404, 'Entry not found');
  return ok(res, { deleted: true });
}

module.exports = {
  listEntries,
  createEntry,
  updateEntry,
  deleteEntry,
};
