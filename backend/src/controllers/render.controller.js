import path from 'path';
import { z } from 'zod';
import { query } from '../utils/db.js';
import { compositeImages, prepareCleanProspetto } from '../services/composite.service.js';
import { renderWithFlux } from '../services/fal.service.js';
import { getRenderCatalog as loadRenderCatalog } from '../services/renderCatalog.service.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const DEFAULT_LOCATION_DESCRIPTION = 'Use the exact existing location visible in the input image; keep background, camera viewpoint, perspective, framing, and horizon unchanged.';
const DEFAULT_EXTRA_NOTES = 'Preserve exact building footprint, position, scale, perspective, and framing. Do not move, resize, rotate, or alter massing/opening layout. Only improve realism of the existing overlay.';

const CompositeParamsSchema = z.object({
  x:       z.coerce.number(),
  y:       z.coerce.number(),
  width:   z.coerce.number().positive(),
  height:  z.coerce.number().positive(),
  opacity: z.coerce.number().min(0).max(1).default(0.92),
  preparedOverlayPath: z.string().trim().min(1).optional(),
  cleanup: z.object({
    enabled: z.coerce.boolean().default(true),
    lineThreshold: z.coerce.number().min(80).max(245).default(188),
    fillOpacity: z.coerce.number().min(0.35).max(1).default(0.86),
    lineStrength: z.coerce.number().int().min(1).max(3).default(1),
  }).optional(),
});

const CleanupPreviewSchema = z.object({
  cleanup: z.object({
    enabled: z.coerce.boolean().default(true),
    lineThreshold: z.coerce.number().min(80).max(245).default(188),
    fillOpacity: z.coerce.number().min(0.35).max(1).default(0.86),
    lineStrength: z.coerce.number().int().min(1).max(3).default(1),
  }).optional(),
});

const RenderParamsSchema = z.object({
  materials:           z.string().max(200).optional().default('Concrete & Glass'),
  colors:              z.string().max(200).default(''),
  style:               z.string().max(200).default('Modern Contemporary'),
  lighting:            z.string().max(200).default('Golden Hour'),
  season:              z.string().max(100).default('Summer'),
  elementSpecs:        z.array(z.object({
    elementId: z.string().min(1).max(100),
    material: z.string().min(1).max(100),
    application: z.string().min(1).max(100),
    color: z.string().max(140).default(''),
    mask: z.object({
      key: z.string().max(100),
      mode: z.enum(['planned']).default('planned'),
    }).optional(),
  })).optional(),
  maskPlan:            z.object({
    mode: z.enum(['planned_manual_masks', 'planned_auto_masks', 'none']).default('planned_manual_masks'),
    version: z.coerce.number().int().min(1).max(1).default(1),
  }).optional(),
  locationDescription: z.string().max(500).default(DEFAULT_LOCATION_DESCRIPTION),
  extra:               z.string().max(500).default(DEFAULT_EXTRA_NOTES),
});

function getCompatibleApplications(element, materialCode, materialApplicationMap) {
  const elementApplications = element?.allowedApplicationCodes || [];
  const materialApplications = materialApplicationMap[materialCode] || [];
  const materialSet = new Set(materialApplications);
  return elementApplications.filter((applicationCode) => materialSet.has(applicationCode));
}

function buildCatalogMaps(catalog) {
  const elements = Array.isArray(catalog?.elements) ? catalog.elements : [];
  const materials = Array.isArray(catalog?.materials) ? catalog.materials : [];
  const applications = Array.isArray(catalog?.applications) ? catalog.applications : [];
  const materialApplications = Array.isArray(catalog?.materialApplications) ? catalog.materialApplications : [];

  return {
    elementMap: Object.fromEntries(elements.map((element) => [element.code, element])),
    materialMap: Object.fromEntries(materials.map((material) => [material.code, material])),
    applicationMap: Object.fromEntries(applications.map((application) => [application.code, application])),
    materialApplicationMap: Object.fromEntries(materialApplications.map((relation) => [relation.materialCode, relation.applicationCodes || []])),
  };
}

