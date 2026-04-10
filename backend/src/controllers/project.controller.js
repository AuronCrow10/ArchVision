import { z } from 'zod';
import { query } from '../utils/db.js';

const ProjectSchema = z.object({
  name:        z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export async function listProjects(req, res, next) {
  try {
    const result = await query(
      `SELECT p.*, COUNT(r.id)::int AS render_count
       FROM projects p
       LEFT JOIN renders r ON r.project_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
}

export async function createProject(req, res, next) {
  try {
    const { name, description } = ProjectSchema.parse(req.body);
    const result = await query(
      'INSERT INTO projects (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, name, description ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

export async function getProject(req, res, next) {
  try {
    const result = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

export async function updateProject(req, res, next) {
  try {
    const { name, description } = ProjectSchema.parse(req.body);
    const result = await query(
      `UPDATE projects SET name=$1, description=$2, updated_at=NOW()
       WHERE id=$3 AND user_id=$4 RETURNING *`,
      [name, description ?? null, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

export async function deleteProject(req, res, next) {
  try {
    const result = await query(
      'DELETE FROM projects WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) { next(err); }
}
