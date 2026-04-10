export const LEGACY_MATERIAL_PRESETS = {
  'Concrete & Glass': {
    facade_main: { material: 'Concrete', application: 'cast_in_place' },
    facade_secondary: { material: 'Plaster', application: 'smooth_render' },
    door: { material: 'Steel', application: 'flush_leaf' },
    window_frames: { material: 'Steel', application: 'thin_profiles' },
    railings: { material: 'Steel', application: 'vertical_bars' },
    base_plinth: { material: 'Stone', application: 'solid_base' },
  },
  'Brick & Steel': {
    facade_main: { material: 'Brick', application: 'exposed_brickwork' },
    facade_secondary: { material: 'Brick', application: 'brick_cladding' },
    door: { material: 'Steel', application: 'flush_leaf' },
    window_frames: { material: 'Steel', application: 'boxed_profiles' },
    railings: { material: 'Steel', application: 'vertical_bars' },
    base_plinth: { material: 'Concrete', application: 'solid_base' },
  },
  'Wood & Stone': {
    facade_main: { material: 'Wood', application: 'vertical_cladding' },
    facade_secondary: { material: 'Stone', application: 'dry_stone_cladding' },
    door: { material: 'Wood', application: 'framed_leaf' },
    window_frames: { material: 'Steel', application: 'thin_profiles' },
    railings: { material: 'Steel', application: 'vertical_bars' },
    base_plinth: { material: 'Stone', application: 'solid_base' },
  },
  'Marble & Brass': {
    facade_main: { material: 'Marble', application: 'polished_panels' },
    facade_secondary: { material: 'Plaster', application: 'smooth_render' },
    door: { material: 'Brass', application: 'framed_leaf' },
    window_frames: { material: 'Brass', application: 'boxed_profiles' },
    railings: { material: 'Brass', application: 'vertical_bars' },
    base_plinth: { material: 'Stone', application: 'solid_base' },
  },
  'Weathered Steel': {
    facade_main: { material: 'Steel', application: 'metal_panels' },
    facade_secondary: { material: 'Steel', application: 'perforated_panels' },
    door: { material: 'Steel', application: 'flush_leaf' },
    window_frames: { material: 'Steel', application: 'boxed_profiles' },
    railings: { material: 'Steel', application: 'perforated_guard' },
    base_plinth: { material: 'Concrete', application: 'solid_base' },
  },
  'White Render': {
    facade_main: { material: 'Plaster', application: 'smooth_render' },
    facade_secondary: { material: 'Plaster', application: 'textured_render' },
    door: { material: 'Wood', application: 'flush_leaf' },
    window_frames: { material: 'Steel', application: 'thin_profiles' },
    railings: { material: 'Steel', application: 'vertical_bars' },
    base_plinth: { material: 'Concrete', application: 'solid_base' },
  },
  'Exposed Concrete': {
    facade_main: { material: 'Concrete', application: 'cast_in_place' },
    facade_secondary: { material: 'Concrete', application: 'precast_panels' },
    door: { material: 'Steel', application: 'flush_leaf' },
    window_frames: { material: 'Steel', application: 'thin_profiles' },
    railings: { material: 'Steel', application: 'vertical_bars' },
    base_plinth: { material: 'Concrete', application: 'solid_base' },
  },
  'Timber Frame': {
    facade_main: { material: 'Wood', application: 'board_and_batten' },
    facade_secondary: { material: 'Wood', application: 'vertical_cladding' },
    door: { material: 'Wood', application: 'framed_leaf' },
    window_frames: { material: 'Wood', application: 'boxed_profiles' },
    railings: { material: 'Steel', application: 'vertical_bars' },
    base_plinth: { material: 'Stone', application: 'solid_base' },
  },
};

