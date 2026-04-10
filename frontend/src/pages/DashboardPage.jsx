import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import { useAuthStore } from '../store/auth.store.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import toast from 'react-hot-toast';
import { Plus, FolderOpen, Images, Trash2, X } from 'lucide-react';
import styles from './DashboardPage.module.css';
import { getApiErrorMessage } from '../utils/i18n.js';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data),
  });

  const createProject = useMutation({
    mutationFn: (body) => api.post('/projects', body).then((r) => r.data),
    onSuccess: (project) => {
      qc.invalidateQueries(['projects']);
      toast.success('Progetto creato.');
      setShowModal(false);
      setForm({ name: '', description: '' });
      navigate(`/projects/${project.id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Creazione del progetto non riuscita.')),
  });

  const deleteProject = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['projects']);
      toast.success('Progetto eliminato.');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Eliminazione del progetto non riuscita.')),
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Il nome del progetto è obbligatorio.');
    createProject.mutate(form);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Progetti</h1>
          <p className={styles.subtitle}>Bentornato, {user?.name}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nuovo progetto
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className={styles.empty}>
          <FolderOpen size={48} className={styles.emptyIcon} />
          <p>Nessun progetto disponibile.</p>
          <p className={styles.emptyHint}>Crea il tuo primo progetto per iniziare a generare render.</p>
          <Button onClick={() => setShowModal(true)} className={styles.emptyBtn}>
            <Plus size={16} /> Crea progetto
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((p) => (
            <div key={p.id} className={styles.card} onClick={() => navigate(`/projects/${p.id}`)}>
              <div className={styles.cardTop}>
                <div className={styles.cardIcon}><FolderOpen size={20} /></div>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject.mutate(p.id);
                  }}
                  title="Elimina progetto"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className={styles.cardName}>{p.name}</h3>
              {p.description && <p className={styles.cardDesc}>{p.description}</p>}
              <div className={styles.cardMeta}>
                <span className={styles.metaItem}>
                  <Images size={12} /> {p.render_count} render
                </span>
                <span className={styles.metaDate}>{formatDate(p.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Nuovo progetto</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className={styles.modalForm}>
              <Input
                label="Nome progetto"
                placeholder="es. Villa Moderna - Milano"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
              <Input
                label="Descrizione (facoltativa)"
                placeholder="Brevi note sul progetto"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <div className={styles.modalActions}>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Annulla</Button>
                <Button type="submit" loading={createProject.isPending}>Crea</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
