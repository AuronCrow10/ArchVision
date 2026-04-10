import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api.js';
import CanvasEditor from '../components/editor/CanvasEditor.jsx';
import FileDropzone from '../components/editor/FileDropzone.jsx';
import RenderParamsPanel from '../components/editor/RenderParamsPanel.jsx';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Download, RotateCcw, Loader2, CheckCircle, XCircle } from 'lucide-react';
import styles from './EditorPage.module.css';
import { getApiErrorMessage, translateBackendMessage } from '../utils/i18n.js';
import {
  FALLBACK_RENDER_CATALOG,
  createDefaultElementSpecs,
  normalizeElementSpecs,
  normalizeRenderCatalog,
  withLegacyMaterialPreset,
} from '../constants/renderElements.js';

const STEPS = ['Carica', 'Posiziona', 'Genera', 'Risultato'];

const DEFAULT_LOCATION_DESCRIPTION = 'Use the exact existing location visible in the input image; keep background, camera viewpoint, perspective, framing, and horizon unchanged.';
const DEFAULT_EXTRA_NOTES = 'Preserve exact building footprint, position, scale, perspective, and framing. Do not move, resize, rotate, or alter massing/opening layout. Only improve realism of the existing overlay.';

function createDefaultRenderParams(catalog) {
  const availableCatalog = normalizeRenderCatalog(catalog);
  return {
    style: availableCatalog.styles[0]?.value || 'Modern Contemporary',
    lighting: availableCatalog.lightings[0]?.value || 'Golden Hour',
    season: availableCatalog.seasons[0]?.value || 'Summer',
    elementSpecs: createDefaultElementSpecs(),
    maskPlan: {
      mode: 'planned_manual_masks',
      version: 1,
    },
    materials: 'Concrete & Glass',
    locationDescription: DEFAULT_LOCATION_DESCRIPTION,
    extra: DEFAULT_EXTRA_NOTES,
  };
}

function normalizeRenderParams(raw = {}, catalog = FALLBACK_RENDER_CATALOG) {
  const availableCatalog = normalizeRenderCatalog(catalog);
  const defaults = createDefaultRenderParams(availableCatalog);
  const merged = { ...defaults, ...raw };
  merged.elementSpecs = normalizeElementSpecs(availableCatalog, raw.elementSpecs);
  if (!Array.isArray(raw.elementSpecs) && raw.materials) {
    merged.elementSpecs = withLegacyMaterialPreset(availableCatalog, merged.elementSpecs, raw.materials);
  }
  const materialLabelMap = Object.fromEntries(availableCatalog.materials.map((material) => [material.code, material.label || material.code]));
  const activeMaterials = [...new Set(
    merged.elementSpecs
      .map((spec) => materialLabelMap[spec.material] || spec.material)
      .filter(Boolean)
  )];
  if (!String(raw.materials || '').trim()) {
    merged.materials = activeMaterials.slice(0, 3).join(', ') || 'Custom Elements';
  }
  merged.maskPlan = {
    mode: raw?.maskPlan?.mode || defaults.maskPlan.mode,
    version: 1,
  };
  if (!String(merged.locationDescription || '').trim()) merged.locationDescription = DEFAULT_LOCATION_DESCRIPTION;
  if (!String(merged.extra || '').trim()) merged.extra = DEFAULT_EXTRA_NOTES;
  return merged;
}

const DEFAULT_PARAMS = createDefaultRenderParams(FALLBACK_RENDER_CATALOG);
/* legacy constant preserved for initial state readability */
const DEFAULT_RENDER_PARAMS = {
  style: 'Modern Contemporary',
  lighting: 'Golden Hour',
  season: 'Summer',
  elementSpecs: createDefaultElementSpecs(),
  maskPlan: {
    mode: 'planned_manual_masks',
    version: 1,
  },
  materials: 'Concrete & Glass',
  locationDescription: DEFAULT_LOCATION_DESCRIPTION,
  extra: DEFAULT_EXTRA_NOTES,
};