export const FALLBACK_RENDER_CATALOG = {
  styles: [
    { value: 'Modern Contemporary', label: 'Moderno contemporaneo', isActive: true, sortOrder: 10 },
    { value: 'Minimalist', label: 'Minimalista', isActive: true, sortOrder: 20 },
    { value: 'Brutalist', label: 'Brutalista', isActive: true, sortOrder: 30 },
    { value: 'Art Deco', label: 'Art deco', isActive: true, sortOrder: 40 },
    { value: 'Industrial', label: 'Industriale', isActive: true, sortOrder: 50 },
    { value: 'Scandinavian', label: 'Scandinavo', isActive: true, sortOrder: 60 },
    { value: 'Mediterranean', label: 'Mediterraneo', isActive: true, sortOrder: 70 },
    { value: 'Neoclassical', label: 'Neoclassico', isActive: true, sortOrder: 80 },
  ],
  lightings: [
    { value: 'Golden Hour', label: "Ora d'oro", isActive: true, sortOrder: 10 },
    { value: 'Blue Hour', label: 'Ora blu', isActive: true, sortOrder: 20 },
    { value: 'Midday Sun', label: 'Sole di mezzogiorno', isActive: true, sortOrder: 30 },
    { value: 'Overcast', label: 'Cielo coperto', isActive: true, sortOrder: 40 },
    { value: 'Night with Lighting', label: 'Notte con illuminazione', isActive: true, sortOrder: 50 },
    { value: 'Dramatic Sunset', label: 'Tramonto drammatico', isActive: true, sortOrder: 60 },
    { value: 'Soft Morning', label: 'Mattina morbida', isActive: true, sortOrder: 70 },
  ],
  seasons: [
    { value: 'Summer', label: 'Estate', isActive: true, sortOrder: 10 },
    { value: 'Autumn', label: 'Autunno', isActive: true, sortOrder: 20 },
    { value: 'Winter', label: 'Inverno', isActive: true, sortOrder: 30 },
    { value: 'Spring', label: 'Primavera', isActive: true, sortOrder: 40 },
  ],
  materials: [
    { code: 'Plaster', label: 'Intonaco', promptDescription: '', isActive: true, sortOrder: 10 },
    { code: 'Concrete', label: 'Calcestruzzo', promptDescription: '', isActive: true, sortOrder: 20 },
    { code: 'Brick', label: 'Mattone', promptDescription: '', isActive: true, sortOrder: 30 },
    { code: 'Wood', label: 'Legno', promptDescription: '', isActive: true, sortOrder: 40 },
    { code: 'Stone', label: 'Pietra', promptDescription: '', isActive: true, sortOrder: 50 },
    { code: 'Marble', label: 'Marmo', promptDescription: '', isActive: true, sortOrder: 60 },
    { code: 'Steel', label: 'Acciaio', promptDescription: '', isActive: true, sortOrder: 70 },
    { code: 'Brass', label: 'Ottone', promptDescription: '', isActive: true, sortOrder: 80 },
    { code: 'Glass', label: 'Vetro', promptDescription: '', isActive: true, sortOrder: 90 },
  ],
  applications: [
    { code: 'smooth_render', label: 'Finitura liscia', promptDescription: '', isActive: true, sortOrder: 10 },
    { code: 'textured_render', label: 'Finitura materica', promptDescription: '', isActive: true, sortOrder: 20 },
    { code: 'cast_in_place', label: 'Getto in opera', promptDescription: '', isActive: true, sortOrder: 30 },
    { code: 'precast_panels', label: 'Pannelli prefabbricati', promptDescription: '', isActive: true, sortOrder: 40 },
    { code: 'exposed_brickwork', label: 'Faccia a vista', promptDescription: '', isActive: true, sortOrder: 50 },
    { code: 'brick_cladding', label: 'Rivestimento in laterizio', promptDescription: '', isActive: true, sortOrder: 60 },
    { code: 'horizontal_cladding', label: 'Rivestimento orizzontale', promptDescription: '', isActive: true, sortOrder: 70 },
    { code: 'vertical_cladding', label: 'Rivestimento verticale', promptDescription: '', isActive: true, sortOrder: 80 },
    { code: 'board_and_batten', label: 'Doghe e listelli', promptDescription: '', isActive: true, sortOrder: 90 },
    { code: 'dry_stone_cladding', label: 'Rivestimento a secco', promptDescription: '', isActive: true, sortOrder: 100 },
    { code: 'cut_stone_panels', label: 'Pannelli lapidei', promptDescription: '', isActive: true, sortOrder: 110 },
    { code: 'polished_panels', label: 'Pannelli lucidati', promptDescription: '', isActive: true, sortOrder: 120 },
    { code: 'honed_panels', label: 'Pannelli levigati', promptDescription: '', isActive: true, sortOrder: 130 },
    { code: 'metal_panels', label: 'Pannelli metallici', promptDescription: '', isActive: true, sortOrder: 140 },
    { code: 'perforated_panels', label: 'Lamiere forate', promptDescription: '', isActive: true, sortOrder: 150 },
    { code: 'flush_leaf', label: 'Anta a filo', promptDescription: '', isActive: true, sortOrder: 160 },
    { code: 'framed_leaf', label: 'Anta intelaiata', promptDescription: '', isActive: true, sortOrder: 170 },
    { code: 'glazed_leaf', label: 'Anta vetrata', promptDescription: '', isActive: true, sortOrder: 180 },
    { code: 'thin_profiles', label: 'Profili sottili', promptDescription: '', isActive: true, sortOrder: 190 },
    { code: 'thermal_profiles', label: 'Profili a taglio termico', promptDescription: '', isActive: true, sortOrder: 200 },
    { code: 'boxed_profiles', label: 'Profili squadrati', promptDescription: '', isActive: true, sortOrder: 210 },
    { code: 'vertical_bars', label: 'Montanti verticali', promptDescription: '', isActive: true, sortOrder: 220 },
    { code: 'glass_guard', label: 'Parapetto in vetro', promptDescription: '', isActive: true, sortOrder: 230 },
    { code: 'perforated_guard', label: 'Parapetto forato', promptDescription: '', isActive: true, sortOrder: 240 },
    { code: 'solid_base', label: 'Basamento pieno', promptDescription: '', isActive: true, sortOrder: 250 },
    { code: 'ventilated_base', label: 'Basamento ventilato', promptDescription: '', isActive: true, sortOrder: 260 },
  ],
  elements: [
    { code: 'facade_main', label: 'Facciata principale', promptLabel: 'main facade planes', defaultMaterialCode: 'Plaster', defaultApplicationCode: 'smooth_render', defaultColor: '', allowedMaterialCodes: ['Plaster', 'Concrete', 'Brick', 'Wood', 'Stone', 'Marble', 'Steel'], allowedApplicationCodes: ['smooth_render', 'textured_render', 'cast_in_place', 'precast_panels', 'exposed_brickwork', 'brick_cladding', 'horizontal_cladding', 'vertical_cladding', 'board_and_batten', 'dry_stone_cladding', 'cut_stone_panels', 'polished_panels', 'honed_panels', 'metal_panels', 'perforated_panels'], isActive: true, sortOrder: 10 },
    { code: 'facade_secondary', label: 'Facciata secondaria', promptLabel: 'secondary facade planes', defaultMaterialCode: 'Concrete', defaultApplicationCode: 'cast_in_place', defaultColor: '', allowedMaterialCodes: ['Plaster', 'Concrete', 'Brick', 'Wood', 'Stone', 'Marble', 'Steel'], allowedApplicationCodes: ['smooth_render', 'textured_render', 'cast_in_place', 'precast_panels', 'exposed_brickwork', 'brick_cladding', 'horizontal_cladding', 'vertical_cladding', 'board_and_batten', 'dry_stone_cladding', 'cut_stone_panels', 'polished_panels', 'honed_panels', 'metal_panels', 'perforated_panels'], isActive: true, sortOrder: 20 },
    { code: 'door', label: 'Porta ingresso', promptLabel: 'entrance door', defaultMaterialCode: 'Wood', defaultApplicationCode: 'flush_leaf', defaultColor: '', allowedMaterialCodes: ['Wood', 'Steel', 'Brass', 'Glass'], allowedApplicationCodes: ['flush_leaf', 'framed_leaf', 'glazed_leaf'], isActive: true, sortOrder: 30 },
    { code: 'window_frames', label: 'Infissi finestre', promptLabel: 'window frames and trims', defaultMaterialCode: 'Steel', defaultApplicationCode: 'thin_profiles', defaultColor: '', allowedMaterialCodes: ['Steel', 'Wood', 'Brass'], allowedApplicationCodes: ['thin_profiles', 'thermal_profiles', 'boxed_profiles'], isActive: true, sortOrder: 40 },
    { code: 'railings', label: 'Ringhiere / parapetti', promptLabel: 'balcony railings and parapets', defaultMaterialCode: 'Steel', defaultApplicationCode: 'vertical_bars', defaultColor: '', allowedMaterialCodes: ['Steel', 'Brass', 'Glass'], allowedApplicationCodes: ['vertical_bars', 'glass_guard', 'perforated_guard'], isActive: true, sortOrder: 50 },
    { code: 'base_plinth', label: 'Zoccolo / base', promptLabel: 'base plinth and ground-contact band', defaultMaterialCode: 'Stone', defaultApplicationCode: 'solid_base', defaultColor: '', allowedMaterialCodes: ['Stone', 'Concrete', 'Brick', 'Steel'], allowedApplicationCodes: ['solid_base', 'ventilated_base'], isActive: true, sortOrder: 60 },
  ],
  elementMaterials: [
    { elementCode: 'facade_main', materialCodes: ['Plaster', 'Concrete', 'Brick', 'Wood', 'Stone', 'Marble', 'Steel'] },
    { elementCode: 'facade_secondary', materialCodes: ['Plaster', 'Concrete', 'Brick', 'Wood', 'Stone', 'Marble', 'Steel'] },
    { elementCode: 'door', materialCodes: ['Wood', 'Steel', 'Brass', 'Glass'] },
    { elementCode: 'window_frames', materialCodes: ['Steel', 'Wood', 'Brass'] },
    { elementCode: 'railings', materialCodes: ['Steel', 'Brass', 'Glass'] },
    { elementCode: 'base_plinth', materialCodes: ['Stone', 'Concrete', 'Brick', 'Steel'] },
  ],
  elementApplications: [
    { elementCode: 'facade_main', applicationCodes: ['smooth_render', 'textured_render', 'cast_in_place', 'precast_panels', 'exposed_brickwork', 'brick_cladding', 'horizontal_cladding', 'vertical_cladding', 'board_and_batten', 'dry_stone_cladding', 'cut_stone_panels', 'polished_panels', 'honed_panels', 'metal_panels', 'perforated_panels'] },
    { elementCode: 'facade_secondary', applicationCodes: ['smooth_render', 'textured_render', 'cast_in_place', 'precast_panels', 'exposed_brickwork', 'brick_cladding', 'horizontal_cladding', 'vertical_cladding', 'board_and_batten', 'dry_stone_cladding', 'cut_stone_panels', 'polished_panels', 'honed_panels', 'metal_panels', 'perforated_panels'] },
    { elementCode: 'door', applicationCodes: ['flush_leaf', 'framed_leaf', 'glazed_leaf'] },
    { elementCode: 'window_frames', applicationCodes: ['thin_profiles', 'thermal_profiles', 'boxed_profiles'] },
    { elementCode: 'railings', applicationCodes: ['vertical_bars', 'glass_guard', 'perforated_guard'] },
    { elementCode: 'base_plinth', applicationCodes: ['solid_base', 'ventilated_base'] },
  ],
  materialApplications: [
    { materialCode: 'Plaster', applicationCodes: ['smooth_render', 'textured_render'] },
    { materialCode: 'Concrete', applicationCodes: ['cast_in_place', 'precast_panels', 'solid_base'] },
    { materialCode: 'Brick', applicationCodes: ['exposed_brickwork', 'brick_cladding', 'solid_base'] },
    { materialCode: 'Wood', applicationCodes: ['horizontal_cladding', 'vertical_cladding', 'board_and_batten', 'flush_leaf', 'framed_leaf', 'boxed_profiles'] },
    { materialCode: 'Stone', applicationCodes: ['dry_stone_cladding', 'cut_stone_panels', 'solid_base', 'ventilated_base'] },
    { materialCode: 'Marble', applicationCodes: ['polished_panels', 'honed_panels', 'cut_stone_panels'] },
    { materialCode: 'Steel', applicationCodes: ['metal_panels', 'perforated_panels', 'flush_leaf', 'framed_leaf', 'thin_profiles', 'thermal_profiles', 'boxed_profiles', 'vertical_bars', 'perforated_guard', 'solid_base', 'ventilated_base'] },
    { materialCode: 'Brass', applicationCodes: ['framed_leaf', 'thin_profiles', 'boxed_profiles', 'vertical_bars'] },
    { materialCode: 'Glass', applicationCodes: ['glazed_leaf', 'glass_guard'] },
  ],
};

