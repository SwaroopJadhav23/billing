import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen overflow-x-hidden md:flex">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="min-w-0 max-w-full flex-1 overflow-x-hidden">
        <Topbar onMenu={() => setOpen(true)} />
        <div className="max-w-full overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
