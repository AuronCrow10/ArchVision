import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store.js';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';
import styles from './AuthPage.module.css';
import { getApiErrorMessage } from '../utils/i18n.js';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name) errs.name = 'Campo obbligatorio.';
    if (!form.email) errs.email = 'Campo obbligatorio.';
    if (form.password.length < 8) errs.password = 'Minimo 8 caratteri.';
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Benvenuto, ${data.user.name}.`);
      navigate('/dashboard');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Registrazione non riuscita.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Building2 size={32} className={styles.logo} />
          <h1 className={styles.title}>ArchVision</h1>
          <p className={styles.subtitle}>Crea il tuo account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input label="Nome completo" type="text" name="name" placeholder="Mario Rossi" value={form.name} onChange={handleChange} error={errors.name} autoComplete="name" />
          <Input label="Email" type="email" name="email" placeholder="nome@esempio.com" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" />
          <Input label="Password" type="password" name="password" placeholder="Minimo 8 caratteri" value={form.password} onChange={handleChange} error={errors.password} autoComplete="new-password" />
          <Button type="submit" size="lg" loading={loading} className={styles.submitBtn}>
            Crea account
          </Button>
        </form>

        <p className={styles.footer}>
          Hai già un account? <Link to="/login">Accedi</Link>
        </p>
      </div>
    </div>
  );
}
