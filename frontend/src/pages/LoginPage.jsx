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

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
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
    if (!form.email) errs.email = 'Campo obbligatorio.';
    if (!form.password) errs.password = 'Campo obbligatorio.';
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Bentornato, ${data.user.name}.`);
      navigate('/dashboard');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Accesso non riuscito.');
      toast.error(msg);
      setErrors({ password: msg });
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
          <p className={styles.subtitle}>Accedi al tuo spazio di lavoro</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="nome@esempio.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />
          <Button type="submit" size="lg" loading={loading} className={styles.submitBtn}>Accedi</Button>
        </form>

        <p className={styles.footer}>
          Non hai un account?{' '}
          <Link to="/register">Creane uno</Link>
        </p>
      </div>
    </div>
  );
}

