import sharp from 'sharp';
import path from 'path';
import { createHash } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const DEFAULT_CLEANUP = {
  enabled: true,
  lineThreshold: 188,
  fillOpacity: 0.86,
  lineStrength: 1,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function dilateBinary(mask, width, height, radius) {
  if (radius <= 0) return mask.slice();

  let current = mask.slice();
  for (let pass = 0; pass < radius; pass += 1) {
    const next = new Uint8Array(mask.length);
    for (let y = 0; y < height; y += 1) {
      const yMin = Math.max(0, y - 1);
      const yMax = Math.min(height - 1, y + 1);
      for (let x = 0; x < width; x += 1) {
        const idx = y * width + x;
        if (!current[idx]) continue;
        for (let ny = yMin; ny <= yMax; ny += 1) {
          const xMin = Math.max(0, x - 1);
          const xMax = Math.min(width - 1, x + 1);
          for (let nx = xMin; nx <= xMax; nx += 1) {
            next[ny * width + nx] = 1;
          }
        }
      }
    }
    current = next;
  }
  return current;
}

function floodReachableBackground(barrier, width, height) {
  const size = width * height;
  const reachable = new Uint8Array(size);
  const queue = new Int32Array(size);
  let head = 0;
  let tail = 0;

  const push = (index) => {
    if (reachable[index] || barrier[index]) return;
    reachable[index] = 1;
    queue[tail] = index;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    push(y * width);
    push(y * width + (width - 1));
  }

  while (head < tail) {
    const idx = queue[head];
    head += 1;
    const y = Math.floor(idx / width);
    const x = idx - y * width;

    if (x > 0) push(idx - 1);
    if (x < width - 1) push(idx + 1);
    if (y > 0) push(idx - width);
    if (y < height - 1) push(idx + width);
  }

  return reachable;
}

function normalizeCleanup(cleanup = {}) {
  return {
    enabled: cleanup.enabled !== false,
    lineThreshold: Math.round(clamp(cleanup.lineThreshold ?? DEFAULT_CLEANUP.lineThreshold, 80, 245)),
    fillOpacity: clamp(cleanup.fillOpacity ?? DEFAULT_CLEANUP.fillOpacity, 0.35, 1),
    lineStrength: Math.round(clamp(cleanup.lineStrength ?? DEFAULT_CLEANUP.lineStrength, 1, 3)),
  };
}

async function applyGlobalOpacity(imageBuffer, opacity) {
  const alphaScale = clamp(opacity, 0, 1);
  if (alphaScale >= 0.999) return imageBuffer;

  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * alphaScale);
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
}

async function buildSimpleOverlay(prospettoPath, width, height, opacity) {
  const resized = await sharp(prospettoPath)
    .resize(width, height, { fit: 'fill' })
    .ensureAlpha()
    .png()
    .toBuffer();

  return applyGlobalOpacity(resized, opacity);
}

async function buildPaperCleanOverlayBase(prospettoPath, cleanup) {
  const normalized = normalizeCleanup(cleanup);
  const { data: grayRaw, info } = await sharp(prospettoPath)
    .rotate()
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const gray = info.channels === 1 ? grayRaw : Buffer.from(grayRaw.filter((_, i) => i % info.channels === 0));
  const pixelCount = info.width * info.height;
  const barrier = new Uint8Array(pixelCount);

  for (let i = 0; i < pixelCount; i += 1) {
    barrier[i] = gray[i] <= normalized.lineThreshold ? 1 : 0;
  }

  const closedBarrier = dilateBinary(barrier, info.width, info.height, 1);
  const reachable = floodReachableBackground(closedBarrier, info.width, info.height);

  let enclosed = new Uint8Array(pixelCount);
  let enclosedCount = 0;
  for (let i = 0; i < pixelCount; i += 1) {
    if (!reachable[i]) {
      enclosed[i] = 1;
      enclosedCount += 1;
    }
  }

  let effectiveLines = normalized.lineStrength > 1
    ? dilateBinary(barrier, info.width, info.height, normalized.lineStrength - 1)
    : barrier;

  if (enclosedCount < Math.max(32, Math.round(pixelCount * 0.002))) {
    const inkMask = new Uint8Array(pixelCount);
    const inkThreshold = Math.min(normalized.lineThreshold + 40, 240);
    for (let i = 0; i < pixelCount; i += 1) {
      inkMask[i] = gray[i] <= inkThreshold ? 1 : 0;
    }
    enclosed = dilateBinary(inkMask, info.width, info.height, 6);
    effectiveLines = normalized.lineStrength > 1
      ? dilateBinary(barrier, info.width, info.height, normalized.lineStrength - 1)
      : barrier;
  }

  const enclosedExpanded = dilateBinary(enclosed, info.width, info.height, 2);
  const keepLines = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i += 1) {
    keepLines[i] = effectiveLines[i] && enclosedExpanded[i] ? 1 : 0;
  }

  const rgba = Buffer.alloc(pixelCount * 4);
  const fillAlpha = Math.round(255 * normalized.fillOpacity);
  const lineAlpha = 255;

  for (let i = 0; i < pixelCount; i += 1) {
    const p = i * 4;

    if (enclosed[i]) {
      rgba[p] = 255;
      rgba[p + 1] = 255;
      rgba[p + 2] = 255;
      rgba[p + 3] = fillAlpha;
    }

    if (keepLines[i]) {
      const v = gray[i];
      rgba[p] = v;
      rgba[p + 1] = v;
      rgba[p + 2] = v;
      rgba[p + 3] = lineAlpha;
    }
  }

  return sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
}