export function normalizeRenderCatalog(rawCatalog) {
  if (!rawCatalog || typeof rawCatalog !== 'object') return FALLBACK_RENDER_CATALOG;
  return {
    ...FALLBACK_RENDER_CATALOG,
    ...rawCatalog,
    styles: Array.isArray(rawCatalog.styles) && rawCatalog.styles.length ? rawCatalog.styles : FALLBACK_RENDER_CATALOG.styles,
    lightings: Array.isArray(rawCatalog.lightings) && rawCatalog.lightings.length ? rawCatalog.lightings : FALLBACK_RENDER_CATALOG.lightings,
    seasons: Array.isArray(rawCatalog.seasons) && rawCatalog.seasons.length ? rawCatalog.seasons : FALLBACK_RENDER_CATALOG.seasons,
    materials: Array.isArray(rawCatalog.materials) && rawCatalog.materials.length ? rawCatalog.materials : FALLBACK_RENDER_CATALOG.materials,
    applications: Array.isArray(rawCatalog.applications) && rawCatalog.applications.length ? rawCatalog.applications : FALLBACK_RENDER_CATALOG.applications,
    elements: Array.isArray(rawCatalog.elements) && rawCatalog.elements.length ? rawCatalog.elements : FALLBACK_RENDER_CATALOG.elements,
    elementMaterials: Array.isArray(rawCatalog.elementMaterials) && rawCatalog.elementMaterials.length ? rawCatalog.elementMaterials : FALLBACK_RENDER_CATALOG.elementMaterials,
    elementApplications: Array.isArray(rawCatalog.elementApplications) && rawCatalog.elementApplications.length ? rawCatalog.elementApplications : FALLBACK_RENDER_CATALOG.elementApplications,
    materialApplications: Array.isArray(rawCatalog.materialApplications) && rawCatalog.materialApplications.length ? rawCatalog.materialApplications : FALLBACK_RENDER_CATALOG.materialApplications,
  };
}

