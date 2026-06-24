import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useResource } from '../hooks/useResource';
import { currency, dateTime } from '../utils/format';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', address: '' });
  const { items, create } = useResource('customers', { search });

  function submit(event) {
    event.preventDefault();
    create.mutate(form, { onSuccess: () => setOpen(false) });
  }

  return (
    <>
      <DataTable title="Customer Database" search={search} onSearch={setSearch} rows={items} actions={<button className="btn-primary" onClick={() => setOpen(true)}>Add Customer</button>} columns={[
        { key: 'name', label: 'Name' },
        { key: 'mobile', label: 'Mobile' },
        { key: 'email', label: 'Email' },
        { key: 'totalOrders', label: 'Orders' },
        { key: 'totalSpending', label: 'Spending', render: (row) => currency(row.totalSpending) },
        { key: 'lastOrderDate', label: 'Last Order', render: (row) => dateTime(row.lastOrderDate) }
      ]} />
      <Modal title="Add Customer" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          {Object.keys(form).map((key) => <input key={key} className="input" placeholder={key} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required={['name', 'mobile'].includes(key)} />)}
          <button className="btn-primary sm:col-span-2">Save Customer</button>
        </form>
      </Modal>
    </>
  );
}
