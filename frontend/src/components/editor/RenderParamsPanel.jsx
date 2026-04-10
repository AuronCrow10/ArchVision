import { useEffect, useMemo, useState } from 'react';
import Input from '../ui/Input.jsx';
import styles from './RenderParamsPanel.module.css';
import {
  addElementSpec,
  getElementApplicationOptionsForMaterial,
  getElementDefinition,
  getElementMaterialOptions,
  getLightingOptions,
  getSeasonOptions,
  getStyleOptions,
  isApplicationCompatible,
  normalizeElementSpecs,
  removeElementSpec,
} from '../../constants/renderElements.js';

function Select({ label, value, onChange, options }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function RenderParamsPanel({ params, onChange, catalog }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [elementToAdd, setElementToAdd] = useState('');
  const elementSpecs = normalizeElementSpecs(catalog, params.elementSpecs);
  const styleOptions = useMemo(() => getStyleOptions(catalog), [catalog]);
  const lightingOptions = useMemo(() => getLightingOptions(catalog), [catalog]);
  const seasonOptions = useMemo(() => getSeasonOptions(catalog), [catalog]);
  const availableElementDefinitions = useMemo(
    () => (catalog?.elements || []).filter((definition) => definition.isActive !== false),
    [catalog]
  );

  const selectedIds = useMemo(() => new Set(elementSpecs.map((spec) => spec.elementId)), [elementSpecs]);
  const availableElements = useMemo(
    () => availableElementDefinitions.filter((definition) => !selectedIds.has(definition.code)),
    [availableElementDefinitions, selectedIds]
  );

  useEffect(() => {
    if (!availableElements.length) {
      setElementToAdd('');
      return;
    }

    if (!availableElements.some((definition) => definition.code === elementToAdd)) {
      setElementToAdd(availableElements[0].code);
    }
  }, [availableElements, elementToAdd]);

  function set(key, value) {
    onChange({ ...params, [key]: value });
  }

  function syncElementSpecs(nextElementSpecs) {
    const normalized = normalizeElementSpecs(catalog, nextElementSpecs);
    const materialLabelMap = Object.fromEntries((catalog?.materials || []).map((material) => [material.code, material.label || material.code]));
    const uniqueMaterials = [...new Set(normalized.map((spec) => materialLabelMap[spec.material] || spec.material).filter(Boolean))];

    onChange({
      ...params,
      elementSpecs: normalized,
      materials: uniqueMaterials.slice(0, 3).join(', ') || 'Custom Elements',
    });
  }

  function addElement() {
    if (!elementToAdd) return;
    syncElementSpecs(addElementSpec(catalog, elementSpecs, elementToAdd));
  }

  function deleteElement(elementId) {
    syncElementSpecs(removeElementSpec(catalog, elementSpecs, elementId));
  }

  function updateElement(elementId, patch) {
    const next = elementSpecs.map((spec) => (
      spec.elementId === elementId ? { ...spec, ...patch } : spec
    ));
    syncElementSpecs(next);
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Parametri di rendering</h3>

      <div className={styles.grid}>
        <Select label="Stile architettonico" value={params.style} onChange={(value) => set('style', value)} options={styleOptions} />
        <Select label="Illuminazione" value={params.lighting} onChange={(value) => set('lighting', value)} options={lightingOptions} />
        <Select label="Stagione" value={params.season} onChange={(value) => set('season', value)} options={seasonOptions} />
      </div>

      <div className={styles.elementsSection}>
        <div className={styles.elementsHeader}>
          <h4 className={styles.elementsTitle}>Elementi, materiali e colori</h4>
          <p className={styles.elementsHint}>
            Aggiungi solo gli elementi che vuoi controllare. Ogni elemento usa materiali realistici compatibili.
          </p>
        </div>

        <div className={styles.elementAdder}>
          <select
            className={styles.select}
            value={elementToAdd}
            onChange={(event) => setElementToAdd(event.target.value)}
            disabled={!availableElements.length}
          >
            {availableElements.length ? (
              availableElements.map((definition) => (
                <option key={definition.code} value={definition.code}>
                  {definition.label}
                </option>
              ))
            ) : (
              <option value="">Tutti gli elementi sono gia aggiunti</option>
            )}
          </select>
          <button
            type="button"
            className={styles.addButton}
            onClick={addElement}
            disabled={!availableElements.length || !elementToAdd}
          >
            Aggiungi elemento
          </button>
        </div>

        {!elementSpecs.length && (
          <p className={styles.emptyState}>
            Nessun elemento selezionato. Aggiungine uno per iniziare a definire materiale e colore.
          </p>
        )}

        <div className={styles.elementsList}>
          {elementSpecs.map((spec) => {
            const definition = getElementDefinition(catalog, spec.elementId);
            if (!definition) return null;
            const materialOptions = getElementMaterialOptions(catalog, spec.elementId);
            const applicationOptions = getElementApplicationOptionsForMaterial(catalog, spec.elementId, spec.material);

            return (
              <div key={spec.elementId} className={styles.elementRow}>
                <div className={styles.elementTop}>
                  <div className={styles.elementName}>{definition.label}</div>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => deleteElement(spec.elementId)}
                  >
                    Rimuovi
                  </button>
                </div>

                <div className={styles.elementInputs}>
                  <div className={styles.field}>
                    <label className={styles.label}>Materiale</label>
                    <select
                      className={styles.select}
                      value={spec.material}
                      onChange={(event) => {
                        const nextMaterial = event.target.value;
                        const nextApplicationOptions = getElementApplicationOptionsForMaterial(catalog, spec.elementId, nextMaterial);
                        const nextApplication = isApplicationCompatible(catalog, spec.elementId, nextMaterial, spec.application)
                          ? spec.application
                          : (nextApplicationOptions[0]?.value || spec.application);

                        updateElement(spec.elementId, {
                          material: nextMaterial,
                          application: nextApplication,
                        });
                      }}
                    >
                      {materialOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Applicazione</label>
                    <select
                      className={styles.select}
                      value={spec.application}
                      onChange={(event) => updateElement(spec.elementId, { application: event.target.value })}
                    >
                      {applicationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Colore / finitura (opzionale)</label>
                    <input
                      className={styles.textInput}
                      value={spec.color || ''}
                      onChange={(event) => updateElement(spec.elementId, { color: event.target.value })}
                      placeholder="es. rosso ossido satinato"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.advanced}>
        <button
          type="button"
          className={styles.advancedToggle}
          onClick={() => setAdvancedOpen((value) => !value)}
        >
          {advancedOpen ? 'Nascondi impostazioni avanzate' : 'Mostra impostazioni avanzate'}
        </button>

        <p className={styles.advancedHint}>
          Le impostazioni avanzate sono opzionali e precompilate con valori consigliati.
        </p>

        {advancedOpen && (
          <div className={styles.advancedContent}>
            <Input
              label="Descrizione della location (avanzato)"
              placeholder="Usa la location esistente dell'immagine di input"
              value={params.locationDescription}
              onChange={(e) => set('locationDescription', e.target.value)}
            />

            <div className={styles.field}>
              <label className={styles.label}>Note extra per l&apos;AI (avanzato)</label>
              <textarea
                className={styles.textarea}
                placeholder="Mantieni invariate geometria, posizione e prospettiva"
                value={params.extra}
                onChange={(e) => set('extra', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
