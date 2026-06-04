const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('./db');

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

function toTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || null,
    dueDate: row.due_date || null,
    completed: row.completed === 1,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function nowISO() {
  return new Date().toISOString();
}

function validateTask(body, requireTitle = true) {
  const errors = [];
  if (requireTitle && (!body.title || !body.title.trim())) {
    errors.push('title is required and cannot be empty');
  }
  if (body.title && body.title.trim().length > 200) {
    errors.push('title must be 200 characters or fewer');
  }
  if (body.dueDate && isNaN(Date.parse(body.dueDate))) {
    errors.push('dueDate must be a valid ISO date string');
  }
  return errors;
}

// ── GET /api/tasks ────────────────────────────────────────────────────────────
// Query params: status (all|active|completed), search (string)
router.get('/', (req, res) => {
  const db = getDb();
  const { status = 'all', search = '' } = req.query;

  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  if (status === 'active') {
    sql += ' AND completed = 0';
  } else if (status === 'completed') {
    sql += ' AND completed = 1';
  }

  if (search.trim()) {
    sql += ' AND title LIKE ?';
    params.push(`%${search.trim()}%`);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);
  const tasks = rows.map(toTask);

  // Summary counts (always based on all tasks, ignoring filters)
  const { active, completed } = db
    .prepare('SELECT SUM(CASE WHEN completed=0 THEN 1 ELSE 0 END) AS active, SUM(CASE WHEN completed=1 THEN 1 ELSE 0 END) AS completed FROM tasks')
    .get();

  res.json({
    tasks,
    summary: {
      active: active || 0,
      completed: completed || 0,
      total: (active || 0) + (completed || 0),
    },
  });
});

// ── GET /api/tasks/:id ────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Task not found' });
  res.json(toTask(row));
});

// ── POST /api/tasks ───────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const errors = validateTask(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const db = getDb();
  const now = nowISO();
  const id = uuidv4();

  // Position: add to end of list (visually "top" since we sort desc by created_at)
  const { maxPos } = db.prepare('SELECT COALESCE(MAX(position), 0) AS maxPos FROM tasks').get();

  db.prepare(`
    INSERT INTO tasks (id, title, description, due_date, completed, position, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, ?, ?, ?)
  `).run(
    id,
    req.body.title.trim(),
    req.body.description?.trim() || null,
    req.body.dueDate || null,
    maxPos + 1,
    now,
    now
  );

  const task = toTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
  res.status(201).json(task);
});

// ── PATCH /api/tasks/:id ──────────────────────────────────────────────────────
router.patch('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const errors = validateTask(req.body, false);
  if (errors.length) return res.status(400).json({ errors });

  const fields = [];
  const values = [];

  if (req.body.title !== undefined) {
    if (!req.body.title.trim()) return res.status(400).json({ errors: ['title cannot be empty'] });
    fields.push('title = ?');
    values.push(req.body.title.trim());
  }
  if (req.body.description !== undefined) {
    fields.push('description = ?');
    values.push(req.body.description?.trim() || null);
  }
  if (req.body.dueDate !== undefined) {
    fields.push('due_date = ?');
    values.push(req.body.dueDate || null);
  }
  if (req.body.completed !== undefined) {
    fields.push('completed = ?');
    values.push(req.body.completed ? 1 : 0);
  }
  if (req.body.position !== undefined) {
    fields.push('position = ?');
    values.push(req.body.position);
  }

  if (!fields.length) return res.status(400).json({ errors: ['No updatable fields provided'] });

  fields.push('updated_at = ?');
  values.push(nowISO());
  values.push(req.params.id);

  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  const updated = toTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
  res.json(updated);
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

// ── PATCH /api/tasks/reorder (bulk position update) ──────────────────────────
router.patch('/bulk/reorder', (req, res) => {
  const { order } = req.body; // array of { id, position }
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array' });

  const db = getDb();
  const updateStmt = db.prepare('UPDATE tasks SET position = ?, updated_at = ? WHERE id = ?');
  const now = nowISO();

  const reorderAll = db.transaction(() => {
    for (const item of order) {
      updateStmt.run(item.position, now, item.id);
    }
  });

  reorderAll();
  res.json({ success: true });
});

module.exports = router;
