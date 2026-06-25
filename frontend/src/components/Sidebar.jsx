import { NavLink } from 'react-router-dom';
import { BarChart3, ChefHat, ClipboardList, LayoutDashboard, Package, ReceiptText, Settings, ShoppingCart, Table2, Users, WalletCards, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { routePermissions } from '../routes/permissions';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pos', label: 'Billing POS', icon: ShoppingCart },
  { path: '/tables', label: 'Tables', icon: Table2 },
  { path: '/orders', label: 'Orders', icon: ClipboardList },
  { path: '/menu', label: 'Menu', icon: ReceiptText },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/staff', label: 'Staff', icon: Users },
  { path: '/expenses', label: 'Expenses', icon: WalletCards },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = navItems.filter((item) => routePermissions[item.path]?.includes(user?.role));

  return (
    <>
      <div className={`fixed inset-0 z-30 bg-slate-950/40 md:hidden ${open ? 'block' : 'hidden'}`} onClick={onClose} />
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 -translate-x-full border-r border-slate-200 bg-white p-4 transition md:static md:translate-x-0 dark:border-slate-800 dark:bg-slate-950 ${open ? 'translate-x-0' : ''}`}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white"><ChefHat size={22} /></div>
            <div>
              <p className="text-sm text-slate-500">Restaurant</p>
              <h1 className="text-lg font-black">POS Billing</h1>
            </div>
          </div>
          <button className="md:hidden" onClick={onClose}><X /></button>
        </div>
        <nav className="space-y-1">
          {items.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-orange-950/40 dark:text-orange-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
