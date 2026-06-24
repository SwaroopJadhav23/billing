import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import { WalletCards } from 'lucide-react';
import { useResource } from '../hooks/useResource';
import { currency, dateTime } from '../utils/format';

const categories = ['Electricity', 'Rent', 'Salary', 'Purchases', 'Maintenance', 'Miscellaneous'];

export default function Expenses() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: 'Electricity', title: '', amount: 0, notes: '' });
  const { items, create } = useResource('expenses', { limit: 100 });
  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  function submit(event) {
    event.preventDefault();
    create.mutate(form, { onSuccess: () => setOpen(false) });
  }

  return (
    <div className="space-y-6">
      <StatCard label="Monthly Expense Summary" value={currency(total)} icon={WalletCards} tone="red" />
      <DataTable title="Expense Management" rows={items} actions={<button className="btn-primary" onClick={() => setOpen(true)}>Add Expense</button>} columns={[
        { key: 'category', label: 'Category' },
        { key: 'title', label: 'Title' },
        { key: 'amount', label: 'Amount', render: (row) => currency(row.amount) },
        { key: 'date', label: 'Date', render: (row) => dateTime(row.date) },
        { key: 'notes', label: 'Notes' }
      ]} />
      <Modal title="Add Expense" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
          <input className="input" placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <input className="input" type="number" placeholder="Amount" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
          <input className="input" placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          <button className="btn-primary sm:col-span-2">Save Expense</button>
        </form>
      </Modal>
    </div>
  );
}
