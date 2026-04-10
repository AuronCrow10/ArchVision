import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { getRenderCatalog } from './renderCatalog.service.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_API_BASE = 'https://api.replicate.com/v1';
const REPLICATE_MODEL_OWNER = 'black-forest-labs';
const REPLICATE_MODEL_NAME = 'flux-kontext-pro';
const REPLICATE_POLL_INTERVAL_MS = Number(process.env.REPLICATE_POLL_INTERVAL_MS || 2000);
const REPLICATE_POLL_TIMEOUT_MS = Number(process.env.REPLICATE_POLL_TIMEOUT_MS || 240000);
const REPLICATE_SEED = process.env.REPLICATE_SEED ? Number(process.env.REPLICATE_SEED) : null;
const DEFAULT_LOCATION_DESCRIPTION = 'Use the exact existing location visible in the input image; keep background, camera viewpoint, perspective, framing, and horizon unchanged.';
const DEFAULT_EXTRA_NOTES = 'Preserve exact building footprint, position, scale, perspective, and framing. Do not move, resize, rotate, or alter massing/opening layout. Only improve realism of the existing overlay.';

const LEGACY_MATERIAL_PROFILES = {
  'Concrete & Glass': 'board-formed or smooth concrete surfaces, realistic concrete micro-texture, clean glass panes, and dark metal frame detailing',
  'Brick & Steel': 'masonry brick facade rhythm, visible brick joints, structural steel accents, and robust industrial edge detailing',
  'Wood & Stone': 'natural timber cladding and grain behavior, stone base or accent planes, and tactile organic material transitions',
  'Marble & Brass': 'polished or honed marble panel behavior with stone veining cues, brushed brass trims and refined premium detailing',
  'Weathered Steel': 'weathered corten-like steel patina behavior, oxidized tonal variation, and industrial matte metallic character',
  'White Render': 'rendered plaster facade behavior, smooth mineral finish, subtle wall texture, and clean architectural edges',
  'Exposed Concrete': 'exposed cast-in-place concrete character, formwork imprint logic, subtle staining variation, and structural rawness',
  'Timber Frame': 'dominant timber frame expression, visible wood grain and joinery logic, and warm natural carpentry character',
};

function buildCatalogMaps(catalog) {
  return {
    styles: Object.fromEntries((catalog?.styles || []).map((item) => [item.value, item])),
    lightings: Object.fromEntries((catalog?.lightings || []).map((item) => [item.value, item])),
    seasons: Object.fromEntries((catalog?.seasons || []).map((item) => [item.value, item])),
    materials: Object.fromEntries((catalog?.materials || []).map((item) => [item.code, item])),
    applications: Object.fromEntries((catalog?.applications || []).map((item) => [item.code, item])),
    elements: Object.fromEntries((catalog?.elements || []).map((item) => [item.code, item])),
    materialApplications: Object.fromEntries((catalog?.materialApplications || []).map((item) => [item.materialCode, item.applicationCodes || []])),
  };
}

function getCompatibleApplications(element, materialCode, materialApplications) {
  const allowedByElement = element?.allowedApplicationCodes || [];
  const allowedByMaterial = materialApplications[materialCode] || [];
  const materialSet = new Set(allowedByMaterial);
  return allowedByElement.filter((applicationCode) => materialSet.has(applicationCode));
}

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download result image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buffer);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/png';
}

