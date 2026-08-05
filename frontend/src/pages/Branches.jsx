import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useResource } from '../hooks/useResource';

const emptyForm = {
  name: '',
  code: '',
  address: '',
  mobile: '',
  managerName: '',
  status: 'active'
};

export default function Branches() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { items, create } = useResource('branches', { limit: 100 });

  function submit(event) {
    event.preventDefault();
    create.mutate(form, {
      onSuccess: () => {
        setOpen(false);
        setForm(emptyForm);
      }
    });
  }

  return (
    <>
      <DataTable
        title="Branches / Locations"
        rows={items}
        actions={<button className="btn-primary" onClick={() => setOpen(true)}>Add Branch</button>}
        columns={[
          { key: 'name', label: 'Branch' },
          { key: 'code', label: 'Code' },
          { key: 'managerName', label: 'Manager' },
          { key: 'mobile', label: 'Mobile' },
          { key: 'address', label: 'Address' },
          { key: 'status', label: 'Status' }
        ]}
      />
      <Modal title="Add Branch" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Branch name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <input className="input" placeholder="Branch code (optional)" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
          <input className="input" placeholder="Manager name" value={form.managerName} onChange={(event) => setForm({ ...form, managerName: event.target.value })} />
          <input className="input" placeholder="Mobile" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
          <input className="input sm:col-span-2" placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn-primary sm:col-span-2">Save Branch</button>
        </form>
      </Modal>
    </>
  );
}