function buildMaps(catalog) {
  const normalizedCatalog = normalizeRenderCatalog(catalog);
  return {
    catalog: normalizedCatalog,
    materialMap: Object.fromEntries(normalizedCatalog.materials.map((material) => [material.code, material])),
    applicationMap: Object.fromEntries(normalizedCatalog.applications.map((application) => [application.code, application])),
    elementMap: Object.fromEntries(normalizedCatalog.elements.map((element) => [element.code, element])),
    materialApplicationMap: Object.fromEntries(normalizedCatalog.materialApplications.map((relation) => [relation.materialCode, relation.applicationCodes || []])),
  };
}

export function getStyleOptions(catalog) {
  return normalizeRenderCatalog(catalog).styles.map((style) => ({ value: style.value, label: style.label }));
}

export function getLightingOptions(catalog) {
  return normalizeRenderCatalog(catalog).lightings.map((lighting) => ({ value: lighting.value, label: lighting.label }));
}

export function getSeasonOptions(catalog) {
  return normalizeRenderCatalog(catalog).seasons.map((season) => ({ value: season.value, label: season.label }));
}

export function getElementDefinition(catalog, elementId) {
  return buildMaps(catalog).elementMap[elementId] || null;
}

export function getElementMaterialOptions(catalog, elementId) {
  const { materialMap } = buildMaps(catalog);
  const element = getElementDefinition(catalog, elementId);
  if (!element) return [];

  return (element.allowedMaterialCodes || []).map((materialCode) => ({
    value: materialCode,
    label: materialMap[materialCode]?.label || materialCode,
  }));
}