function normalizeElementSpecs(rawSpecs = [], catalog) {
  const incoming = Array.isArray(rawSpecs) ? rawSpecs : [];
  const seen = new Set();
  const normalized = [];
  const { elementMap, materialMap, applicationMap, materialApplicationMap } = buildCatalogMaps(catalog);

  for (const current of incoming) {
    const elementId = current?.elementId;
    const element = elementMap[elementId];
    if (!element || seen.has(elementId)) continue;
    seen.add(elementId);

    const allowedMaterials = element.allowedMaterialCodes || [];
    const fallbackMaterial = allowedMaterials.includes(element.defaultMaterialCode)
      ? element.defaultMaterialCode
      : allowedMaterials[0];
    const material = allowedMaterials.includes(current.material) && materialMap[current.material]
      ? current.material
      : fallbackMaterial;
    if (!material) continue;

    const compatibleApplications = getCompatibleApplications(element, material, materialApplicationMap);
    const fallbackApplication = compatibleApplications.includes(element.defaultApplicationCode)
      ? element.defaultApplicationCode
      : compatibleApplications[0];
    const application = compatibleApplications.includes(current.application) && applicationMap[current.application]
      ? current.application
      : fallbackApplication || element.defaultApplicationCode;
    if (!application) continue;

    const color = typeof current.color === 'string' ? current.color.slice(0, 140) : '';
    const maskKey =
      typeof current?.mask?.key === 'string' && current.mask.key.trim()
        ? current.mask.key.trim()
        : `mask_${elementId}`;

    normalized.push({
      elementId,
      material,
      application,
      color,
      mask: {
        key: maskKey,
        mode: 'planned',
      },
    });
  }

  return normalized;
}

function mapMaterialCodesToLabels(materialCodes, catalog) {
  const materialMap = Object.fromEntries((catalog?.materials || []).map((material) => [material.code, material.label || material.code]));
  return [...new Set(materialCodes.map((code) => materialMap[code] || code).filter(Boolean))];
}

function normalizeRenderParams(rawParams, catalog) {
  const parsed = RenderParamsSchema.parse(rawParams);
  const normalizedElementSpecs = normalizeElementSpecs(parsed.elementSpecs, catalog);
  const uniqueMaterials = mapMaterialCodesToLabels(normalizedElementSpecs.map((spec) => spec.material), catalog);
  return {
    ...parsed,
    materials: uniqueMaterials.slice(0, 3).join(', ') || parsed.materials || 'Custom Elements',
    elementSpecs: normalizedElementSpecs,
    maskPlan: {
      mode: parsed?.maskPlan?.mode || 'planned_manual_masks',
      version: 1,
    },
  };
}

export async function getRenderCatalog(req, res, next) {
  try {
    const catalog = await loadRenderCatalog();
    res.json(catalog);
  } catch (err) {
    next(err);
  }
}

// ── List renders (for a project or all user renders) ──────────────────────────
export async function listRenders(req, res, next) {
  try {
    const { projectId } = req.query;
    let sql = `SELECT * FROM renders WHERE user_id = $1`;
    const params = [req.user.id];

    if (projectId) {
      sql += ` AND project_id = $2`;
      params.push(projectId);
    }

    sql += ` ORDER BY created_at DESC`;
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) { next(err); }
}

