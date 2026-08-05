import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { routePermissions } from './routes/permissions';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Tables from './pages/Tables';
import Orders from './pages/Orders';
import Menu from './pages/Menu';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import Branches from './pages/Branches';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Tenants from './pages/super-admin/Tenants';
import TenantDetail from './pages/super-admin/TenantDetail';

const protectedPages = [
  { path: '/super-admin', element: <Tenants />, roles: routePermissions['/super-admin'] },
  { path: '/super-admin/tenants/:id', element: <TenantDetail />, roles: routePermissions['/super-admin/tenants/:id'] },
  { path: '/dashboard', element: <Dashboard />, roles: routePermissions['/dashboard'] },
  { path: '/pos', element: <POS />, roles: routePermissions['/pos'] },
  { path: '/tables', element: <Tables />, roles: routePermissions['/tables'] },
  { path: '/orders', element: <Orders />, roles: routePermissions['/orders'] },
  { path: '/menu', element: <Menu />, roles: routePermissions['/menu'] },
  { path: '/customers', element: <Customers />, roles: routePermissions['/customers'] },
  { path: '/inventory', element: <Inventory />, roles: routePermissions['/inventory'] },
  { path: '/staff', element: <Staff />, roles: routePermissions['/staff'] },
  { path: '/branches', element: <Branches />, roles: routePermissions['/branches'] },
  { path: '/expenses', element: <Expenses />, roles: routePermissions['/expenses'] },
  { path: '/reports', element: <Reports />, roles: routePermissions['/reports'] },
  { path: '/settings', element: <Settings />, roles: routePermissions['/settings'] }
];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AppLayout />}>
        {protectedPages.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={<ProtectedRoute allowedRoles={page.roles}>{page.element}</ProtectedRoute>}
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