export function getElementApplicationOptionsForMaterial(catalog, elementId, materialCode) {
  const { applicationMap, materialApplicationMap } = buildMaps(catalog);
  const element = getElementDefinition(catalog, elementId);
  if (!element) return [];

  const allowedByElement = element.allowedApplicationCodes || [];
  const allowedByMaterial = materialApplicationMap[materialCode] || [];
  const allowedByMaterialSet = new Set(allowedByMaterial);

  return allowedByElement
    .filter((applicationCode) => allowedByMaterialSet.has(applicationCode))
    .map((applicationCode) => ({
      value: applicationCode,
      label: applicationMap[applicationCode]?.label || applicationCode,
    }));
}

export function isApplicationCompatible(catalog, elementId, materialCode, applicationCode) {
  return getElementApplicationOptionsForMaterial(catalog, elementId, materialCode)
    .some((option) => option.value === applicationCode);
}

function buildDefaultSpec(catalog, elementId) {
  const element = getElementDefinition(catalog, elementId);
  if (!element) return null;

  const materialOptions = element.allowedMaterialCodes || [];
  const material = materialOptions.includes(element.defaultMaterialCode)
    ? element.defaultMaterialCode
    : materialOptions[0];
  const applicationOptions = getElementApplicationOptionsForMaterial(catalog, elementId, material);
  const application = applicationOptions.some((option) => option.value === element.defaultApplicationCode)
    ? element.defaultApplicationCode
    : (applicationOptions[0]?.value || element.defaultApplicationCode);

  return {
    elementId: element.code,
    material,
    application,
    color: element.defaultColor || '',
    mask: {
      key: `mask_${element.code}`,
      mode: 'planned',
    },
  };
}

