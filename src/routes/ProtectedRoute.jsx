import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingPage from '../components/common/LoadingPage';

/**
 * Protects routes that require authentication.
 * If user is not authenticated, redirects to /login.
 * If allowedRoles is specified, also checks role access.
 */
export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) return <LoadingPage />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

/**
 * Redirects authenticated users away from /login.
 */
export function PublicRoute() {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) return <LoadingPage />;

  if (isAuthenticated) {
    const dashboardMap = {
      PENGHUNI: '/penghuni/dashboard',
      FASIL: '/fasil/dashboard',
      ADMIN: '/admin/dashboard',
    };
    return <Navigate to={dashboardMap[role] || '/'} replace />;
  }

  return <Outlet />;
}
