import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Clock, CheckCircle, XCircle, Loader2, Image, Trash2 } from 'lucide-react';
import styles from './ProjectPage.module.css';
import { getApiErrorMessage, getRenderParamLabel } from '../utils/i18n.js';

const STATUS_META = {
  pending: { label: 'In attesa', icon: Clock, color: 'var(--text-muted)' },
  compositing: { label: 'Composizione', icon: Loader2, color: 'var(--info)' },
  rendering: { label: 'Generazione…', icon: Loader2, color: 'var(--accent)' },
  done: { label: 'Completato', icon: CheckCircle, color: 'var(--success)' },
  error: { label: 'Errore', icon: XCircle, color: 'var(--error)' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  const spinning = status === 'compositing' || status === 'rendering';
  return (
    <span className={styles.badge} style={{ color: meta.color, borderColor: meta.color }}>
      <Icon size={12} className={spinning ? styles.spin : ''} />
      {meta.label}
    </span>
  );
}

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then((r) => r.data),
  });

  const { data: renders = [], isLoading: loadingRenders } = useQuery({
    queryKey: ['renders', id],
    queryFn: () => api.get(`/renders?projectId=${id}`).then((r) => r.data),
    refetchInterval: (query) =>
      query.state.data?.some((r) => r.status === 'rendering' || r.status === 'compositing') ? 4000 : false,
  });

  const deleteRender = useMutation({
    mutationFn: (rid) => api.delete(`/renders/${rid}`),
    onSuccess: () => {
      qc.invalidateQueries(['renders', id]);
      toast.success('Render eliminato.');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Eliminazione del render non riuscita.')),
  });

  if (loadingProject) return <div className={styles.loading}>Caricamento…</div>;
  if (!project) return <div className={styles.loading}>Progetto non trovato.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Panoramica
        </button>
        <div className={styles.headerMain}>
          <h1 className={styles.title}>{project.name}</h1>
          {project.description && <p className={styles.desc}>{project.description}</p>}
        </div>
        <Button onClick={() => navigate(`/projects/${id}/editor`)}>
          <Plus size={16} /> Nuovo render
        </Button>
      </div>

      {loadingRenders ? (
        <div className={styles.grid}>
          {[1, 2].map((i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : renders.length === 0 ? (
        <div className={styles.empty}>
          <Image size={44} className={styles.emptyIcon} />
          <p>Nessun render per questo progetto.</p>
          <Button onClick={() => navigate(`/projects/${id}/editor`)} className={styles.emptyBtn}>
            <Plus size={16} /> Crea il primo render
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {renders.map((r) => (
            <div key={r.id} className={styles.card}>
              <div className={styles.thumb} onClick={() => navigate(`/projects/${id}/editor/${r.id}`)}>
                {r.result_path ? (
                  <img src={`/uploads/${r.result_path}`} alt="Risultato render" className={styles.thumbImg} />
                ) : r.composite_path ? (
                  <img src={`/uploads/${r.composite_path}`} alt="Anteprima composito" className={styles.thumbImg} style={{ filter: 'brightness(0.6)' }} />
                ) : (
                  <div className={styles.thumbPlaceholder}><Image size={28} /></div>
                )}
                <StatusBadge status={r.status} />
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardParams}>
                  {Array.isArray(r.render_params?.elementSpecs) && (
                    <span>
                      {r.render_params.elementSpecs.length} elementi
                    </span>
                  )}
                  {r.render_params?.style && <span>{getRenderParamLabel(r.render_params.style)}</span>}
                  {r.render_params?.materials && <span>{getRenderParamLabel(r.render_params.materials)}</span>}
                </div>
                <div className={styles.cardActions}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/projects/${id}/editor/${r.id}`)}
                  >
                    {r.status === 'done' ? 'Apri / Nuovo render' : 'Continua'}
                  </Button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteRender.mutate(r.id)}
                    title="Elimina"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
