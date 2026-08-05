import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen md:flex">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="min-w-0 flex-1">
        <Topbar onMenu={() => setOpen(true)} />
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
