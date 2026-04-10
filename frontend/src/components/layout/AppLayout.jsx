import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store.js';
import api from '../../services/api.js';
import { LayoutDashboard, FolderOpen, LogOut, Building2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const { user, refreshToken, logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try { await api.post('/auth/logout', { refreshToken }); } catch {}
    logout();
    navigate('/login');
    toast.success('Disconnessione effettuata.');
  }

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Building2 size={22} className={styles.brandIcon} />
          <span className={styles.brandName}>ArchVision</span>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            <LayoutDashboard size={16} />
            Panoramica
          </NavLink>
          <NavLink
            to="/dashboard"
            end={false}
            className={({ isActive }) => `${styles.navLink}`}
            style={{ pointerEvents: 'none', opacity: 0.4 }}
          >
            <FolderOpen size={16} />
            Progetti
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <Shield size={16} />
              Admin
            </NavLink>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Disconnetti">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
