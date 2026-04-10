import { getClient, query } from '../utils/db.js';

export const DEFAULT_RENDER_CATALOG = {
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
    { code: 'Plaster', label: 'Intonaco', promptDescription: 'plaster-like micro roughness and mineral matte response', isActive: true, sortOrder: 10 },
    { code: 'Concrete', label: 'Calcestruzzo', promptDescription: 'concrete pores, subtle casting variation, and realistic roughness', isActive: true, sortOrder: 20 },
    { code: 'Brick', label: 'Mattone', promptDescription: 'brick unit rhythm, mortar joints, and masonry texture behavior', isActive: true, sortOrder: 30 },
    { code: 'Wood', label: 'Legno', promptDescription: 'wood grain direction, fibrous texture, and organic roughness variation', isActive: true, sortOrder: 40 },
    { code: 'Stone', label: 'Pietra', promptDescription: 'stone mineral texture, natural variation, and realistic edge weathering', isActive: true, sortOrder: 50 },
    { code: 'Marble', label: 'Marmo', promptDescription: 'stone veining cues with polished or honed optical response', isActive: true, sortOrder: 60 },
    { code: 'Steel', label: 'Acciaio', promptDescription: 'metallic reflectance with fabricated panel and profile character', isActive: true, sortOrder: 70 },
    { code: 'Brass', label: 'Ottone', promptDescription: 'brushed or satin brass detailing with warm metallic highlights', isActive: true, sortOrder: 80 },
    { code: 'Glass', label: 'Vetro', promptDescription: 'realistic architectural glazing behavior with physically plausible reflections and transparency', isActive: true, sortOrder: 90 },
  ],
  applications: [
    { code: 'smooth_render', label: 'Finitura liscia', promptDescription: 'continuous smooth render coat with minimal joints', isActive: true, sortOrder: 10 },
    { code: 'textured_render', label: 'Finitura materica', promptDescription: 'textured render coat with controlled tactile relief', isActive: true, sortOrder: 20 },
    { code: 'cast_in_place', label: 'Getto in opera', promptDescription: 'monolithic cast-in-place expression with limited construction joints', isActive: true, sortOrder: 30 },
    { code: 'precast_panels', label: 'Pannelli prefabbricati', promptDescription: 'regular precast panel segmentation with clean panel seams', isActive: true, sortOrder: 40 },
    { code: 'exposed_brickwork', label: 'Faccia a vista', promptDescription: 'exposed brickwork layout with visible coursing and mortar lines', isActive: true, sortOrder: 50 },
    { code: 'brick_cladding', label: 'Rivestimento in laterizio', promptDescription: 'brick cladding with controlled module repetition and edge trims', isActive: true, sortOrder: 60 },
    { code: 'horizontal_cladding', label: 'Rivestimento orizzontale', promptDescription: 'horizontal cladding orientation and board rhythm', isActive: true, sortOrder: 70 },
    { code: 'vertical_cladding', label: 'Rivestimento verticale', promptDescription: 'vertical cladding orientation and board rhythm', isActive: true, sortOrder: 80 },
    { code: 'board_and_batten', label: 'Doghe e listelli', promptDescription: 'board-and-batten articulation with alternating board and batten lines', isActive: true, sortOrder: 90 },
    { code: 'dry_stone_cladding', label: 'Rivestimento a secco', promptDescription: 'dry stone cladding composition with irregular but controlled stone pieces', isActive: true, sortOrder: 100 },
    { code: 'cut_stone_panels', label: 'Pannelli lapidei', promptDescription: 'cut stone panel modules with a clear joint grid', isActive: true, sortOrder: 110 },
    { code: 'polished_panels', label: 'Pannelli lucidati', promptDescription: 'polished panel finish with crisp reflections', isActive: true, sortOrder: 120 },
    { code: 'honed_panels', label: 'Pannelli levigati', promptDescription: 'honed panel finish with soft low-gloss reflections', isActive: true, sortOrder: 130 },
    { code: 'metal_panels', label: 'Pannelli metallici', promptDescription: 'regular metal panelization with folded or flush edges', isActive: true, sortOrder: 140 },
    { code: 'perforated_panels', label: 'Lamiere forate', promptDescription: 'perforated metal panel language with a visible perforation pattern', isActive: true, sortOrder: 150 },
    { code: 'flush_leaf', label: 'Anta a filo', promptDescription: 'flush door leaf geometry with a clean perimeter reveal', isActive: true, sortOrder: 160 },
    { code: 'framed_leaf', label: 'Anta intelaiata', promptDescription: 'framed door leaf articulation with visible frame proportions', isActive: true, sortOrder: 170 },
    { code: 'glazed_leaf', label: 'Anta vetrata', promptDescription: 'door leaf with controlled glazing portions', isActive: true, sortOrder: 180 },
    { code: 'thin_profiles', label: 'Profili sottili', promptDescription: 'slim framing profile proportions', isActive: true, sortOrder: 190 },
    { code: 'thermal_profiles', label: 'Profili a taglio termico', promptDescription: 'thermally-broken frame thickness and realistic profile depth', isActive: true, sortOrder: 200 },
    { code: 'boxed_profiles', label: 'Profili squadrati', promptDescription: 'boxed frame sections with stronger visual thickness', isActive: true, sortOrder: 210 },
    { code: 'vertical_bars', label: 'Montanti verticali', promptDescription: 'vertical bar railing rhythm with consistent spacing', isActive: true, sortOrder: 220 },
    { code: 'glass_guard', label: 'Parapetto in vetro', promptDescription: 'frameless or minimally framed glass guardrail behavior', isActive: true, sortOrder: 230 },
    { code: 'perforated_guard', label: 'Parapetto forato', promptDescription: 'perforated guard panels with regular perforation logic', isActive: true, sortOrder: 240 },
    { code: 'solid_base', label: 'Basamento pieno', promptDescription: 'solid plinth expression with a continuous base band', isActive: true, sortOrder: 250 },
    { code: 'ventilated_base', label: 'Basamento ventilato', promptDescription: 'ventilated rainscreen-style base with panel joints and shadow gaps', isActive: true, sortOrder: 260 },
  ],
  elements: [
    { code: 'facade_main', label: 'Facciata principale', promptLabel: 'main facade planes', defaultMaterialCode: 'Plaster', defaultApplicationCode: 'smooth_render', defaultColor: '', isActive: true, sortOrder: 10 },
    { code: 'facade_secondary', label: 'Facciata secondaria', promptLabel: 'secondary facade planes', defaultMaterialCode: 'Concrete', defaultApplicationCode: 'cast_in_place', defaultColor: '', isActive: true, sortOrder: 20 },
    { code: 'door', label: 'Porta ingresso', promptLabel: 'entrance door', defaultMaterialCode: 'Wood', defaultApplicationCode: 'flush_leaf', defaultColor: '', isActive: true, sortOrder: 30 },
    { code: 'window_frames', label: 'Infissi finestre', promptLabel: 'window frames and trims', defaultMaterialCode: 'Steel', defaultApplicationCode: 'thin_profiles', defaultColor: '', isActive: true, sortOrder: 40 },
    { code: 'railings', label: 'Ringhiere / parapetti', promptLabel: 'balcony railings and parapets', defaultMaterialCode: 'Steel', defaultApplicationCode: 'vertical_bars', defaultColor: '', isActive: true, sortOrder: 50 },
    { code: 'base_plinth', label: 'Zoccolo / base', promptLabel: 'base plinth and ground-contact band', defaultMaterialCode: 'Stone', defaultApplicationCode: 'solid_base', defaultColor: '', isActive: true, sortOrder: 60 },
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

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const value = item[key];
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function normalizeOptionItems(items = [], keyField) {
  return uniqueBy(
    (Array.isArray(items) ? items : []).map((item, index) => ({
      [keyField]: String(item?.[keyField] || '').trim(),
      label: String(item?.label || item?.[keyField] || '').trim(),
      isActive: item?.isActive !== false,
      sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
    })),
    keyField,
  ).filter((item) => item[keyField] && item.label);
}

function normalizeEntityItems(items = [], keyField, extraFields = {}) {
  return uniqueBy(
    (Array.isArray(items) ? items : []).map((item, index) => {
      const normalized = {
        [keyField]: String(item?.[keyField] || '').trim(),
        label: String(item?.label || item?.[keyField] || '').trim(),
        isActive: item?.isActive !== false,
        sortOrder: Number.isFinite(Number(item?.sortOrder)) ? Number(item.sortOrder) : (index + 1) * 10,
      };

      for (const [field, factory] of Object.entries(extraFields)) {
        normalized[field] = factory(item);
      }

      return normalized;
    }),
    keyField,
  ).filter((item) => item[keyField] && item.label);
}

function normalizeRelationItems(items = [], ownerField, itemField) {
  return uniqueBy(
    (Array.isArray(items) ? items : []).map((item) => ({
      [ownerField]: String(item?.[ownerField] || '').trim(),
      [itemField]: [...new Set((Array.isArray(item?.[itemField]) ? item[itemField] : []).map((value) => String(value || '').trim()).filter(Boolean))],
    })),
    ownerField,
  ).filter((item) => item[ownerField]);
}

export function normalizeRenderCatalogPayload(payload = DEFAULT_RENDER_CATALOG) {
  const styles = normalizeOptionItems(payload.styles, 'value');
  const lightings = normalizeOptionItems(payload.lightings, 'value');
  const seasons = normalizeOptionItems(payload.seasons, 'value');
  const materials = normalizeEntityItems(payload.materials, 'code', {
    promptDescription: (item) => String(item?.promptDescription || '').trim(),
  });
  const applications = normalizeEntityItems(payload.applications, 'code', {
    promptDescription: (item) => String(item?.promptDescription || '').trim(),
  });
  const elements = normalizeEntityItems(payload.elements, 'code', {
    promptLabel: (item) => String(item?.promptLabel || item?.label || item?.code || '').trim(),
    defaultMaterialCode: (item) => String(item?.defaultMaterialCode || '').trim(),
    defaultApplicationCode: (item) => String(item?.defaultApplicationCode || '').trim(),
    defaultColor: (item) => String(item?.defaultColor || '').slice(0, 140),
  });
  const elementMaterials = normalizeRelationItems(payload.elementMaterials, 'elementCode', 'materialCodes');
  const elementApplications = normalizeRelationItems(payload.elementApplications, 'elementCode', 'applicationCodes');
  const materialApplications = normalizeRelationItems(payload.materialApplications, 'materialCode', 'applicationCodes');

  const materialCodes = new Set(materials.map((item) => item.code));
  const applicationCodes = new Set(applications.map((item) => item.code));
  const elementCodes = new Set(elements.map((item) => item.code));

  for (const element of elements) {
    if (!materialCodes.has(element.defaultMaterialCode)) {
      throw new Error(`Invalid default material for element "${element.code}"`);
    }
    if (!applicationCodes.has(element.defaultApplicationCode)) {
      throw new Error(`Invalid default application for element "${element.code}"`);
    }
  }

  for (const relation of elementMaterials) {
    if (!elementCodes.has(relation.elementCode)) throw new Error(`Invalid element relation "${relation.elementCode}"`);
    for (const materialCode of relation.materialCodes) {
      if (!materialCodes.has(materialCode)) throw new Error(`Invalid material relation "${materialCode}"`);
    }
  }

  for (const relation of elementApplications) {
    if (!elementCodes.has(relation.elementCode)) throw new Error(`Invalid element relation "${relation.elementCode}"`);
    for (const applicationCode of relation.applicationCodes) {
      if (!applicationCodes.has(applicationCode)) throw new Error(`Invalid application relation "${applicationCode}"`);
    }
  }

  for (const relation of materialApplications) {
    if (!materialCodes.has(relation.materialCode)) throw new Error(`Invalid material relation "${relation.materialCode}"`);
    for (const applicationCode of relation.applicationCodes) {
      if (!applicationCodes.has(applicationCode)) throw new Error(`Invalid application relation "${applicationCode}"`);
    }
  }

  return {
    styles,
    lightings,
    seasons,
    materials,
    applications,
    elements,
    elementMaterials,
    elementApplications,
    materialApplications,
  };
}

async function fetchTableRows(table, includeInactive, keyField = 'sort_order') {
  const whereClause = includeInactive ? '' : 'WHERE is_active = TRUE';
  const result = await query(`SELECT * FROM ${table} ${whereClause} ORDER BY sort_order ASC, ${keyField} ASC`);
  return result.rows;
}

function buildRelationMap(rows, ownerField, valueField) {
  return rows.reduce((acc, row) => {
    if (!acc[row[ownerField]]) acc[row[ownerField]] = [];
    acc[row[ownerField]].push(row[valueField]);
    return acc;
  }, {});
}

function buildCatalog({
  styles,
  lightings,
  seasons,
  materials,
  applications,
  elements,
  elementMaterials,
  elementApplications,
  materialApplications,
}) {
  const elementMaterialsMap = buildRelationMap(elementMaterials, 'element_code', 'material_code');
  const elementApplicationsMap = buildRelationMap(elementApplications, 'element_code', 'application_code');
  const materialApplicationsMap = buildRelationMap(materialApplications, 'material_code', 'application_code');

  return {
    styles: styles.map((row) => ({
      value: row.value,
      label: row.label,
      isActive: row.is_active,
      sortOrder: row.sort_order,
    })),
    lightings: lightings.map((row) => ({
      value: row.value,
      label: row.label,
      isActive: row.is_active,
      sortOrder: row.sort_order,
    })),
    seasons: seasons.map((row) => ({
      value: row.value,
      label: row.label,
      isActive: row.is_active,
      sortOrder: row.sort_order,
    })),
    materials: materials.map((row) => ({
      code: row.code,
      label: row.label,
      promptDescription: row.prompt_description || '',
      isActive: row.is_active,
      sortOrder: row.sort_order,
    })),
    applications: applications.map((row) => ({
      code: row.code,
      label: row.label,
      promptDescription: row.prompt_description || '',
      isActive: row.is_active,
      sortOrder: row.sort_order,
    })),
    elements: elements.map((row) => ({
      code: row.code,
      label: row.label,
      promptLabel: row.prompt_label || row.label,
      defaultMaterialCode: row.default_material_code,
      defaultApplicationCode: row.default_application_code,
      defaultColor: row.default_color || '',
      isActive: row.is_active,
      sortOrder: row.sort_order,
      allowedMaterialCodes: elementMaterialsMap[row.code] || [],
      allowedApplicationCodes: elementApplicationsMap[row.code] || [],
    })),
    elementMaterials: Object.entries(elementMaterialsMap).map(([elementCode, materialCodes]) => ({
      elementCode,
      materialCodes,
    })),
    elementApplications: Object.entries(elementApplicationsMap).map(([elementCode, applicationCodes]) => ({
      elementCode,
      applicationCodes,
    })),
    materialApplications: Object.entries(materialApplicationsMap).map(([materialCode, applicationCodes]) => ({
      materialCode,
      applicationCodes,
    })),
  };
}

export async function getRenderCatalog({ includeInactive = false } = {}) {
  const [styles, lightings, seasons, materials, applications, elements, elementMaterials, elementApplications, materialApplications] = await Promise.all([
    fetchTableRows('render_styles', includeInactive, 'value'),
    fetchTableRows('render_lightings', includeInactive, 'value'),
    fetchTableRows('render_seasons', includeInactive, 'value'),
    fetchTableRows('render_materials', includeInactive, 'code'),
    fetchTableRows('render_applications', includeInactive, 'code'),
    fetchTableRows('render_elements', includeInactive, 'code'),
    query('SELECT * FROM render_element_materials ORDER BY element_code ASC, material_code ASC').then((res) => res.rows),
    query('SELECT * FROM render_element_applications ORDER BY element_code ASC, application_code ASC').then((res) => res.rows),
    query('SELECT * FROM render_material_applications ORDER BY material_code ASC, application_code ASC').then((res) => res.rows),
  ]);

  return buildCatalog({
    styles,
    lightings,
    seasons,
    materials,
    applications,
    elements,
    elementMaterials,
    elementApplications,
    materialApplications,
  });
}

function buildPlaceholders(offset, length, width) {
  return Array.from({ length }, (_, index) => {
    const base = offset + index * width;
    return `(${Array.from({ length: width }, (_, inner) => `$${base + inner + 1}`).join(', ')})`;
  }).join(', ');
}

async function replaceOptionsTable(client, table, keyField, items) {
  if (items.length > 0) {
    const columnName = keyField === 'value' ? 'value' : 'code';
    const values = items.flatMap((item) => [item[keyField], item.label, item.isActive, item.sortOrder]);
    await client.query(
      `INSERT INTO ${table} (${columnName}, label, is_active, sort_order)
       VALUES ${buildPlaceholders(0, items.length, 4)}
       ON CONFLICT (${columnName}) DO UPDATE
       SET label = EXCLUDED.label,
           is_active = EXCLUDED.is_active,
           sort_order = EXCLUDED.sort_order,
           updated_at = NOW()`,
      values,
    );
  }

  if (items.length > 0) {
    const values = items.map((item) => item[keyField]);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    await client.query(`DELETE FROM ${table} WHERE ${keyField} NOT IN (${placeholders})`, values);
  } else {
    await client.query(`DELETE FROM ${table}`);
  }
}

async function upsertOptionsTable(client, table, keyField, items) {
  if (items.length === 0) return;

  const columnName = keyField === 'value' ? 'value' : 'code';
  const values = items.flatMap((item) => [item[keyField], item.label, item.isActive, item.sortOrder]);
  await client.query(
    `INSERT INTO ${table} (${columnName}, label, is_active, sort_order)
     VALUES ${buildPlaceholders(0, items.length, 4)}
     ON CONFLICT (${columnName}) DO NOTHING`,
    values,
  );
}

async function replaceMaterialsTable(client, items) {
  if (items.length > 0) {
    const values = items.flatMap((item) => [item.code, item.label, item.promptDescription, item.isActive, item.sortOrder]);
    await client.query(
      `INSERT INTO render_materials (code, label, prompt_description, is_active, sort_order)
       VALUES ${buildPlaceholders(0, items.length, 5)}
       ON CONFLICT (code) DO UPDATE
       SET label = EXCLUDED.label,
           prompt_description = EXCLUDED.prompt_description,
           is_active = EXCLUDED.is_active,
           sort_order = EXCLUDED.sort_order,
           updated_at = NOW()`,
      values,
    );
  }
}

async function replaceApplicationsTable(client, items) {
  if (items.length > 0) {
    const values = items.flatMap((item) => [item.code, item.label, item.promptDescription, item.isActive, item.sortOrder]);
    await client.query(
      `INSERT INTO render_applications (code, label, prompt_description, is_active, sort_order)
       VALUES ${buildPlaceholders(0, items.length, 5)}
       ON CONFLICT (code) DO UPDATE
       SET label = EXCLUDED.label,
           prompt_description = EXCLUDED.prompt_description,
           is_active = EXCLUDED.is_active,
           sort_order = EXCLUDED.sort_order,
           updated_at = NOW()`,
      values,
    );
  }
}

async function replaceElementsTable(client, items) {
  if (items.length > 0) {
    const values = items.flatMap((item) => [
      item.code,
      item.label,
      item.promptLabel,
      item.defaultMaterialCode,
      item.defaultApplicationCode,
      item.defaultColor,
      item.isActive,
      item.sortOrder,
    ]);

    await client.query(
      `INSERT INTO render_elements (
        code,
        label,
        prompt_label,
        default_material_code,
        default_application_code,
        default_color,
        is_active,
        sort_order
      )
      VALUES ${buildPlaceholders(0, items.length, 8)}
      ON CONFLICT (code) DO UPDATE
      SET label = EXCLUDED.label,
          prompt_label = EXCLUDED.prompt_label,
          default_material_code = EXCLUDED.default_material_code,
          default_application_code = EXCLUDED.default_application_code,
          default_color = EXCLUDED.default_color,
          is_active = EXCLUDED.is_active,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW()`,
      values,
    );
  }
}

async function replaceRelationTable(client, table, ownerField, itemField, items) {
  await client.query(`DELETE FROM ${table}`);
  const flattened = [];

  for (const relation of items) {
    for (const value of relation[itemField]) {
      flattened.push([relation[ownerField], value]);
    }
  }

  if (!flattened.length) return;

  const values = flattened.flat();
  await client.query(
    `INSERT INTO ${table} (${ownerField.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)}, ${itemField === 'materialCodes' ? 'material_code' : 'application_code'})
     VALUES ${buildPlaceholders(0, flattened.length, 2)}
     ON CONFLICT DO NOTHING`,
    values,
  );
}

async function deleteMissingCodeRows(client, table, codes) {
  if (codes.length > 0) {
    const placeholders = codes.map((_, index) => `$${index + 1}`).join(', ');
    await client.query(`DELETE FROM ${table} WHERE code NOT IN (${placeholders})`, codes);
  } else {
    await client.query(`DELETE FROM ${table}`);
  }
}

export async function saveRenderCatalog(payload) {
  const catalog = normalizeRenderCatalogPayload(payload);
  const client = await getClient();

  try {
    await client.query('BEGIN');

    await replaceOptionsTable(client, 'render_styles', 'value', catalog.styles);
    await replaceOptionsTable(client, 'render_lightings', 'value', catalog.lightings);
    await replaceOptionsTable(client, 'render_seasons', 'value', catalog.seasons);
    await replaceMaterialsTable(client, catalog.materials);
    await replaceApplicationsTable(client, catalog.applications);
    await replaceElementsTable(client, catalog.elements);

    await replaceRelationTable(client, 'render_element_materials', 'elementCode', 'materialCodes', catalog.elementMaterials);
    await replaceRelationTable(client, 'render_element_applications', 'elementCode', 'applicationCodes', catalog.elementApplications);
    await replaceRelationTable(client, 'render_material_applications', 'materialCode', 'applicationCodes', catalog.materialApplications);

    await deleteMissingCodeRows(client, 'render_elements', catalog.elements.map((item) => item.code));
    await deleteMissingCodeRows(client, 'render_materials', catalog.materials.map((item) => item.code));
    await deleteMissingCodeRows(client, 'render_applications', catalog.applications.map((item) => item.code));

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return getRenderCatalog({ includeInactive: true });
}

export async function seedDefaultRenderCatalog(client) {
  const catalog = normalizeRenderCatalogPayload(DEFAULT_RENDER_CATALOG);

  await upsertOptionsTable(client, 'render_styles', 'value', catalog.styles);
  await upsertOptionsTable(client, 'render_lightings', 'value', catalog.lightings);
  await upsertOptionsTable(client, 'render_seasons', 'value', catalog.seasons);

  if (catalog.materials.length > 0) {
    const materialValues = catalog.materials.flatMap((item) => [item.code, item.label, item.promptDescription, item.isActive, item.sortOrder]);
    await client.query(
      `INSERT INTO render_materials (code, label, prompt_description, is_active, sort_order)
       VALUES ${buildPlaceholders(0, catalog.materials.length, 5)}
       ON CONFLICT (code) DO NOTHING`,
      materialValues,
    );
  }

  if (catalog.applications.length > 0) {
    const applicationValues = catalog.applications.flatMap((item) => [item.code, item.label, item.promptDescription, item.isActive, item.sortOrder]);
    await client.query(
      `INSERT INTO render_applications (code, label, prompt_description, is_active, sort_order)
       VALUES ${buildPlaceholders(0, catalog.applications.length, 5)}
       ON CONFLICT (code) DO NOTHING`,
      applicationValues,
    );
  }

  if (catalog.elements.length > 0) {
    const elementValues = catalog.elements.flatMap((item) => [
      item.code,
      item.label,
      item.promptLabel,
      item.defaultMaterialCode,
      item.defaultApplicationCode,
      item.defaultColor,
      item.isActive,
      item.sortOrder,
    ]);

    await client.query(
      `INSERT INTO render_elements (
        code,
        label,
        prompt_label,
        default_material_code,
        default_application_code,
        default_color,
        is_active,
        sort_order
      )
      VALUES ${buildPlaceholders(0, catalog.elements.length, 8)}
      ON CONFLICT (code) DO NOTHING`,
      elementValues,
    );
  }

  const relationInserts = [
    { table: 'render_element_materials', items: catalog.elementMaterials, ownerField: 'elementCode', valueField: 'materialCodes', valueColumn: 'material_code' },
    { table: 'render_element_applications', items: catalog.elementApplications, ownerField: 'elementCode', valueField: 'applicationCodes', valueColumn: 'application_code' },
    { table: 'render_material_applications', items: catalog.materialApplications, ownerField: 'materialCode', valueField: 'applicationCodes', valueColumn: 'application_code' },
  ];

  for (const relation of relationInserts) {
    const rows = [];
    for (const item of relation.items) {
      for (const value of item[relation.valueField]) {
        rows.push([item[relation.ownerField], value]);
      }
    }

    if (!rows.length) continue;

    const ownerColumn = relation.ownerField === 'elementCode' ? 'element_code' : 'material_code';
    await client.query(
      `INSERT INTO ${relation.table} (${ownerColumn}, ${relation.valueColumn})
       VALUES ${buildPlaceholders(0, rows.length, 2)}
       ON CONFLICT DO NOTHING`,
      rows.flat(),
    );
  }
}
