import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useResource } from '../hooks/useResource';
import { dateTime, roleLabel } from '../utils/format';

const roles = ['manager', 'cashier', 'waiter', 'kitchen_staff'];

export default function Staff() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', role: 'cashier', joiningDate: '', status: 'active', branch: '' });
  const { items, create } = useResource('staff', { limit: 100 });
  const { items: branches } = useResource('branches', { limit: 100, status: 'active' });

  function submit(event) {
    event.preventDefault();
    const payload = { ...form, branch: form.branch || null };
    create.mutate(payload, {
      onSuccess: () => {
        setOpen(false);
        setForm({ name: '', mobile: '', email: '', role: 'cashier', joiningDate: '', status: 'active', branch: '' });
      }
    });
  }

  return (
    <>
      <DataTable title="Staff Management" rows={items} actions={<button className="btn-primary" onClick={() => setOpen(true)}>Add Employee</button>} columns={[
        { key: 'name', label: 'Name' },
        { key: 'mobile', label: 'Mobile' },
        { key: 'email', label: 'Email' },
        { key: 'branch', label: 'Branch', render: (row) => row.branch?.name || 'All / HQ' },
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
          <select className="input" value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })}>
            <option value="">All / HQ (no branch)</option>
            {branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
          </select>
          <input className="input" type="date" value={form.joiningDate} onChange={(event) => setForm({ ...form, joiningDate: event.target.value })} />
          <button className="btn-primary sm:col-span-2">Save Employee</button>
        </form>
      </Modal>
    </>
  );
}
