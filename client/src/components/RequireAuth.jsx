import { Navigate, useLocation } from 'react-router-dom';
import './RequireAuth.css';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children, admin }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page require-auth-loading">Cargando…</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (admin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
