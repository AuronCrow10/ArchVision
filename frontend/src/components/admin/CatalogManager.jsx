import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import styles from './CatalogManager.module.css';
import { FALLBACK_RENDER_CATALOG, normalizeRenderCatalog } from '../../constants/renderElements.js';

function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </section>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <label className={styles.toggle}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{checked ? 'Attivo' : 'Disattivato'}</span>
    </label>
  );
}

function CheckboxList({ options, selected, onToggle }) {
  return (
    <div className={styles.checkboxList}>
      {options.map((option) => (
        <label key={option.value} className={styles.checkboxItem}>
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={(event) => onToggle(option.value, event.target.checked)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function updateSelection(current, value, enabled) {
  const next = new Set(current);
  if (enabled) next.add(value);
  else next.delete(value);
  return [...next];
}

export default function CatalogManager({ catalog, onSave, saving }) {
  const [draft, setDraft] = useState(normalizeRenderCatalog(catalog || FALLBACK_RENDER_CATALOG));
  const [newStyle, setNewStyle] = useState({ value: '', label: '' });
  const [newLighting, setNewLighting] = useState({ value: '', label: '' });
  const [newSeason, setNewSeason] = useState({ value: '', label: '' });
  const [newMaterial, setNewMaterial] = useState({ code: '', label: '', promptDescription: '' });
  const [newApplication, setNewApplication] = useState({ code: '', label: '', promptDescription: '' });
  const [newElement, setNewElement] = useState({ code: '', label: '', promptLabel: '', defaultMaterialCode: '', defaultApplicationCode: '' });

  useEffect(() => {
    setDraft(normalizeRenderCatalog(catalog || FALLBACK_RENDER_CATALOG));
  }, [catalog]);

  const materialOptions = useMemo(
    () => draft.materials.map((item) => ({ value: item.code, label: item.label || item.code })),
    [draft.materials]
  );
  const applicationOptions = useMemo(
    () => draft.applications.map((item) => ({ value: item.code, label: item.label || item.code })),
    [draft.applications]
  );

  function updateList(section, index, patch) {
    setDraft((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  function removeBy(section, predicate) {
    setDraft((current) => {
      const next = { ...current, [section]: current[section].filter((item) => !predicate(item)) };

      if (section === 'materials') {
        next.elements = next.elements.map((element) => ({
          ...element,
          allowedMaterialCodes: (element.allowedMaterialCodes || []).filter((code) => !predicate({ code })),
          defaultMaterialCode: predicate({ code: element.defaultMaterialCode }) ? '' : element.defaultMaterialCode,
        }));
        next.materialApplications = next.materialApplications.filter((item) => !predicate({ code: item.materialCode }));
      }

      if (section === 'applications') {
        next.elements = next.elements.map((element) => ({
          ...element,
          allowedApplicationCodes: (element.allowedApplicationCodes || []).filter((code) => !predicate({ code })),
          defaultApplicationCode: predicate({ code: element.defaultApplicationCode }) ? '' : element.defaultApplicationCode,
        }));
        next.materialApplications = next.materialApplications.map((relation) => ({
          ...relation,
          applicationCodes: relation.applicationCodes.filter((code) => !predicate({ code })),
        }));
      }

      return next;
    });
  }

  function addSimple(section, formState, setFormState) {
    if (!formState.value.trim() || !formState.label.trim()) {
      toast.error('Compila valore e label.');
      return;
    }

    setDraft((current) => ({
      ...current,
      [section]: [...current[section], { value: formState.value.trim(), label: formState.label.trim(), isActive: true, sortOrder: current[section].length * 10 + 10 }],
    }));
    setFormState({ value: '', label: '' });
  }

  function addMaterial() {
    if (!newMaterial.code.trim() || !newMaterial.label.trim()) {
      toast.error('Compila codice e label del materiale.');
      return;
    }

    setDraft((current) => ({
      ...current,
      materials: [...current.materials, { code: newMaterial.code.trim(), label: newMaterial.label.trim(), promptDescription: newMaterial.promptDescription.trim(), isActive: true, sortOrder: current.materials.length * 10 + 10 }],
      materialApplications: [...current.materialApplications, { materialCode: newMaterial.code.trim(), applicationCodes: [] }],
    }));
    setNewMaterial({ code: '', label: '', promptDescription: '' });
  }

  function addApplication() {
    if (!newApplication.code.trim() || !newApplication.label.trim()) {
      toast.error('Compila codice e label dell\'applicazione.');
      return;
    }

    setDraft((current) => ({
      ...current,
      applications: [...current.applications, { code: newApplication.code.trim(), label: newApplication.label.trim(), promptDescription: newApplication.promptDescription.trim(), isActive: true, sortOrder: current.applications.length * 10 + 10 }],
    }));
    setNewApplication({ code: '', label: '', promptDescription: '' });
  }

  function addElement() {
    if (!newElement.code.trim() || !newElement.label.trim() || !newElement.promptLabel.trim() || !newElement.defaultMaterialCode || !newElement.defaultApplicationCode) {
      toast.error('Compila tutti i campi dell\'elemento.');
      return;
    }

    setDraft((current) => ({
      ...current,
      elements: [
        ...current.elements,
        {
          code: newElement.code.trim(),
          label: newElement.label.trim(),
          promptLabel: newElement.promptLabel.trim(),
          defaultMaterialCode: newElement.defaultMaterialCode,
          defaultApplicationCode: newElement.defaultApplicationCode,
          defaultColor: '',
          allowedMaterialCodes: [newElement.defaultMaterialCode],
          allowedApplicationCodes: [newElement.defaultApplicationCode],
          isActive: true,
          sortOrder: current.elements.length * 10 + 10,
        },
      ],
    }));
    setNewElement({ code: '', label: '', promptLabel: '', defaultMaterialCode: '', defaultApplicationCode: '' });
  }

  async function handleSave() {
    for (const element of draft.elements) {
      if (!(element.allowedMaterialCodes || []).includes(element.defaultMaterialCode)) {
        toast.error(`L'elemento "${element.label}" deve includere il materiale di default.`);
        return;
      }
      if (!(element.allowedApplicationCodes || []).includes(element.defaultApplicationCode)) {
        toast.error(`L'elemento "${element.label}" deve includere l'applicazione di default.`);
        return;
      }
    }

    await onSave({
      styles: draft.styles,
      lightings: draft.lightings,
      seasons: draft.seasons,
      materials: draft.materials,
      applications: draft.applications,
      elements: draft.elements,
      elementMaterials: draft.elements.map((element) => ({ elementCode: element.code, materialCodes: element.allowedMaterialCodes || [] })),
      elementApplications: draft.elements.map((element) => ({ elementCode: element.code, applicationCodes: element.allowedApplicationCodes || [] })),
      materialApplications: draft.materialApplications,
    });
  }

  return (
    <div className={styles.manager}>
      <div className={styles.toolbar}>
        <p className={styles.note}>Ogni modifica salvata qui aggiorna direttamente cio che gli utenti vedono nella pagina di configurazione render.</p>
        <Button onClick={handleSave} loading={saving}>Salva catalog</Button>
      </div>

      <div className={styles.optionGrid}>
        <Section title="Stili">
          <div className={styles.inlineForm}>
            <Input placeholder="Value" value={newStyle.value} onChange={(e) => setNewStyle((current) => ({ ...current, value: e.target.value }))} />
            <Input placeholder="Label" value={newStyle.label} onChange={(e) => setNewStyle((current) => ({ ...current, label: e.target.value }))} />
            <Button size="sm" onClick={() => addSimple('styles', newStyle, setNewStyle)}>Aggiungi</Button>
          </div>
          {draft.styles.map((item, index) => (
            <div key={`${item.value}-${index}`} className={styles.itemCard}>
              <div className={styles.compactGrid}>
                <Input label="Value" value={item.value} onChange={(e) => updateList('styles', index, { value: e.target.value })} />
                <Input label="Label" value={item.label} onChange={(e) => updateList('styles', index, { label: e.target.value })} />
                <Input label="Ordine" type="number" value={item.sortOrder} onChange={(e) => updateList('styles', index, { sortOrder: Number(e.target.value) || 0 })} />
              </div>
              <div className={styles.itemActions}>
                <Toggle checked={item.isActive !== false} onChange={(checked) => updateList('styles', index, { isActive: checked })} />
                <Button size="sm" variant="secondary" onClick={() => removeBy('styles', (current) => current.value === item.value)}>Rimuovi</Button>
              </div>
            </div>
          ))}
        </Section>

        <Section title="Illuminazioni">
          <div className={styles.inlineForm}>
            <Input placeholder="Value" value={newLighting.value} onChange={(e) => setNewLighting((current) => ({ ...current, value: e.target.value }))} />
            <Input placeholder="Label" value={newLighting.label} onChange={(e) => setNewLighting((current) => ({ ...current, label: e.target.value }))} />
            <Button size="sm" onClick={() => addSimple('lightings', newLighting, setNewLighting)}>Aggiungi</Button>
          </div>
          {draft.lightings.map((item, index) => (
            <div key={`${item.value}-${index}`} className={styles.itemCard}>
              <div className={styles.compactGrid}>
                <Input label="Value" value={item.value} onChange={(e) => updateList('lightings', index, { value: e.target.value })} />
                <Input label="Label" value={item.label} onChange={(e) => updateList('lightings', index, { label: e.target.value })} />
                <Input label="Ordine" type="number" value={item.sortOrder} onChange={(e) => updateList('lightings', index, { sortOrder: Number(e.target.value) || 0 })} />
              </div>
              <div className={styles.itemActions}>
                <Toggle checked={item.isActive !== false} onChange={(checked) => updateList('lightings', index, { isActive: checked })} />
                <Button size="sm" variant="secondary" onClick={() => removeBy('lightings', (current) => current.value === item.value)}>Rimuovi</Button>
              </div>
            </div>
          ))}
        </Section>

        <Section title="Stagioni">
          <div className={styles.inlineForm}>
            <Input placeholder="Value" value={newSeason.value} onChange={(e) => setNewSeason((current) => ({ ...current, value: e.target.value }))} />
            <Input placeholder="Label" value={newSeason.label} onChange={(e) => setNewSeason((current) => ({ ...current, label: e.target.value }))} />
            <Button size="sm" onClick={() => addSimple('seasons', newSeason, setNewSeason)}>Aggiungi</Button>
          </div>
          {draft.seasons.map((item, index) => (
            <div key={`${item.value}-${index}`} className={styles.itemCard}>
              <div className={styles.compactGrid}>
                <Input label="Value" value={item.value} onChange={(e) => updateList('seasons', index, { value: e.target.value })} />
                <Input label="Label" value={item.label} onChange={(e) => updateList('seasons', index, { label: e.target.value })} />
                <Input label="Ordine" type="number" value={item.sortOrder} onChange={(e) => updateList('seasons', index, { sortOrder: Number(e.target.value) || 0 })} />
              </div>
              <div className={styles.itemActions}>
                <Toggle checked={item.isActive !== false} onChange={(checked) => updateList('seasons', index, { isActive: checked })} />
                <Button size="sm" variant="secondary" onClick={() => removeBy('seasons', (current) => current.value === item.value)}>Rimuovi</Button>
              </div>
            </div>
          ))}
        </Section>
      </div>

      <Section title="Materiali">
        <div className={styles.inlineFormWide}>
          <Input placeholder="Code" value={newMaterial.code} onChange={(e) => setNewMaterial((current) => ({ ...current, code: e.target.value }))} />
          <Input placeholder="Label" value={newMaterial.label} onChange={(e) => setNewMaterial((current) => ({ ...current, label: e.target.value }))} />
          <Input placeholder="Prompt description" value={newMaterial.promptDescription} onChange={(e) => setNewMaterial((current) => ({ ...current, promptDescription: e.target.value }))} />
          <Button size="sm" onClick={addMaterial}>Aggiungi materiale</Button>
        </div>
        {draft.materials.map((item, index) => (
          <div key={item.code} className={styles.itemCard}>
            <div className={styles.wideGrid}>
              <Input label="Code" value={item.code} disabled />
              <Input label="Label" value={item.label} onChange={(e) => updateList('materials', index, { label: e.target.value })} />
              <Input label="Prompt description" value={item.promptDescription || ''} onChange={(e) => updateList('materials', index, { promptDescription: e.target.value })} />
              <Input label="Ordine" type="number" value={item.sortOrder} onChange={(e) => updateList('materials', index, { sortOrder: Number(e.target.value) || 0 })} />
            </div>
            <div className={styles.itemActions}>
              <Toggle checked={item.isActive !== false} onChange={(checked) => updateList('materials', index, { isActive: checked })} />
              <Button size="sm" variant="secondary" onClick={() => removeBy('materials', (current) => current.code === item.code)}>Rimuovi</Button>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Applicazioni">
        <div className={styles.inlineFormWide}>
          <Input placeholder="Code" value={newApplication.code} onChange={(e) => setNewApplication((current) => ({ ...current, code: e.target.value }))} />
          <Input placeholder="Label" value={newApplication.label} onChange={(e) => setNewApplication((current) => ({ ...current, label: e.target.value }))} />
          <Input placeholder="Prompt description" value={newApplication.promptDescription} onChange={(e) => setNewApplication((current) => ({ ...current, promptDescription: e.target.value }))} />
          <Button size="sm" onClick={addApplication}>Aggiungi applicazione</Button>
        </div>
        {draft.applications.map((item, index) => (
          <div key={item.code} className={styles.itemCard}>
            <div className={styles.wideGrid}>
              <Input label="Code" value={item.code} disabled />
              <Input label="Label" value={item.label} onChange={(e) => updateList('applications', index, { label: e.target.value })} />
              <Input label="Prompt description" value={item.promptDescription || ''} onChange={(e) => updateList('applications', index, { promptDescription: e.target.value })} />
              <Input label="Ordine" type="number" value={item.sortOrder} onChange={(e) => updateList('applications', index, { sortOrder: Number(e.target.value) || 0 })} />
            </div>
            <div className={styles.itemActions}>
              <Toggle checked={item.isActive !== false} onChange={(checked) => updateList('applications', index, { isActive: checked })} />
              <Button size="sm" variant="secondary" onClick={() => removeBy('applications', (current) => current.code === item.code)}>Rimuovi</Button>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Elementi render">
        <div className={styles.inlineFormWide}>
          <Input placeholder="Code" value={newElement.code} onChange={(e) => setNewElement((current) => ({ ...current, code: e.target.value }))} />
          <Input placeholder="Label" value={newElement.label} onChange={(e) => setNewElement((current) => ({ ...current, label: e.target.value }))} />
          <Input placeholder="Prompt label" value={newElement.promptLabel} onChange={(e) => setNewElement((current) => ({ ...current, promptLabel: e.target.value }))} />
          <select className={styles.select} value={newElement.defaultMaterialCode} onChange={(e) => setNewElement((current) => ({ ...current, defaultMaterialCode: e.target.value }))}>
            <option value="">Materiale default</option>
            {materialOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select className={styles.select} value={newElement.defaultApplicationCode} onChange={(e) => setNewElement((current) => ({ ...current, defaultApplicationCode: e.target.value }))}>
            <option value="">Applicazione default</option>
            {applicationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <Button size="sm" onClick={addElement}>Aggiungi elemento</Button>
        </div>

        {draft.elements.map((element, index) => (
          <div key={element.code} className={styles.itemCard}>
            <div className={styles.wideGrid}>
              <Input label="Code" value={element.code} disabled />
              <Input label="Label" value={element.label} onChange={(e) => updateList('elements', index, { label: e.target.value })} />
              <Input label="Prompt label" value={element.promptLabel || ''} onChange={(e) => updateList('elements', index, { promptLabel: e.target.value })} />
              <select className={styles.select} value={element.defaultMaterialCode} onChange={(e) => updateList('elements', index, { defaultMaterialCode: e.target.value })}>
                {materialOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <select className={styles.select} value={element.defaultApplicationCode} onChange={(e) => updateList('elements', index, { defaultApplicationCode: e.target.value })}>
                {applicationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <Input label="Ordine" type="number" value={element.sortOrder} onChange={(e) => updateList('elements', index, { sortOrder: Number(e.target.value) || 0 })} />
            </div>
            <div className={styles.itemActions}>
              <Toggle checked={element.isActive !== false} onChange={(checked) => updateList('elements', index, { isActive: checked })} />
              <Button size="sm" variant="secondary" onClick={() => removeBy('elements', (current) => current.code === element.code)}>Rimuovi</Button>
            </div>
            <div className={styles.relationGrid}>
              <div>
                <div className={styles.relationTitle}>Materiali consentiti</div>
                <CheckboxList
                  options={materialOptions}
                  selected={element.allowedMaterialCodes || []}
                  onToggle={(value, enabled) => updateList('elements', index, {
                    allowedMaterialCodes: updateSelection(element.allowedMaterialCodes || [], value, enabled),
                  })}
                />
              </div>
              <div>
                <div className={styles.relationTitle}>Applicazioni consentite</div>
                <CheckboxList
                  options={applicationOptions}
                  selected={element.allowedApplicationCodes || []}
                  onToggle={(value, enabled) => updateList('elements', index, {
                    allowedApplicationCodes: updateSelection(element.allowedApplicationCodes || [], value, enabled),
                  })}
                />
              </div>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Compatibilita materiali -> applicazioni">
        {draft.materials.map((material) => {
          const relation = draft.materialApplications.find((item) => item.materialCode === material.code) || { materialCode: material.code, applicationCodes: [] };
          return (
            <div key={material.code} className={styles.itemCard}>
              <div className={styles.relationTitle}>{material.label}</div>
              <CheckboxList
                options={applicationOptions}
                selected={relation.applicationCodes}
                onToggle={(value, enabled) => {
                  setDraft((current) => ({
                    ...current,
                    materialApplications: current.materialApplications.map((item) => (
                      item.materialCode === material.code
                        ? { ...item, applicationCodes: updateSelection(item.applicationCodes || [], value, enabled) }
                        : item
                    )),
                  }));
                }}
              />
            </div>
          );
        })}
      </Section>
    </div>
  );
}
