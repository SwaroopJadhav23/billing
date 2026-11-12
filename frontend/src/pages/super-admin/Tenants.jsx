import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus } from 'lucide-react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { api } from '../../services/api';
import { dateTime } from '../../utils/format';

const emptyForm = {
  name: '',
  businessType: 'kirana',
  ownerName: '',
  email: '',
  mobile: '',
  address: '',
  gstNumber: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  adminMobile: ''
};

export default function Tenants() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ['tenants', search, status], [search, status]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: payload } = await api.get('/tenants', { params: { search, status, limit: 100 } });
      return payload;
    }
  });

  const create = useMutation({
    mutationFn: async (payload) => {
      const { data: result } = await api.post('/tenants', payload);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setOpen(false);
      setForm(emptyForm);
      setError('');
      if (result?.temporaryPassword) {
        window.alert(`Client created.\nLogin: ${result.admin?.email}\nTemporary password (copy now): ${result.temporaryPassword}`);
      }
    },
    onError: (err) => setError(err.response?.data?.message || 'Unable to create store')
  });

  function submit(event) {
    event.preventDefault();
    setError('');
    create.mutate(form);
  }

  const rows = data?.items || [];

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Super Admin</p>
          <h2 className="text-2xl font-black">Clients</h2>
          <p className="mt-1 text-sm text-slate-500">Create store logins and track inventory, bills, and history per client.</p>
        </div>
        <div className="flex gap-2">
          <select className="input w-auto" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn-primary inline-flex items-center gap-2" onClick={() => setOpen(true)}>
            <Plus size={16} /> New Client
          </button>
        </div>
      </div>

      <DataTable
        title={isLoading ? 'Loading clients...' : `All Clients (${data?.total || 0})`}
        search={search}
        onSearch={setSearch}
        rows={rows}
        columns={[
          {
            key: 'name',
            label: 'Store',
            render: (row) => (
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><Building2 size={16} /></div>
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-xs capitalize text-slate-500">{row.businessType || 'other'}</p>
                </div>
              </div>
            )
          },
          { key: 'ownerName', label: 'Owner' },
          { key: 'email', label: 'Email' },
          { key: 'mobile', label: 'Mobile' },
          {
            key: 'status',
            label: 'Status',
            render: (row) => (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                {row.status}
              </span>
            )
          },
          { key: 'createdAt', label: 'Created', render: (row) => dateTime(row.createdAt) },
          {
            key: 'actions',
            label: '',
            render: (row) => (
              <Link className="btn-muted" to={`/super-admin/tenants/${row._id}`}>Open</Link>
            )
          }
        ]}
      />

      <Modal title="Create Store + Admin" open={open} onClose={() => { setOpen(false); setError(''); }}>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          {error && <div className="sm:col-span-2 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <input className="input" placeholder="Store name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <select className="input" value={form.businessType} onChange={(event) => setForm({ ...form, businessType: event.target.value })}>
            <option value="kirana">Kirana</option>
            <option value="bakery">Bakery</option>
            <option value="restaurant">Restaurant</option>
            <option value="cafe">Cafe</option>
            <option value="toy_shop">Toy Shop</option>
            <option value="other">Other</option>
          </select>
          <input className="input" placeholder="Owner name" value={form.ownerName} onChange={(event) => setForm({ ...form, ownerName: event.target.value })} />
          <input className="input" placeholder="Store email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className="input" placeholder="Store mobile" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
          <input className="input" placeholder="GST number" value={form.gstNumber} onChange={(event) => setForm({ ...form, gstNumber: event.target.value })} />
          <input className="input sm:col-span-2" placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <div className="sm:col-span-2 mt-2 border-t border-slate-100 pt-3 text-sm font-semibold text-slate-500">Store admin login</div>
          <input className="input" placeholder="Admin name" value={form.adminName} onChange={(event) => setForm({ ...form, adminName: event.target.value })} />
          <input className="input" placeholder="Admin mobile" value={form.adminMobile} onChange={(event) => setForm({ ...form, adminMobile: event.target.value })} />
          <input className="input" placeholder="Admin email" type="email" value={form.adminEmail} onChange={(event) => setForm({ ...form, adminEmail: event.target.value })} required />
          <input className="input" placeholder="Admin password" type="password" value={form.adminPassword} onChange={(event) => setForm({ ...form, adminPassword: event.target.value })} required minLength={6} />
          <button className="btn-primary sm:col-span-2" disabled={create.isPending}>{create.isPending ? 'Creating...' : 'Create Client'}</button>
        </form>
      </Modal>
    </>
  );
}
