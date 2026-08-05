import { useQuery } from '@tanstack/react-query';
import { BarChart3, ChefHat, IndianRupee, Table2, Users } from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { currency } from '../utils/format';

const fallbackCards = { todaySales: 0, totalOrders: 0, totalRevenue: 0, occupiedTables: 0, availableTables: 0, activeCustomers: 0, pendingKots: 0, todayCollection: 0 };

function MiniBars({ title, data = [] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="space-y-3">
        {data.length === 0 && <p className="text-sm text-slate-500">No data yet</p>}
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs"><span>{item.label}</span><span>{currency(item.value)}</span></div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-brand-600" style={{ width: `${(item.value / max) * 100}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: async () => (await api.get('/dashboard')).data });
  const cards = data?.cards || fallbackCards;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Sales" value={currency(cards.todaySales)} icon={IndianRupee} />
        <StatCard label="Total Orders" value={cards.totalOrders} icon={BarChart3} tone="blue" />
        <StatCard label="Occupied Tables" value={cards.occupiedTables} icon={Table2} tone="red" />
        <StatCard label="Available Tables" value={cards.availableTables} icon={Table2} tone="green" />
        <StatCard label="Active Customers" value={cards.activeCustomers} icon={Users} tone="blue" />
        <StatCard label="Pending KOTs" value={cards.pendingKots} icon={ChefHat} />
        <StatCard label="Today's Collection" value={currency(cards.todayCollection)} icon={IndianRupee} tone="green" />
        <StatCard label="Total Revenue" value={currency(cards.totalRevenue)} icon={IndianRupee} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <MiniBars title="Daily Sales" data={data?.charts?.dailySales} />
        <MiniBars title="Weekly Revenue" data={data?.charts?.weeklyRevenue} />
        <MiniBars title="Monthly Revenue" data={data?.charts?.monthlyRevenue} />
        <MiniBars title="Top Selling Items" data={data?.charts?.topSellingItems} />
      </div>
    </div>
  );
}
