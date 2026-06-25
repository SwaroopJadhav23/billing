import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { roleLabel } from '../utils/format';

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/85 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85 md:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <button className="btn-muted md:hidden" onClick={onMenu}><Menu size={18} /></button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Premium POS</p>
          <h2 className="text-xl font-black">Restaurant Operations</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-muted" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <div className="hidden rounded-2xl bg-white px-4 py-2 text-right text-sm shadow-sm dark:bg-slate-900 sm:block">
            <p className="font-bold">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500">{roleLabel(user?.role)}</p>
          </div>
          <button className="btn-muted" onClick={logout}><LogOut size={18} /></button>
        </div>
      </div>
    </header>
  );
}
