import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package, ReceiptText, ShoppingCart, Users, Wallet } from 'lucide-react';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import StatCard from '../../components/StatCard';
import { defaultTenantFeatures, TENANT_FEATURE_KEYS, TENANT_FEATURE_LABELS } from '../../config/tenantFeatures';
import { api } from '../../services/api';
import { currency, dateTime } from '../../utils/format';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'branches', label: 'Branches' },
  { id: 'bills', label: 'Bills' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'orders', label: 'Orders' },
  { id: 'customers', label: 'Customers' }
];

function AdminCredentialCard({ admin, tenantId, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(true);

  const savePassword = useMutation({
    mutationFn: async (nextPassword) => (
      await api.patch(`/tenants/${tenantId}/admins/${admin._id}/password`, { password: nextPassword })
    ).data,
    onSuccess: () => {
      setEditing(false);
      setPassword('');
      setError('');
      onUpdated?.();
    },
    onError: (err) => setError(err.response?.data?.message || 'Unable to update password')
  });

  const loginId = admin.loginId || admin.email || '-';
  const storedPassword = admin.password || admin.loginPassword || null;

  return (
    <div className="min-w-[300px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <p className="font-bold">{admin.name || '-'}</p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-start justify-between gap-2 rounded-xl bg-white px-3 py-2 dark:bg-slate-900">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Login ID</p>
            <p className="font-semibold break-all">{loginId}</p>
          </div>
        </div>
        <div className="rounded-xl bg-white px-3 py-2 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Password</p>
            {storedPassword && (
              <button type="button" className="text-xs font-semibold text-brand-700" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            )}
          </div>
          {editing ? (
            <form
              className="mt-2 flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                setError('');
                savePassword.mutate(password);
              }}
            >
              <input
                className="input"
                type="text"
                placeholder="New password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button className="btn-primary" disabled={savePassword.isPending}>{savePassword.isPending ? 'Saving...' : 'Save'}</button>
                <button type="button" className="btn-muted" onClick={() => { setEditing(false); setError(''); setPassword(''); }}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="font-semibold break-all">{storedPassword ? (showPassword ? storedPassword : '••••••••') : 'Not saved yet'}</p>
              <button type="button" className="btn-muted shrink-0" onClick={() => setEditing(true)}>
                {storedPassword ? 'Change' : 'Set password'}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600 dark:bg-slate-900">{admin.mobile || 'No mobile'}</span>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold capitalize text-brand-700 dark:bg-orange-950/40 dark:text-orange-200">{admin.role || '-'}</span>
        <span className={`rounded-full px-2.5 py-1 font-semibold ${admin.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{admin.status || '-'}</span>
      </div>
    </div>
  );
}

export default function TenantDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState('overview');
  const [branchOpen, setBranchOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: '', code: '', address: '', mobile: '', managerName: '', status: 'active' });
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const { data: payload } = await api.get(`/tenants/${id}`);
      return payload;
    },
    enabled: Boolean(id)
  });

  const billsQuery = useQuery({
    queryKey: ['tenant-bills', id],
    queryFn: async () => (await api.get(`/tenants/${id}/bills`)).data,
    enabled: tab === 'bills' && Boolean(id)
  });

  const inventoryQuery = useQuery({
    queryKey: ['tenant-inventory', id],
    queryFn: async () => (await api.get(`/tenants/${id}/inventory`)).data,
    enabled: tab === 'inventory' && Boolean(id)
  });

  const ordersQuery = useQuery({
    queryKey: ['tenant-orders', id],
    queryFn: async () => (await api.get(`/tenants/${id}/orders`)).data,
    enabled: tab === 'orders' && Boolean(id)
  });

  const customersQuery = useQuery({
    queryKey: ['tenant-customers', id],
    queryFn: async () => (await api.get(`/tenants/${id}/customers`)).data,
    enabled: tab === 'customers' && Boolean(id)
  });

  const branchesQuery = useQuery({
    queryKey: ['tenant-branches', id],
    queryFn: async () => (await api.get('/branches', { params: { tenantId: id, limit: 100 } })).data,
    enabled: (tab === 'branches' || tab === 'overview') && Boolean(id)
  });

  const createBranch = useMutation({
    mutationFn: async (payload) => (await api.post('/branches', { ...payload, tenant: id })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-branches', id] });
      setBranchOpen(false);
      setBranchForm({ name: '', code: '', address: '', mobile: '', managerName: '', status: 'active' });
    }
  });

  const updateTenant = useMutation({
    mutationFn: async (payload) => (await api.patch(`/tenants/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenant', id] })
  });

  if (isLoading) return <div className="card p-6">Loading store details...</div>;
  if (error || !data?.tenant) return <div className="card p-6 text-red-600">Unable to load store details.</div>;

  const { tenant, summary, admins = [] } = data;
  const features = defaultTenantFeatures(tenant.features || {});

  function toggleFeature(key) {
    updateTenant.mutate({
      features: {
        ...features,
        [key]: !features[key]
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/super-admin" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
            <ArrowLeft size={16} /> Back to clients
          </Link>
          <h2 className="text-2xl font-black">{tenant.name}</h2>
          <p className="mt-1 text-sm text-slate-500 capitalize">{tenant.businessType} · {tenant.email || 'No email'} · {tenant.mobile || 'No mobile'}</p>
          {tenant.address && <p className="mt-1 text-sm text-slate-500">{tenant.address}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tenant.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
            {tenant.status}
          </span>
          <button
            className="btn-muted"
            disabled={updateTenant.isPending}
            onClick={() => updateTenant.mutate({ status: tenant.status === 'active' ? 'inactive' : 'active' })}
          >
            {tenant.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Products" value={summary?.products ?? 0} icon={ReceiptText} />
        <StatCard label="Inventory" value={summary?.inventory ?? 0} icon={Package} tone="blue" />
        <StatCard label="Bills" value={summary?.bills ?? 0} icon={Wallet} tone="green" />
        <StatCard label="Orders" value={summary?.orders ?? 0} icon={ShoppingCart} />
        <StatCard label="Revenue" value={currency(summary?.revenue ?? 0)} icon={Users} tone="blue" />
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold ${tab === item.id ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800'}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="card space-y-2 p-5">
            <h3 className="text-lg font-black">Store profile</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <p><span className="text-slate-500">Owner:</span> {tenant.ownerName || '-'}</p>
              <p><span className="text-slate-500">GST:</span> {tenant.gstNumber || '-'}</p>
              <p><span className="text-slate-500">Customers:</span> {summary?.customers ?? 0}</p>
              <p><span className="text-slate-500">Created:</span> {dateTime(tenant.createdAt)}</p>
            </div>
          </div>

          <div className="card space-y-4 p-5">
            <h3 className="text-lg font-black">Store admins</h3>
            {admins.length === 0 ? (
              <p className="text-sm text-slate-500">No store admins found.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {admins.map((admin) => (
                  <AdminCredentialCard
                    key={admin._id}
                    admin={admin}
                    tenantId={id}
                    onUpdated={() => queryClient.invalidateQueries({ queryKey: ['tenant', id] })}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="card space-y-4 p-5">
            <div>
              <h3 className="text-lg font-black">Features</h3>
              <p className="mt-1 text-sm text-slate-500">Toggle modules available to this client’s store login.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TENANT_FEATURE_KEYS.map((key) => {
                const enabled = features[key];
                return (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${enabled ? 'border-brand-200 bg-brand-50/60 dark:border-orange-900 dark:bg-orange-950/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'}`}
                  >
                    <span className="text-sm font-semibold">{TENANT_FEATURE_LABELS[key]}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      disabled={updateTenant.isPending}
                      onClick={() => toggleFeature(key)}
                      className={`relative h-7 w-12 rounded-full transition ${enabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${enabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'branches' && (
        <>
          <DataTable
            title={`Branches (${branchesQuery.data?.total || branchesQuery.data?.items?.length || 0})`}
            rows={branchesQuery.data?.items || []}
            actions={<button className="btn-primary" onClick={() => setBranchOpen(true)}>Add Branch</button>}
            columns={[
              { key: 'name', label: 'Branch' },
              { key: 'code', label: 'Code' },
              { key: 'managerName', label: 'Manager' },
              { key: 'mobile', label: 'Mobile' },
              { key: 'address', label: 'Address' },
              { key: 'status', label: 'Status' },
              { key: 'createdAt', label: 'Created', render: (row) => dateTime(row.createdAt) }
            ]}
          />
          <Modal title="Add Branch" open={branchOpen} onClose={() => setBranchOpen(false)}>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                createBranch.mutate(branchForm);
              }}
            >
              <input className="input" placeholder="Branch name" value={branchForm.name} onChange={(event) => setBranchForm({ ...branchForm, name: event.target.value })} required />
              <input className="input" placeholder="Branch code" value={branchForm.code} onChange={(event) => setBranchForm({ ...branchForm, code: event.target.value })} />
              <input className="input" placeholder="Manager name" value={branchForm.managerName} onChange={(event) => setBranchForm({ ...branchForm, managerName: event.target.value })} />
              <input className="input" placeholder="Mobile" value={branchForm.mobile} onChange={(event) => setBranchForm({ ...branchForm, mobile: event.target.value })} />
              <input className="input sm:col-span-2" placeholder="Address" value={branchForm.address} onChange={(event) => setBranchForm({ ...branchForm, address: event.target.value })} />
              <select className="input" value={branchForm.status} onChange={(event) => setBranchForm({ ...branchForm, status: event.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="btn-primary sm:col-span-2" disabled={createBranch.isPending}>{createBranch.isPending ? 'Saving...' : 'Save Branch'}</button>
            </form>
          </Modal>
        </>
      )}

      {tab === 'bills' && (
        <DataTable
          title={`Bills (${billsQuery.data?.total || 0})`}
          rows={billsQuery.data?.items || []}
          columns={[
            { key: 'invoiceNumber', label: 'Invoice #', render: (row) => row.invoiceNumber || row._id?.slice(-6) },
            { key: 'customer', label: 'Customer', render: (row) => row.customer?.name || '-' },
            { key: 'grandTotal', label: 'Total', render: (row) => currency(row.grandTotal) },
            { key: 'paymentMode', label: 'Payment', render: (row) => row.paymentMode || '-' },
            { key: 'createdAt', label: 'Date', render: (row) => dateTime(row.createdAt) }
          ]}
        />
      )}

      {tab === 'inventory' && (
        <DataTable
          title={`Inventory (${inventoryQuery.data?.total || 0})`}
          rows={inventoryQuery.data?.items || []}
          columns={[
            { key: 'materialName', label: 'Material' },
            { key: 'unit', label: 'Unit' },
            { key: 'currentStock', label: 'Stock' },
            { key: 'minimumStockLevel', label: 'Min' },
            { key: 'purchaseCost', label: 'Cost', render: (row) => currency(row.purchaseCost) }
          ]}
        />
      )}

      {tab === 'orders' && (
        <DataTable
          title={`Orders (${ordersQuery.data?.total || 0})`}
          rows={ordersQuery.data?.items || []}
          columns={[
            { key: 'orderNumber', label: 'Order #', render: (row) => row.orderNumber || row._id?.slice(-6) },
            { key: 'customer', label: 'Customer', render: (row) => row.customer?.name || '-' },
            { key: 'table', label: 'Table', render: (row) => row.table?.name || '-' },
            { key: 'status', label: 'Status' },
            { key: 'grandTotal', label: 'Total', render: (row) => currency(row.grandTotal || row.totalAmount || 0) },
            { key: 'createdAt', label: 'Date', render: (row) => dateTime(row.createdAt) }
          ]}
        />
      )}

      {tab === 'customers' && (
        <DataTable
          title={`Customers (${customersQuery.data?.total || 0})`}
          rows={customersQuery.data?.items || []}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'mobile', label: 'Mobile' },
            { key: 'email', label: 'Email' },
            { key: 'totalOrders', label: 'Orders' },
            { key: 'totalSpending', label: 'Spending', render: (row) => currency(row.totalSpending) },
            { key: 'createdAt', label: 'Joined', render: (row) => dateTime(row.createdAt) }
          ]}
        />
      )}
    </div>
  );
}