function validatePreparedOverlayPath(preparedOverlayPath, userId) {
  const normalized = preparedOverlayPath.replace(/\\/g, '/');
  if (!normalized.startsWith(`${userId}/prepared/`)) {
    throw new Error('Invalid prepared overlay path');
  }
  return normalized;
}

export async function prepareCleanProspetto(prospettoPath, cleanup, userId) {
  const normalized = normalizeCleanup(cleanup);
  const signature = JSON.stringify({
    prospettoPath,
    lineThreshold: normalized.lineThreshold,
    fillOpacity: normalized.fillOpacity,
    lineStrength: normalized.lineStrength,
  });
  const fileHash = createHash('sha1').update(signature).digest('hex');

  const outDir = path.join(UPLOAD_DIR, userId, 'prepared');
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${fileHash}.png`);

  if (!existsSync(outPath)) {
    const prepared = await buildPaperCleanOverlayBase(prospettoPath, normalized);
    await sharp(prepared).png().toFile(outPath);
  }

  return path.relative(UPLOAD_DIR, outPath).replace(/\\/g, '/');
}

async function buildCleanupOverlayForComposite(prospettoPath, width, height, opacity, cleanup, userId, preparedOverlayPath) {
  let overlayBaseBuffer;

  if (preparedOverlayPath) {
    const safeRel = validatePreparedOverlayPath(preparedOverlayPath, userId);
    const preparedAbs = path.join(UPLOAD_DIR, safeRel);
    if (!existsSync(preparedAbs)) {
      throw new Error('Prepared overlay not found');
    }
    overlayBaseBuffer = await sharp(preparedAbs)
      .resize(width, height, { fit: 'fill' })
      .ensureAlpha()
      .png()
      .toBuffer();
  } else {
    const prepared = await buildPaperCleanOverlayBase(prospettoPath, cleanup);
    overlayBaseBuffer = await sharp(prepared)
      .resize(width, height, { fit: 'fill' })
      .ensureAlpha()
      .png()
      .toBuffer();
  }

  return applyGlobalOpacity(overlayBaseBuffer, opacity);
}

export async function compositeImages(locationPath, prospettoPath, params, userId) {
  const {
    x = 0,
    y = 0,
    width,
    height,
    opacity = 0.92,
    cleanup = {},
    preparedOverlayPath = null,
  } = params;
  const cleanupParams = normalizeCleanup(cleanup);

  const outDir = path.join(UPLOAD_DIR, userId, 'composites');
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${uuid()}.jpg`);

  console.log('[composite] reading location metadata...');
  const locationMeta = await sharp(locationPath).rotate().metadata();
  const locW = locationMeta.width;
  const locH = locationMeta.height;
  console.log('[composite] location size:', locW, 'x', locH);

  // Keep user-provided size exactly as set in editor.
  // Out-of-bounds areas are handled by overlap cropping below.
  const pW = Math.max(1, Math.round(width));
  const pH = Math.max(1, Math.round(height));
  const pX = Math.round(x);
  const pY = Math.round(y);

  console.log('[composite] resizing prospetto to', pW, 'x', pH);

  const prospettoLayer = cleanupParams.enabled
    ? await buildCleanupOverlayForComposite(
      prospettoPath,
      pW,
      pH,
      opacity,
      cleanupParams,
      userId,
      preparedOverlayPath,
    )
    : await buildSimpleOverlay(prospettoPath, pW, pH, opacity);

  console.log('[composite] compositing onto location...');

  const dstX = Math.max(0, pX);
  const dstY = Math.max(0, pY);
  const srcX = Math.max(0, -pX);
  const srcY = Math.max(0, -pY);
  const overlapW = Math.min(pW - srcX, locW - dstX);
  const overlapH = Math.min(pH - srcY, locH - dstY);

  let pipeline = sharp(locationPath).rotate(); // auto-rotate based on EXIF

  if (overlapW > 0 && overlapH > 0) {
    const clippedLayer = await sharp(prospettoLayer)
      .extract({
        left: Math.round(srcX),
        top: Math.round(srcY),
        width: Math.round(overlapW),
        height: Math.round(overlapH),
      })
      .png()
      .toBuffer();

    pipeline = pipeline.composite([{
      input: clippedLayer,
      left: Math.round(dstX),
      top: Math.round(dstY),
      blend: 'over',
    }]);
  } else {
    console.log('[composite] overlay is fully outside location bounds, saving location as-is');
  }

  await pipeline
    .jpeg({ quality: 92 })
    .toFile(outPath);

  console.log('[composite] done:', outPath);
  return path.relative(UPLOAD_DIR, outPath);
}
