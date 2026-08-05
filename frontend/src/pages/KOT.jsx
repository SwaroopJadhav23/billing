import { io } from 'socket.io-client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { dateTime } from '../utils/format';

const statuses = ['new', 'preparing', 'ready', 'served'];

export default function KOT() {
  const queryClient = useQueryClient();
  const { items } = useResource('kots', { limit: 100 });

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.emit('join:kitchen');
    socket.on('kot:new', () => queryClient.invalidateQueries({ queryKey: ['kots'] }));
    socket.on('kot:updated', () => queryClient.invalidateQueries({ queryKey: ['kots'] }));
    return () => socket.disconnect();
  }, [queryClient]);

  async function setStatus(id, status) {
    await api.patch(`/kots/${id}/status`, { status });
    queryClient.invalidateQueries({ queryKey: ['kots'] });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {items.map((kot) => (
        <div key={kot._id} className="card">
          <div className="flex justify-between">
            <div><h3 className="text-xl font-black">{kot.kotNumber}</h3><p className="text-sm text-slate-500">{dateTime(kot.createdAt)}</p></div>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase text-orange-700 dark:bg-orange-950 dark:text-orange-200">{kot.status}</span>
          </div>
          <div className="mt-4 space-y-2">{kot.items?.map((item, index) => <div key={index} className="flex justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-800"><span>{item.name}</span><b>x{item.quantity}</b></div>)}</div>
          <div className="mt-5 grid grid-cols-2 gap-2">{statuses.map((status) => <button key={status} className="btn-muted capitalize" onClick={() => setStatus(kot._id, status)}>{status}</button>)}</div>
        </div>
      ))}
    </div>
  );
}
