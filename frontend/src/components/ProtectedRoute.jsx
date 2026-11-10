import { useAuth } from '../auth/useAuth';
import { homeForRole } from '../auth/roles';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  if (!user || !sessionStorage.getItem('repairflow_token')) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />;
  return <Outlet />;
}
