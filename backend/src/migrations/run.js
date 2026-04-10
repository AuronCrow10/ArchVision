import 'dotenv/config';
import { query } from '../utils/db.js';
import { seedDefaultRenderCatalog } from '../services/renderCatalog.service.js';

const migrations = [
  // ── 001 — users ────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    name        TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  )`,

  // ── 002 — refresh tokens ───────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT UNIQUE NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )`,

  // ── 003 — projects ─────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  )`,

  // ── 004 — renders ──────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS renders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','compositing','rendering','done','error')),
    -- Input files (relative paths under /uploads)
    prospetto_path  TEXT,
    location_path   TEXT,
    -- Compositing params (JSON): x, y, width, height, rotation
    composite_params JSONB,
    -- Render params (JSON): materials, colors, style, lighting
    render_params   JSONB,
    -- Output
    composite_path  TEXT,
    result_path     TEXT,
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
  )`,

  // ── 005 — indexes ──────────────────────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_renders_user_id    ON renders(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_renders_project_id ON renders(project_id)`,
  `CREATE INDEX IF NOT EXISTS idx_projects_user_id   ON projects(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)`,

  // -- 006 -- render catalog tables -------------------------------------------
  `CREATE TABLE IF NOT EXISTS render_styles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value       TEXT UNIQUE NOT NULL,
    label       TEXT NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS render_lightings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value       TEXT UNIQUE NOT NULL,
    label       TEXT NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS render_seasons (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value       TEXT UNIQUE NOT NULL,
    label       TEXT NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS render_materials (
    code                TEXT PRIMARY KEY,
    label               TEXT NOT NULL,
    prompt_description  TEXT DEFAULT '',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS render_applications (
    code                TEXT PRIMARY KEY,
    label               TEXT NOT NULL,
    prompt_description  TEXT DEFAULT '',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS render_elements (
    code                      TEXT PRIMARY KEY,
    label                     TEXT NOT NULL,
    prompt_label              TEXT NOT NULL,
    default_material_code     TEXT NOT NULL REFERENCES render_materials(code),
    default_application_code  TEXT NOT NULL REFERENCES render_applications(code),
    default_color             TEXT DEFAULT '',
    is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order                INTEGER NOT NULL DEFAULT 0,
    created_at                TIMESTAMPTZ DEFAULT NOW(),
    updated_at                TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS render_element_materials (
    element_code   TEXT NOT NULL REFERENCES render_elements(code) ON DELETE CASCADE,
    material_code  TEXT NOT NULL REFERENCES render_materials(code) ON DELETE CASCADE,
    PRIMARY KEY (element_code, material_code)
  )`,
  `CREATE TABLE IF NOT EXISTS render_element_applications (
    element_code      TEXT NOT NULL REFERENCES render_elements(code) ON DELETE CASCADE,
    application_code  TEXT NOT NULL REFERENCES render_applications(code) ON DELETE CASCADE,
    PRIMARY KEY (element_code, application_code)
  )`,
  `CREATE TABLE IF NOT EXISTS render_material_applications (
    material_code     TEXT NOT NULL REFERENCES render_materials(code) ON DELETE CASCADE,
    application_code  TEXT NOT NULL REFERENCES render_applications(code) ON DELETE CASCADE,
    PRIMARY KEY (material_code, application_code)
  )`,
];

async function runMigrations() {
  console.log('[migrate] Running migrations…');
  for (const [i, sql] of migrations.entries()) {
    await query(sql);
    console.log(`[migrate] ✓ step ${i + 1}/${migrations.length}`);
  }
  const client = {
    query,
  };
  await seedDefaultRenderCatalog(client);
  console.log('[migrate] ✓ seeded render catalog defaults');
  console.log('[migrate] Done.');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('[migrate] Error:', err);
  process.exit(1);
});
