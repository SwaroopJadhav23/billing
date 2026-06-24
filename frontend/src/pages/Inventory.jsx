import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import { Package, TriangleAlert } from 'lucide-react';
import { useResource } from '../hooks/useResource';
import { currency } from '../utils/format';

export default function Inventory() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ materialName: '', unit: 'kg', currentStock: 0, minimumStockLevel: 0, purchaseCost: 0 });
  const { items, create } = useResource('inventory', { limit: 100 });
  const low = items.filter((item) => item.currentStock <= item.minimumStockLevel);

  function submit(event) {
    event.preventDefault();
    create.mutate(form, { onSuccess: () => setOpen(false) });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Available Stock Items" value={items.length} icon={Package} /><StatCard label="Low Stock Items" value={low.length} icon={TriangleAlert} tone="red" /><StatCard label="Purchase Summary" value={currency(items.reduce((sum, item) => sum + Number(item.purchaseCost || 0), 0))} icon={Package} tone="green" /></div>
      <DataTable title="Inventory Management" rows={items} actions={<button className="btn-primary" onClick={() => setOpen(true)}>Add Raw Material</button>} columns={[
        { key: 'materialName', label: 'Material' },
        { key: 'unit', label: 'Unit' },
        { key: 'currentStock', label: 'Current Stock' },
        { key: 'minimumStockLevel', label: 'Minimum Stock' },
        { key: 'purchaseCost', label: 'Purchase Cost', render: (row) => currency(row.purchaseCost) }
      ]} />
      <Modal title="Add Raw Material" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          {Object.keys(form).map((key) => <input key={key} className="input" placeholder={key} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />)}
          <button className="btn-primary sm:col-span-2">Save Material</button>
        </form>
      </Modal>
    </div>
  );
}
