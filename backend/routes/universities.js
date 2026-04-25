const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { authenticate, requireAdmin, requireModerator } = require('../middleware/auth');

// GET /api/universities
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM universities ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/universities/:id/departments
router.get('/:id/departments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM departments WHERE university_id = $1 ORDER BY name',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/universities/departments/all
router.get('/departments/all', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, u.name as university_name, u.code as university_code
      FROM departments d
      JOIN universities u ON d.university_id = u.id
      ORDER BY u.name, d.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/universities (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code required' });
    const result = await pool.query(
      'INSERT INTO universities (name, code) VALUES ($1, $2) RETURNING *',
      [name, code.toUpperCase()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'University code already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/universities/:id/departments (admin/moderator)
router.post('/:id/departments', authenticate, requireModerator, async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code required' });
    const result = await pool.query(
      'INSERT INTO departments (name, code, university_id) VALUES ($1, $2, $3) RETURNING *',
      [name, code.toUpperCase(), req.params.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Department code already exists for this university' });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/universities/departments/:id (admin only)
router.delete('/departments/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM departments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