function fileToDataUri(filePath) {
  const mimeType = getMimeType(filePath);
  const base64 = readFileSync(filePath).toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

async function readErrorBody(res) {
  const text = await res.text();
  if (!text) return res.statusText || 'Unknown error';

  try {
    const parsed = JSON.parse(text);
    return parsed?.detail || parsed?.error || parsed?.title || text;
  } catch {
    return text;
  }
}

async function createPrediction(input) {
  const res = await fetch(
    `${REPLICATE_API_BASE}/models/${REPLICATE_MODEL_OWNER}/${REPLICATE_MODEL_NAME}/predictions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=60',
      },
      body: JSON.stringify({ input }),
    }
  );

  if (!res.ok) {
    const detail = await readErrorBody(res);
    throw new Error(`replicate create prediction failed (${res.status}): ${detail}`);
  }

  return res.json();
}

async function fetchPrediction(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
  });

  if (!res.ok) {
    const detail = await readErrorBody(res);
    throw new Error(`replicate prediction fetch failed (${res.status}): ${detail}`);
  }

  return res.json();
}

async function waitForPrediction(initialPrediction) {
  let prediction = initialPrediction;
  const deadline = Date.now() + REPLICATE_POLL_TIMEOUT_MS;

  while (!['succeeded', 'failed', 'canceled'].includes(prediction?.status)) {
    if (Date.now() > deadline) {
      throw new Error(`replicate prediction timed out after ${REPLICATE_POLL_TIMEOUT_MS}ms`);
    }

    const statusUrl = prediction?.urls?.get || `${REPLICATE_API_BASE}/predictions/${prediction?.id}`;
    await sleep(REPLICATE_POLL_INTERVAL_MS);
    prediction = await fetchPrediction(statusUrl);
  }

  if (prediction.status !== 'succeeded') {
    throw new Error(`replicate render failed (${prediction.status}): ${prediction?.error || 'unknown error'}`);
  }

  return prediction;
}

function extractOutputUrl(output) {
  if (!output) return null;
  if (typeof output === 'string') return output;

  if (Array.isArray(output) && output.length > 0) {
    const first = output[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && typeof first.url === 'string') return first.url;
  }

  if (typeof output === 'object') {
    if (typeof output.url === 'string') return output.url;
    if (typeof output.href === 'string') return output.href;
  }

  return null;
}

function normalizeElementSpecsForPrompt(elementSpecs, catalog) {
  const incoming = Array.isArray(elementSpecs) ? elementSpecs : [];
  const seen = new Set();
  const normalized = [];
  const maps = buildCatalogMaps(catalog);

  for (const current of incoming) {
    const elementId = current?.elementId;
    const element = maps.elements[elementId];
    if (!element || seen.has(elementId)) continue;
    seen.add(elementId);

    const allowedMaterials = element.allowedMaterialCodes || [];
    const fallbackMaterial = allowedMaterials.includes(element.defaultMaterialCode)
      ? element.defaultMaterialCode
      : allowedMaterials[0];
    const materialCode = allowedMaterials.includes(current?.material) ? current.material : fallbackMaterial;
    if (!materialCode) continue;

    const compatibleApplications = getCompatibleApplications(element, materialCode, maps.materialApplications);
    const fallbackApplication = compatibleApplications.includes(element.defaultApplicationCode)
      ? element.defaultApplicationCode
      : compatibleApplications[0];
    const applicationCode = compatibleApplications.includes(current?.application)
      ? current.application
      : fallbackApplication;
    if (!applicationCode) continue;

    const color = typeof current?.color === 'string' ? current.color.trim() : '';
    const maskKey =
      typeof current?.mask?.key === 'string' && current.mask.key.trim()
        ? current.mask.key.trim()
        : `mask_${elementId}`;

    normalized.push({
      elementId,
      elementLabel: element.promptLabel || element.label || elementId,
      materialCode,
      materialLabel: maps.materials[materialCode]?.label || materialCode,
      materialDescription: maps.materials[materialCode]?.promptDescription || `${materialCode} behavior with realistic texture and detailing`,
      applicationCode,
      applicationLabel: maps.applications[applicationCode]?.label || applicationCode,
      applicationDescription: maps.applications[applicationCode]?.promptDescription || `${applicationCode} application logic for this element`,
      color,
      maskKey,
    });
  }

  return normalized;
}

function buildElementInstructionLines(elementSpecs) {
  if (!elementSpecs.length) {
    return ['No specific element overrides provided; apply a coherent realistic facade treatment.'];
  }

  return elementSpecs.map((spec) => {
    const colorPart = spec.color
      ? `Target color for this element (high priority): ${spec.color}. Apply this as the dominant final visible color while preserving the selected material behavior.`
      : 'No explicit element color provided; use a plausible default hue for the selected material.';

    return `Element "${spec.elementLabel}" (future mask key: ${spec.maskKey}): base material "${spec.materialLabel}" [${spec.materialCode}]. Application system "${spec.applicationLabel}" [${spec.applicationCode}]. Surface behavior requirements: ${spec.materialDescription}. Application behavior requirements: ${spec.applicationDescription}. ${colorPart}`;
  });
}

function resolveDisplayValue(rawValue, map) {
  if (!rawValue) return rawValue;
  return map[rawValue]?.value || rawValue;
}

function buildPrompt(renderParams, catalog) {
  const {
    materials = 'Concrete & Glass',
    colors = '',
    style = 'Modern Contemporary',
    lighting = 'Golden Hour',
    season = 'Summer',
    elementSpecs = [],
    locationDescription = '',
    extra = '',
  } = renderParams;

  const normalizedLocation = String(locationDescription || '').trim() || DEFAULT_LOCATION_DESCRIPTION;
  const normalizedExtra = String(extra || '').trim() || DEFAULT_EXTRA_NOTES;
  const normalizedColors = String(colors || '').trim();
  const maps = buildCatalogMaps(catalog);
  const normalizedElementSpecs = normalizeElementSpecsForPrompt(elementSpecs, catalog);
  const hasElementSpecs = normalizedElementSpecs.length > 0;
  const legacyMaterialProfile =
    LEGACY_MATERIAL_PROFILES[materials] || `${materials} facade behavior with realistic texture and detailing`;
  const elementInstructionLines = buildElementInstructionLines(normalizedElementSpecs);
  const styleValue = resolveDisplayValue(style, maps.styles);
  const lightingValue = resolveDisplayValue(lighting, maps.lightings);
  const seasonValue = resolveDisplayValue(season, maps.seasons);

  return [
    'Edit the input image into a photorealistic architectural render.',
    'Keep unchanged: exact building footprint, width, height, roofline, window positions, door positions, and balcony positions.',
    'Keep unchanged: exact building placement, scale, camera viewpoint, framing, horizon, perspective, and the original location background.',
    'Do not move, resize, rotate, or redesign the massing of the building.',
    'Only convert the white sketch overlay into a realistic built house while preserving geometry.',
    `Style: ${styleValue}.`,
    hasElementSpecs
      ? 'Element-level material map (mask-ready prompt schema):'
      : `Legacy materials input detected: ${materials}.`,
    ...elementInstructionLines,
    hasElementSpecs ? '' : `Material realization requirements: ${legacyMaterialProfile}.`,
    normalizedColors ? `Legacy global color note (low priority): ${normalizedColors}.` : '',
    'Color authority rule: when an element has an explicit color, that color must be clearly visible as the final dominant color of that element.',
    'Material rule: material choice controls intrinsic texture, roughness, and reflectance or specular response.',
    'Application rule: application choice controls construction language such as panelization, cladding orientation, joints, profiles, and guard layout.',
    'Do not preserve the base hue of the raw material when an explicit element color is provided.',
    'If needed, interpret color as paint, coating, or stain for opaque materials and as tint or film for glazing while keeping physically plausible optics.',
    'Priority rule: geometry and location constraints first, then element-level color targets, then material surface behavior.',
    'Treat each element instruction as region-specific intent. Avoid color and material spillover into non-target elements as much as possible.',
    `Lighting: ${lightingValue}.`,
    `Season and atmosphere: ${seasonValue}.`,
    `Location context details: ${normalizedLocation}.`,
    'Output quality target: realistic facade details, physically plausible shadows, reflections, and contact with the ground.',
    normalizedExtra,
  ].filter(Boolean).join(' ');
}

export async function renderWithFlux(compositeAbsPath, renderParams, userId) {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN is not configured');
  }

  const catalog = await getRenderCatalog();
  const prompt = buildPrompt(renderParams, catalog);
  const inputImage = fileToDataUri(compositeAbsPath);

  const input = {
    prompt,
    input_image: inputImage,
    aspect_ratio: 'match_input_image',
  };

  if (Number.isInteger(REPLICATE_SEED) && REPLICATE_SEED >= 0) {
    input.seed = REPLICATE_SEED;
  }

  const prediction = await createPrediction(input);
  const finalPrediction = await waitForPrediction(prediction);
  const resultUrl = extractOutputUrl(finalPrediction.output);
  if (!resultUrl) throw new Error('replicate returned no output URL');

  const outDir = path.join(UPLOAD_DIR, userId, 'results');
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${uuid()}.png`);
  await downloadImage(resultUrl, outPath);

  return path.relative(UPLOAD_DIR, outPath);
}
