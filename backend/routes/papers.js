const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/pool');
const { authenticate, requireModerator, requireAdmin } = require('../middleware/auth');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  }
});

// GET /api/papers - list with filters
router.get('/', async (req, res) => {
  try {
    const { university_id, department_id, semester, year, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let conditions = ['p.is_published = true'];
    let params = [];
    let paramIdx = 1;

    if (university_id) { conditions.push(`p.university_id = $${paramIdx++}`); params.push(university_id); }
    if (department_id) { conditions.push(`p.department_id = $${paramIdx++}`); params.push(department_id); }
    if (semester) { conditions.push(`p.semester = $${paramIdx++}`); params.push(parseInt(semester)); }
    if (year) { conditions.push(`p.year = $${paramIdx++}`); params.push(parseInt(year)); }
    if (search) {
      conditions.push(`(p.title ILIKE $${paramIdx++} OR s.name ILIKE $${paramIdx - 1})`);
      params.push(`%${search}%`);
    }

    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM papers p
       LEFT JOIN subjects s ON p.subject_id = s.id
       ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT p.id, p.title, p.semester, p.year, p.file_name, p.file_size, p.download_count, p.created_at,
              u.name as university_name, u.code as university_code,
              d.name as department_name, d.code as department_code,
              s.name as subject_name, s.code as subject_code
       FROM papers p
       LEFT JOIN universities u ON p.university_id = u.id
       LEFT JOIN departments d ON p.department_id = d.id
       LEFT JOIN subjects s ON p.subject_id = s.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      papers: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/papers/admin - all papers including unpublished (auth)
router.get('/admin', authenticate, requireModerator, async (req, res) => {
  try {
    const { university_id, department_id, semester, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let conditions = [];
    let params = [];
    let paramIdx = 1;

    if (university_id) { conditions.push(`p.university_id = $${paramIdx++}`); params.push(university_id); }
    if (department_id) { conditions.push(`p.department_id = $${paramIdx++}`); params.push(department_id); }
    if (semester) { conditions.push(`p.semester = $${paramIdx++}`); params.push(parseInt(semester)); }

    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await pool.query(
      `SELECT p.id, p.title, p.semester, p.year, p.file_name, p.file_size, p.download_count,
              p.is_published, p.created_at,
              u.name as university_name, u.code as university_code,
              d.name as department_name, d.code as department_code,
              s.name as subject_name, us.username as uploaded_by
       FROM papers p
       LEFT JOIN universities u ON p.university_id = u.id
       LEFT JOIN departments d ON p.department_id = d.id
       LEFT JOIN subjects s ON p.subject_id = s.id
       LEFT JOIN users us ON p.uploaded_by = us.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, parseInt(limit), offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM papers p ${whereClause}`,
      params
    );

    res.json({
      papers: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/papers - upload paper
router.post('/', authenticate, requireModerator, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });

    const { title, university_id, department_id, subject_id, semester, year } = req.body;
    if (!title || !university_id || !department_id || !semester || !year) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Title, university, department, semester and year are required' });
    }

    const result = await pool.query(
      `INSERT INTO papers (title, university_id, department_id, subject_id, semester, year, file_path, file_name, file_size, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, university_id, department_id, subject_id || null, parseInt(semester), parseInt(year),
       req.file.path, req.file.originalname, req.file.size, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/papers/:id/preview - stream PDF for preview
router.get('/:id/preview', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT file_path, file_name FROM papers WHERE id = $1 AND is_published = true',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Paper not found' });

    const { file_path, file_name } = result.rows[0];
    if (!fs.existsSync(file_path)) return res.status(404).json({ error: 'File not found on server' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${file_name}"`);
    fs.createReadStream(file_path).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/papers/:id/download
router.get('/:id/download', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT file_path, file_name FROM papers WHERE id = $1 AND is_published = true',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Paper not found' });

    const { file_path, file_name } = result.rows[0];
    if (!fs.existsSync(file_path)) return res.status(404).json({ error: 'File not found' });

    // Increment download count
    await pool.query('UPDATE papers SET download_count = download_count + 1 WHERE id = $1', [req.params.id]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
    fs.createReadStream(file_path).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/papers/:id/toggle - toggle published
router.patch('/:id/toggle', authenticate, requireModerator, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE papers SET is_published = NOT is_published, updated_at = NOW() WHERE id = $1 RETURNING id, is_published',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Paper not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/papers/:id
router.delete('/:id', authenticate, requireModerator, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM papers WHERE id = $1 RETURNING file_path', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Paper not found' });

    const filePath = result.rows[0].file_path;
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: 'Paper deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/papers/subjects - get subjects for a department
router.get('/subjects/list', async (req, res) => {
  try {
    const { department_id, semester } = req.query;
    let conditions = [];
    let params = [];
    let idx = 1;

    if (department_id) { conditions.push(`department_id = $${idx++}`); params.push(department_id); }
    if (semester) { conditions.push(`semester = $${idx++}`); params.push(parseInt(semester)); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const result = await pool.query(`SELECT * FROM subjects ${where} ORDER BY name`, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/papers/subjects - add subject
router.post('/subjects', authenticate, requireModerator, async (req, res) => {
  try {
    const { name, code, department_id, semester } = req.body;
    if (!name || !department_id) return res.status(400).json({ error: 'Name and department required' });
    const result = await pool.query(
      'INSERT INTO subjects (name, code, department_id, semester) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, code || null, department_id, semester ? parseInt(semester) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