// ── Get single render ─────────────────────────────────────────────────────────
export async function getRender(req, res, next) {
  try {
    const result = await query(
      'SELECT * FROM renders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Render not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

// ── Step 1: Upload files ───────────────────────────────────────────────────────
// POST /api/renders/upload
// multipart: prospetto (file), location (file), project_id (field)
export async function uploadFiles(req, res, next) {
  try {
    const { project_id } = req.body;
    if (!project_id) return res.status(400).json({ error: 'project_id is required' });

    // Verify project belongs to user
    const proj = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [project_id, req.user.id]
    );
    if (!proj.rows.length) return res.status(404).json({ error: 'Project not found' });

    const prospettoFile = req.files?.prospetto?.[0];
    const locationFile  = req.files?.location?.[0];

    if (!prospettoFile || !locationFile) {
      return res.status(400).json({ error: 'Both prospetto and location images are required' });
    }

    const prospettoPath = path.relative(UPLOAD_DIR, prospettoFile.path);
    const locationPath  = path.relative(UPLOAD_DIR, locationFile.path);

    const result = await query(
      `INSERT INTO renders (project_id, user_id, prospetto_path, location_path, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [project_id, req.user.id, prospettoPath, locationPath]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

// ── Step 2: Run compositing ───────────────────────────────────────────────────
// POST /api/renders/:id/composite
export async function runComposite(req, res, next) {
  try {
    const renderResult = await query(
      'SELECT * FROM renders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!renderResult.rows.length) return res.status(404).json({ error: 'Render not found' });

    const render = renderResult.rows[0];
    if (!render.prospetto_path || !render.location_path) {
      return res.status(400).json({ error: 'Files not uploaded yet' });
    }

    const compositeParams = CompositeParamsSchema.parse(req.body);

    // Persist params
    await query(
      `UPDATE renders SET status='compositing', composite_params=$1, updated_at=NOW() WHERE id=$2`,
      [JSON.stringify(compositeParams), render.id]
    );

    const locationAbs  = path.join(UPLOAD_DIR, render.location_path);
    const prospettoAbs = path.join(UPLOAD_DIR, render.prospetto_path);

    let compositePath;
    try {
      compositePath = await compositeImages(locationAbs, prospettoAbs, compositeParams, req.user.id);
    } catch (err) {
      await query(
        `UPDATE renders SET status='error', error_message=$1, updated_at=NOW() WHERE id=$2`,
        [err.message, render.id]
      );
      return res.status(500).json({ error: 'Compositing failed', detail: err.message });
    }

    await query(
      `UPDATE renders SET status='pending', composite_path=$1, updated_at=NOW() WHERE id=$2`,
      [compositePath, render.id]
    );

    const updated = await query('SELECT * FROM renders WHERE id=$1', [render.id]);
    res.json(updated.rows[0]);
  } catch (err) { next(err); }
}

// ── Cleanup preview asset ──────────────────────────────────────────────────────
// POST /api/renders/:id/cleanup-preview
export async function getCleanupPreview(req, res, next) {
  try {
    const renderResult = await query(
      'SELECT * FROM renders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!renderResult.rows.length) return res.status(404).json({ error: 'Render not found' });

    const render = renderResult.rows[0];
    if (!render.prospetto_path) {
      return res.status(400).json({ error: 'Prospetto not uploaded yet' });
    }

    const { cleanup = {} } = CleanupPreviewSchema.parse(req.body || {});
    const cleanupEnabled = cleanup.enabled !== false;

    if (!cleanupEnabled) {
      return res.json({ preparedOverlayPath: null, preparedOverlayUrl: null });
    }

    const prospettoAbs = path.join(UPLOAD_DIR, render.prospetto_path);
    const preparedOverlayPath = await prepareCleanProspetto(prospettoAbs, cleanup, req.user.id);
    return res.json({
      preparedOverlayPath,
      preparedOverlayUrl: `/uploads/${preparedOverlayPath}`,
    });
  } catch (err) { next(err); }
}

// ── Step 3: Run AI render (async) ─────────────────────────────────────────────
// POST /api/renders/:id/generate
export async function runGenerate(req, res, next) {
  try {
    const renderResult = await query(
      'SELECT * FROM renders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!renderResult.rows.length) return res.status(404).json({ error: 'Render not found' });

    const render = renderResult.rows[0];
    if (!render.composite_path) {
      return res.status(400).json({ error: 'Composite not ready. Run /composite first.' });
    }
    if (render.status === 'rendering') {
      return res.status(409).json({ error: 'Render already in progress' });
    }

    const catalog = await loadRenderCatalog();
    const renderParams = normalizeRenderParams(req.body, catalog);

    await query(
      `UPDATE renders SET status='rendering', render_params=$1, updated_at=NOW() WHERE id=$2`,
      [JSON.stringify(renderParams), render.id]
    );

    // Respond immediately — generation happens in background
    res.json({ message: 'Render started', renderId: render.id });

    // ── Background generation ─────────────────────────────────────────────
    const compositeAbs = path.join(UPLOAD_DIR, render.composite_path);
    renderWithFlux(compositeAbs, renderParams, req.user.id)
      .then(async (resultPath) => {
        await query(
          `UPDATE renders SET status='done', result_path=$1, updated_at=NOW() WHERE id=$2`,
          [resultPath, render.id]
        );
      })
      .catch(async (err) => {
        console.error('[render] replicate error:', err);
        await query(
          `UPDATE renders SET status='error', error_message=$1, updated_at=NOW() WHERE id=$2`,
          [err.message, render.id]
        );
      });
  } catch (err) { next(err); }
}

// ── Delete render ─────────────────────────────────────────────────────────────
export async function deleteRender(req, res, next) {
  try {
    const result = await query(
      'DELETE FROM renders WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Render not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) { next(err); }
}
