import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store.js';
import AppLayout from './components/layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProjectPage from './pages/ProjectPage.jsx';
import EditorPage from './pages/EditorPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.accessToken);
  return token ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const token = useAuthStore((s) => s.accessToken);
  return !token ? children : <Navigate to="/dashboard" replace />;
}

function AdminRoute({ children }) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  if (!token) return <Navigate to="/login" replace />;
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Guest only */}
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* Protected */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard"               element={<DashboardPage />} />
        <Route path="/admin"                   element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/projects/:id"            element={<ProjectPage />} />
        <Route path="/projects/:id/editor"     element={<EditorPage />} />
        <Route path="/projects/:id/editor/:renderId" element={<EditorPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
