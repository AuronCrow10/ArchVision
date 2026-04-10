import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import CatalogManager from '../components/admin/CatalogManager.jsx';
import api from '../services/api.js';
import styles from './AdminPage.module.css';
import { FALLBACK_RENDER_CATALOG, normalizeRenderCatalog } from '../constants/renderElements.js';
import { getApiErrorMessage } from '../utils/i18n.js';

const TABS = [
  { id: 'users', label: 'Utenti' },
  { id: 'projects', label: 'Progetti' },
  { id: 'catalog', label: 'Render catalog' },
];

function TabButton({ active, label, onClick }) {
  return (
    <button type="button" className={`${styles.tabButton} ${active ? styles.tabActive : ''}`} onClick={onClick}>
      {label}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function UserRow({ user, onSave, onDelete, saving }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role, password: '' });

  useEffect(() => {
    setForm({ name: user.name, email: user.email, role: user.role, password: '' });
  }, [user]);

  return (
    <div className={styles.card}>
      <div className={styles.grid}>
        <Input label="Nome" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
        <Input label="Email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
        <div className={styles.field}>
          <label className={styles.label}>Ruolo</label>
          <select className={styles.select} value={form.role} onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <Input label="Nuova password (opzionale)" type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} />
      </div>
      <div className={styles.meta}>
        <span>{user.project_count} progetti</span>
        <span>{user.render_count} render</span>
        <span>{new Date(user.created_at).toLocaleString('it-IT')}</span>
      </div>
      <div className={styles.actions}>
        <Button size="sm" onClick={() => onSave(form)} loading={saving}>Salva</Button>
        <Button size="sm" variant="secondary" onClick={onDelete}>Elimina</Button>
      </div>
    </div>
  );
}

function ProjectRow({ project, users, onSave, onDelete, saving }) {
  const [form, setForm] = useState({
    user_id: project.user_id,
    name: project.name,
    description: project.description || '',
  });

  useEffect(() => {
    setForm({
      user_id: project.user_id,
      name: project.name,
      description: project.description || '',
    });
  }, [project]);

  return (
    <div className={styles.card}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>Owner</label>
          <select className={styles.select} value={form.user_id} onChange={(e) => setForm((current) => ({ ...current, user_id: e.target.value }))}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>
        <Input label="Nome progetto" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
        <Input label="Descrizione" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
        <Input label="Render" value={String(project.render_count || 0)} disabled />
      </div>
      <div className={styles.meta}>
        <span>{project.owner_name} ({project.owner_email})</span>
        <span>{new Date(project.created_at).toLocaleString('it-IT')}</span>
      </div>
      <div className={styles.actions}>
        <Button size="sm" onClick={() => onSave(form)} loading={saving}>Salva</Button>
        <Button size="sm" variant="secondary" onClick={onDelete}>Elimina</Button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [newProject, setNewProject] = useState({ user_id: '', name: '', description: '' });
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((response) => response.data),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => api.get('/admin/projects').then((response) => response.data),
  });

  const { data: renderCatalogData } = useQuery({
    queryKey: ['admin-render-catalog'],
    queryFn: () => api.get('/admin/render-catalog').then((response) => response.data),
  });

  const renderCatalog = useMemo(
    () => normalizeRenderCatalog(renderCatalogData || FALLBACK_RENDER_CATALOG),
    [renderCatalogData]
  );

  useEffect(() => {
    if (!newProject.user_id && users[0]?.id) {
      setNewProject((current) => ({ ...current, user_id: users[0].id }));
    }
  }, [newProject.user_id, users]);

  const createUser = useMutation({
    mutationFn: (payload) => api.post('/admin/users', payload).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      toast.success('Utente creato.');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Creazione utente non riuscita.')),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/admin/users/${id}`, payload).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('Utente aggiornato.');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Aggiornamento utente non riuscito.')),
  });

  const deleteUser = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-projects']);
      toast.success('Utente eliminato.');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Eliminazione utente non riuscita.')),
  });

  const createProject = useMutation({
    mutationFn: (payload) => api.post('/admin/projects', payload).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-projects']);
      setNewProject({ user_id: users[0]?.id || '', name: '', description: '' });
      toast.success('Progetto creato.');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Creazione progetto non riuscita.')),
  });

  const updateProject = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/admin/projects/${id}`, payload).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-projects']);
      toast.success('Progetto aggiornato.');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Aggiornamento progetto non riuscito.')),
  });

  const deleteProject = useMutation({
    mutationFn: (id) => api.delete(`/admin/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-projects']);
      toast.success('Progetto eliminato.');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Eliminazione progetto non riuscita.')),
  });

  const saveCatalog = useMutation({
    mutationFn: (payload) => api.put('/admin/render-catalog', payload).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-render-catalog']);
      queryClient.invalidateQueries(['render-catalog']);
      toast.success('Catalog render salvato.');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Salvataggio catalog non riuscito.')),
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin panel</h1>
        <p className={styles.subtitle}>CRUD completo su utenti, progetti e catalogo del render.</p>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <TabButton key={tab.id} label={tab.label} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
        ))}
      </div>

      {activeTab === 'users' && (
        <div className={styles.stack}>
          <Section title="Crea utente">
            <div className={styles.grid}>
              <Input label="Nome" value={newUser.name} onChange={(e) => setNewUser((current) => ({ ...current, name: e.target.value }))} />
              <Input label="Email" value={newUser.email} onChange={(e) => setNewUser((current) => ({ ...current, email: e.target.value }))} />
              <Input label="Password" type="password" value={newUser.password} onChange={(e) => setNewUser((current) => ({ ...current, password: e.target.value }))} />
              <div className={styles.field}>
                <label className={styles.label}>Ruolo</label>
                <select className={styles.select} value={newUser.role} onChange={(e) => setNewUser((current) => ({ ...current, role: e.target.value }))}>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
            <div className={styles.actions}>
              <Button onClick={() => createUser.mutate(newUser)} loading={createUser.isPending}>Crea utente</Button>
            </div>
          </Section>

          <Section title="Utenti">
            {users.map((user) => (
              <UserRow key={user.id} user={user} onSave={(payload) => updateUser.mutate({ id: user.id, payload })} onDelete={() => deleteUser.mutate(user.id)} saving={updateUser.isPending || deleteUser.isPending} />
            ))}
          </Section>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className={styles.stack}>
          <Section title="Crea progetto">
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>Owner</label>
                <select className={styles.select} value={newProject.user_id} onChange={(e) => setNewProject((current) => ({ ...current, user_id: e.target.value }))}>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <Input label="Nome progetto" value={newProject.name} onChange={(e) => setNewProject((current) => ({ ...current, name: e.target.value }))} />
              <Input label="Descrizione" value={newProject.description} onChange={(e) => setNewProject((current) => ({ ...current, description: e.target.value }))} />
            </div>
            <div className={styles.actions}>
              <Button onClick={() => createProject.mutate(newProject)} loading={createProject.isPending}>Crea progetto</Button>
            </div>
          </Section>

          <Section title="Progetti">
            {projects.map((project) => (
              <ProjectRow key={project.id} project={project} users={users} onSave={(payload) => updateProject.mutate({ id: project.id, payload })} onDelete={() => deleteProject.mutate(project.id)} saving={updateProject.isPending || deleteProject.isPending} />
            ))}
          </Section>
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className={styles.stack}>
          <CatalogManager catalog={renderCatalog} onSave={(payload) => saveCatalog.mutateAsync(payload)} saving={saveCatalog.isPending} />
        </div>
      )}
    </div>
  );
}
