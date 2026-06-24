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
import KOT from './pages/KOT';
import Orders from './pages/Orders';
import Menu from './pages/Menu';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const protectedPages = [
  { path: '/', element: <Dashboard /> },
  { path: '/pos', element: <POS /> },
  { path: '/tables', element: <Tables /> },
  { path: '/kot', element: <KOT /> },
  { path: '/orders', element: <Orders /> },
  { path: '/menu', element: <Menu /> },
  { path: '/customers', element: <Customers /> },
  { path: '/inventory', element: <Inventory /> },
  { path: '/staff', element: <Staff /> },
  { path: '/expenses', element: <Expenses /> },
  { path: '/reports', element: <Reports /> },
  { path: '/settings', element: <Settings /> }
];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AppLayout />}>
        {protectedPages.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={<ProtectedRoute allowedRoles={routePermissions[page.path]}>{page.element}</ProtectedRoute>}
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
