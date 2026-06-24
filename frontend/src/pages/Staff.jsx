import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useResource } from '../hooks/useResource';
import { dateTime, roleLabel } from '../utils/format';

const roles = ['manager', 'cashier', 'waiter', 'kitchen_staff'];

export default function Staff() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', role: 'cashier', joiningDate: '', status: 'active' });
  const { items, create } = useResource('staff', { limit: 100 });

  function submit(event) {
    event.preventDefault();
    create.mutate(form, { onSuccess: () => setOpen(false) });
  }

  return (
    <>
      <DataTable title="Staff Management" rows={items} actions={<button className="btn-primary" onClick={() => setOpen(true)}>Add Employee</button>} columns={[
        { key: 'name', label: 'Name' },
        { key: 'mobile', label: 'Mobile' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role', render: (row) => roleLabel(row.role) },
        { key: 'joiningDate', label: 'Joining Date', render: (row) => dateTime(row.joiningDate) },
        { key: 'status', label: 'Status' }
      ]} />
      <Modal title="Add Employee" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <input className="input" placeholder="Mobile" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <select className="input" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>{roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select>
          <input className="input" type="date" value={form.joiningDate} onChange={(event) => setForm({ ...form, joiningDate: event.target.value })} />
          <button className="btn-primary">Save Employee</button>
        </form>
      </Modal>
    </>
  );
}
