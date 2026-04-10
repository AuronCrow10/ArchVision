import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../utils/db.js';
import { signAccess, signRefresh, verifyRefresh, refreshExpiresAt } from '../utils/jwt.js';

const RegisterSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(8).max(128),
});

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// ── Register ──────────────────────────────────────────────────────────────────
export async function register(req, res, next) {
  try {
    const { name, email, password } = RegisterSchema.parse(req.body);

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at',
      [name, email, hashed]
    );

    const user = result.rows[0];
    const accessToken  = signAccess({ id: user.id, email: user.email, role: user.role });
    const refreshToken = signRefresh({ id: user.id });

    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, refreshExpiresAt()]
    );

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken  = signAccess({ id: user.id, email: user.email, role: user.role });
    const refreshToken = signRefresh({ id: user.id });

    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, refreshExpiresAt()]
    );

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

// ── Refresh ───────────────────────────────────────────────────────────────────
export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

    // Verify signature
    let payload;
    try { payload = verifyRefresh(refreshToken); }
    catch { return res.status(401).json({ error: 'Invalid refresh token' }); }

    // Check DB
    const stored = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );
    if (!stored.rows.length) return res.status(401).json({ error: 'Refresh token revoked or expired' });

    // Rotate
    await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

    const userResult = await query('SELECT id, email, role FROM users WHERE id = $1', [payload.id]);
    const user = userResult.rows[0];

    const newAccess  = signAccess({ id: user.id, email: user.email, role: user.role });
    const newRefresh = signRefresh({ id: user.id });

    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, newRefresh, refreshExpiresAt()]
    );

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

// ── Me ────────────────────────────────────────────────────────────────────────
export async function me(req, res, next) {
  try {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}
