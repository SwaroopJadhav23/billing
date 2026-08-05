import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTE_FEATURE_MAP, hasFeature } from '../config/tenantFeatures';
import { homePathForRole, ROLES } from '../routes/permissions';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/" replace state={{ from: location }} />;
  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to={homePathForRole(user?.role, user?.features)} replace />;
  }

  const featureKey = ROUTE_FEATURE_MAP[location.pathname];
  if (user?.role !== ROLES.SUPER_ADMIN && featureKey && !hasFeature(user?.features, featureKey)) {
    return <Navigate to={homePathForRole(user?.role, user?.features)} replace />;
  }

  return children;
}