export default function EditorPage() {
  const { id: projectId, renderId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(renderId ? 1 : 0);

  const [prospettoFile, setProspettoFile] = useState(null);
  const [locationFile, setLocationFile] = useState(null);

  const [render, setRender] = useState(null);
  const [loading, setLoading] = useState(false);

  const [compositeParams, setCompositeParams] = useState(null);

  const [renderParams, setRenderParams] = useState(DEFAULT_RENDER_PARAMS);
  const [prospettoPreview, setProspettoPreview] = useState(null);
  const [locationPreview, setLocationPreview] = useState(null);
  const [preparedOverlayPath, setPreparedOverlayPath] = useState(null);
  const [preparedOverlayUrl, setPreparedOverlayUrl] = useState(null);
  const [isPreparingCleanupPreview, setIsPreparingCleanupPreview] = useState(false);
  const cleanupPreviewRequestRef = useRef(0);
  const cleanupPreviewErrorRef = useRef(null);

  const { data: renderCatalogData } = useQuery({
    queryKey: ['render-catalog'],
    queryFn: () => api.get('/renders/catalog').then((r) => r.data),
    staleTime: 60_000,
  });
  const renderCatalog = normalizeRenderCatalog(renderCatalogData || FALLBACK_RENDER_CATALOG);

  const { data: existingRenderData } = useQuery({
    queryKey: ['render', renderId],
    queryFn: () => api.get(`/renders/${renderId}`).then((r) => r.data),
    enabled: !!renderId && !render,
  });

  useEffect(() => {
    if (!existingRenderData) return;
    setRender(existingRenderData);
    if (existingRenderData.render_params) {
      setRenderParams(normalizeRenderParams(existingRenderData.render_params, renderCatalog));
    }
    if (existingRenderData.status === 'done') setStep(3);
    else if (existingRenderData.composite_path) setStep(2);
    else if (existingRenderData.prospetto_path && existingRenderData.location_path) setStep(1);
    else setStep(0);
  }, [existingRenderData, renderCatalog]);

  useEffect(() => {
    if (existingRenderData?.render_params) return;
    setRenderParams((current) => normalizeRenderParams(current, renderCatalog));
  }, [renderCatalog, existingRenderData?.render_params]);

  const { data: polledRenderData } = useQuery({
    queryKey: ['render-poll', render?.id],
    queryFn: () => api.get(`/renders/${render.id}`).then((r) => r.data),
    enabled: !!render?.id && (render.status === 'rendering' || render.status === 'compositing'),
    refetchInterval: 3500,
  });

  useEffect(() => {
    if (!polledRenderData) return;

    const previousStatus = render?.status;
    setRender(polledRenderData);

    if (polledRenderData.status === 'done' && previousStatus !== 'done') {
      toast.success('Render completato.');
      setStep(3);
    }
    if (polledRenderData.status === 'error' && previousStatus !== 'error') {
      const renderErr = translateBackendMessage(polledRenderData.error_message, 'Si è verificato un errore durante il rendering.');
      toast.error(`Render non riuscito: ${renderErr}`);
    }
  }, [polledRenderData, render?.status]);

  async function handleUpload() {
    if (!prospettoFile || !locationFile) return toast.error('Entrambe le immagini sono obbligatorie.');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('prospetto', prospettoFile);
      fd.append('location', locationFile);
      fd.append('project_id', projectId);
      const { data } = await api.post('/renders/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRender(data);
      setStep(1);
      navigate(`/projects/${projectId}/editor/${data.id}`, { replace: true });
      toast.success('File caricati.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Caricamento non riuscito.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleComposite() {
    if (!compositeParams) return toast.error('Posiziona prima il prospetto sulla foto.');
    if (cleanupEnabled && !preparedOverlayPath) {
      return toast.error('L\'anteprima del cleanup è ancora in preparazione. Attendi un momento.');
    }
    setLoading(true);
    try {
      const payload = {
        ...compositeParams,
      };
      if (cleanupEnabled && preparedOverlayPath) {
        payload.preparedOverlayPath = preparedOverlayPath;
      }

      const { data } = await api.post(`/renders/${render.id}/composite`, payload);
      setRender(data);
      setStep(2);
      toast.success('Composito pronto.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Composizione non riuscita.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      await api.post(`/renders/${render.id}/generate`, renderParams);
      setRender((r) => ({ ...r, status: 'rendering' }));
      toast.success('Render AI avviato: richiede circa 30-60 secondi.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Generazione non riuscita.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!prospettoFile) {
      setProspettoPreview(null);
      return;
    }

    const url = URL.createObjectURL(prospettoFile);
    setProspettoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [prospettoFile]);

  useEffect(() => {
    if (!locationFile) {
      setLocationPreview(null);
      return;
    }

    const url = URL.createObjectURL(locationFile);
    setLocationPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [locationFile]);

  const prospettoSrc = prospettoPreview || (render?.prospetto_path ? `/uploads/${render.prospetto_path}` : null);
  const locationSrc = locationPreview || (render?.location_path ? `/uploads/${render.location_path}` : null);
  const cleanupConfig = compositeParams?.cleanup || null;
  const cleanupEnabled = cleanupConfig?.enabled === true;
  const cleanupSignature = cleanupConfig ? JSON.stringify(cleanupConfig) : '';

  useEffect(() => {
    const requestId = ++cleanupPreviewRequestRef.current;

    if (
      step !== 1 ||
      !render?.id ||
      !cleanupEnabled ||
      !prospettoSrc
    ) {
      setIsPreparingCleanupPreview(false);
      setPreparedOverlayPath(null);
      setPreparedOverlayUrl(null);
      cleanupPreviewErrorRef.current = null;
      return;
    }

    let cancelled = false;
    setIsPreparingCleanupPreview(true);

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.post(`/renders/${render.id}/cleanup-preview`, {
          cleanup: cleanupConfig,
        });
        if (cancelled || requestId !== cleanupPreviewRequestRef.current) return;
        setPreparedOverlayPath(data.preparedOverlayPath || null);
        setPreparedOverlayUrl(data.preparedOverlayUrl || null);
        cleanupPreviewErrorRef.current = null;
      } catch (err) {
        if (!cancelled) {
          const errorMessage = getApiErrorMessage(err, "Generazione dell'anteprima di pulizia non riuscita.");
          if (cleanupPreviewErrorRef.current !== errorMessage) {
            cleanupPreviewErrorRef.current = errorMessage;
            toast.error(errorMessage);
          }
          setPreparedOverlayPath(null);
          setPreparedOverlayUrl(null);
        }
      } finally {
        if (!cancelled && requestId === cleanupPreviewRequestRef.current) {
          setIsPreparingCleanupPreview(false);
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [step, render?.id, cleanupEnabled, cleanupSignature, prospettoSrc]);

  const isRendering = render?.status === 'rendering' || render?.status === 'compositing';
  const needsPreparedOverlay = cleanupEnabled;
  const applyDisabled =
    !compositeParams ||
    (needsPreparedOverlay && (isPreparingCleanupPreview || !preparedOverlayPath));

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button className={styles.back} onClick={() => navigate(`/projects/${projectId}`)}>
          <ArrowLeft size={15} /> Torna al progetto
        </button>
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={s} className={`${styles.stepItem} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
              <div className={styles.stepDot}>{i < step ? '✓' : i + 1}</div>
              <span className={styles.stepLabel}>{s}</span>
              {i < STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>
        <div style={{ width: 120 }} />
      </div>

      <div className={styles.body}>
        {step === 0 && (
          <div className={styles.uploadStep}>
            <h2 className={styles.stepTitle}>Carica immagini</h2>
            <p className={styles.stepHint}>
              Carica il disegno del prospetto architettonico e una foto della location di destinazione.
            </p>
            <div className={styles.uploadGrid}>
              <FileDropzone
                label="Prospetto (Disegno di elevazione)"
                hint="PNG o JPG - disegno architettonico del prospetto"
                value={prospettoFile}
                onFile={setProspettoFile}
              />
              <FileDropzone
                label="Foto location"
                hint="Foto del sito in cui verrà inserito l'edificio"
                value={locationFile}
                onFile={setLocationFile}
              />
            </div>
            <div className={styles.stepActions}>
              <Button
                size="lg"
                onClick={handleUpload}
                loading={loading}
                disabled={!prospettoFile || !locationFile}
              >
                Continua <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className={styles.editorStep}>
            <div className={styles.editorMain}>
              <h2 className={styles.stepTitle}>Posiziona il prospetto</h2>
              <p className={styles.stepHint}>Trascina e ridimensiona il prospetto per collocarlo sulla foto della location.</p>
              <div className={styles.canvasWrapper}>
                <CanvasEditor
                  locationSrc={locationSrc}
                  prospettoSrc={prospettoSrc}
                  previewProspettoSrc={cleanupEnabled ? preparedOverlayUrl : null}
                  isCleanupPreviewUpdating={isPreparingCleanupPreview}
                  onChange={setCompositeParams}
                />
              </div>
            </div>
            <div className={styles.stepActions}>
              <Button variant="secondary" onClick={() => setStep(0)}>Indietro</Button>
              <Button size="lg" onClick={handleComposite} loading={loading} disabled={applyDisabled}>
                Applica posizionamento <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.renderStep}>
            <div className={styles.renderLeft}>
              <h2 className={styles.stepTitle}>Configura il render</h2>
              <p className={styles.stepHint}>Imposta materiali, stile e illuminazione per il render AI.</p>
              {render?.composite_path && (
                <div className={styles.compositePreview}>
                  <img src={`/uploads/${render.composite_path}`} alt="Anteprima composito" />
                  <span className={styles.compositeLabel}>Anteprima composito</span>
                </div>
              )}
            </div>
            <div className={styles.renderRight}>
              <RenderParamsPanel params={renderParams} onChange={setRenderParams} catalog={renderCatalog} />
              <div className={styles.stepActions}>
                <Button variant="secondary" onClick={() => setStep(1)}>Indietro</Button>
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  loading={loading || isRendering}
                  disabled={isRendering}
                >
                  {isRendering ? (
                    <><Loader2 size={16} className={styles.spin} /> In generazione…</>
                  ) : (
                    <>Genera render <ArrowRight size={16} /></>
                  )}
                </Button>
              </div>
              {isRendering && (
                <p className={styles.renderingNote}>
                  Render AI in corso: in genere richiede 30-90 secondi. Puoi uscire e tornare in seguito.
                </p>
              )}
            </div>
          </div>
        )}

        {step === 3 && render?.result_path && (
          <div className={styles.resultStep}>
            <div className={styles.resultHeader}>
              <CheckCircle size={20} className={styles.successIcon} />
              <h2 className={styles.stepTitle}>Render completato</h2>
            </div>
            <div className={styles.resultImages}>
              <div className={styles.resultCard}>
                <span className={styles.resultCardLabel}>Render AI</span>
                <img src={`/uploads/${render.result_path}`} alt="Risultato render AI" className={styles.resultImg} />
                <a href={`/uploads/${render.result_path}`} download className={styles.downloadLink}>
                  <Download size={14} /> Scarica
                </a>
              </div>
              {render.composite_path && (
                <div className={styles.resultCard}>
                  <span className={styles.resultCardLabel}>Composito tecnico</span>
                  <img src={`/uploads/${render.composite_path}`} alt="Composito" className={styles.resultImg} />
                </div>
              )}
            </div>
            <div className={styles.stepActions}>
              <Button variant="secondary" onClick={() => setStep(2)}>
                <RotateCcw size={15} /> Rigenera con nuovi parametri
              </Button>
              <Button onClick={() => navigate(`/projects/${projectId}`)}>
                Torna al progetto
              </Button>
            </div>
          </div>
        )}

        {render?.status === 'error' && step !== 3 && (
          <div className={styles.errorBanner}>
            <XCircle size={16} />
            <span>Render non riuscito: {translateBackendMessage(render.error_message, 'Si è verificato un errore durante il rendering.')}</span>
            <Button size="sm" variant="secondary" onClick={() => setStep(2)}>Riprova</Button>
          </div>
        )}
      </div>
    </div>
  );
}
