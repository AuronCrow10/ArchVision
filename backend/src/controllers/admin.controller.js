import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../utils/db.js';
import { getRenderCatalog, saveRenderCatalog } from '../services/renderCatalog.service.js';

const AdminUserCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['user', 'admin']).default('user'),
});

const AdminUserUpdateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
  password: z.string().min(8).max(128).optional(),
});

const AdminProjectSchema = z.object({
  user_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
});

async function countAdmins() {
  const result = await query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'`);
  return result.rows[0]?.count || 0;
}

export async function listUsers(req, res, next) {
  try {
    const result = await query(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        u.updated_at,
        COUNT(DISTINCT p.id)::int AS project_count,
        COUNT(DISTINCT r.id)::int AS render_count
      FROM users u
      LEFT JOIN projects p ON p.user_id = u.id
      LEFT JOIN renders r ON r.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const payload = AdminUserCreateSchema.parse(req.body);
    const existing = await query('SELECT id FROM users WHERE email = $1', [payload.email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [payload.name, payload.email, hashedPassword, payload.role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const payload = AdminUserUpdateSchema.parse(req.body);
    const existing = await query('SELECT id, role FROM users WHERE id = $1', [req.params.id]);
    const currentUser = existing.rows[0];

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentUser.role === 'admin' && payload.role !== 'admin') {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'At least one admin user must remain' });
      }
    }

    const emailConflict = await query(
      'SELECT id FROM users WHERE email = $1 AND id <> $2',
      [payload.email, req.params.id]
    );
    if (emailConflict.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    if (payload.password) {
      const hashedPassword = await bcrypt.hash(payload.password, 12);
      const result = await query(
        `UPDATE users
         SET name = $1, email = $2, role = $3, password = $4, updated_at = NOW()
         WHERE id = $5
         RETURNING id, name, email, role, created_at, updated_at`,
        [payload.name, payload.email, payload.role, hashedPassword, req.params.id]
      );
      return res.json(result.rows[0]);
    }

    const result = await query(
      `UPDATE users
       SET name = $1, email = $2, role = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, email, role, created_at, updated_at`,
      [payload.name, payload.email, payload.role, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const existing = await query('SELECT id, role FROM users WHERE id = $1', [req.params.id]);
    const user = existing.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'At least one admin user must remain' });
      }
    }

    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ deleted: req.params.id });
  } catch (error) {
    next(error);
  }
}

export async function listProjectsAdmin(req, res, next) {
  try {
    const result = await query(
      `SELECT
        p.*,
        u.name AS owner_name,
        u.email AS owner_email,
        COUNT(r.id)::int AS render_count
      FROM projects p
      INNER JOIN users u ON u.id = p.user_id
      LEFT JOIN renders r ON r.project_id = p.id
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

export async function createProjectAdmin(req, res, next) {
  try {
    const payload = AdminProjectSchema.parse(req.body);
    const owner = await query('SELECT id FROM users WHERE id = $1', [payload.user_id]);
    if (!owner.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await query(
      `INSERT INTO projects (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [payload.user_id, payload.name, payload.description ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function updateProjectAdmin(req, res, next) {
  try {
    const payload = AdminProjectSchema.parse(req.body);
    const owner = await query('SELECT id FROM users WHERE id = $1', [payload.user_id]);
    if (!owner.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await query(
      `UPDATE projects
       SET user_id = $1, name = $2, description = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [payload.user_id, payload.name, payload.description ?? null, req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function deleteProjectAdmin(req, res, next) {
  try {
    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ deleted: req.params.id });
  } catch (error) {
    next(error);
  }
}

export async function getRenderCatalogAdmin(req, res, next) {
  try {
    const catalog = await getRenderCatalog({ includeInactive: true });
    res.json(catalog);
  } catch (error) {
    next(error);
  }
}

export async function saveRenderCatalogAdmin(req, res, next) {
  try {
    const catalog = await saveRenderCatalog(req.body);
    res.json(catalog);
  } catch (error) {
    next(error);
  }
}