export function createDefaultElementSpecs() {
  return [];
}

export function normalizeElementSpecs(catalog, rawSpecs) {
  const incoming = Array.isArray(rawSpecs) ? rawSpecs : [];
  const seen = new Set();
  const normalized = [];

  for (const entry of incoming) {
    const element = getElementDefinition(catalog, entry?.elementId);
    if (!element || seen.has(element.code)) continue;
    seen.add(element.code);

    const materialOptions = element.allowedMaterialCodes || [];
    const material = materialOptions.includes(entry?.material)
      ? entry.material
      : (materialOptions.includes(element.defaultMaterialCode) ? element.defaultMaterialCode : materialOptions[0]);
    if (!material) continue;

    const applicationOptions = getElementApplicationOptionsForMaterial(catalog, element.code, material);
    const application = applicationOptions.some((option) => option.value === entry?.application)
      ? entry.application
      : (applicationOptions.some((option) => option.value === element.defaultApplicationCode)
        ? element.defaultApplicationCode
        : (applicationOptions[0]?.value || element.defaultApplicationCode));
    if (!application) continue;

    const color = typeof entry?.color === 'string' ? entry.color.slice(0, 140) : (element.defaultColor || '');
    const maskKey =
      typeof entry?.mask?.key === 'string' && entry.mask.key.trim()
        ? entry.mask.key.trim()
        : `mask_${element.code}`;

    normalized.push({
      elementId: element.code,
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

export function addElementSpec(catalog, elementSpecs, elementId) {
  const normalized = normalizeElementSpecs(catalog, elementSpecs);
  if (normalized.some((spec) => spec.elementId === elementId)) {
    return normalized;
  }

  const defaultSpec = buildDefaultSpec(catalog, elementId);
  if (!defaultSpec) return normalized;
  return [...normalized, defaultSpec];
}

export function removeElementSpec(catalog, elementSpecs, elementId) {
  return normalizeElementSpecs(catalog, elementSpecs).filter((spec) => spec.elementId !== elementId);
}

export function withLegacyMaterialPreset(catalog, elementSpecs, legacyMaterials) {
  const preset = LEGACY_MATERIAL_PRESETS[legacyMaterials];
  if (!preset) return normalizeElementSpecs(catalog, elementSpecs);

  const mappedSpecs = Object.entries(preset).map(([elementId, value]) => ({
    elementId,
    material: value.material,
    application: value.application,
    color: '',
    mask: {
      key: `mask_${elementId}`,
      mode: 'planned',
    },
  }));

  return normalizeElementSpecs(catalog, mappedSpecs);
}
