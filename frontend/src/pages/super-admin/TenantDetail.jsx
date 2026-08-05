import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package, ReceiptText, ShoppingCart, Users, Wallet } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { api } from '../../services/api';
import { currency, dateTime } from '../../utils/format';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'bills', label: 'Bills' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'orders', label: 'Orders' },
  { id: 'customers', label: 'Customers' }
];

export default function TenantDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState('overview');
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

  const toggleStatus = useMutation({
    mutationFn: async (status) => (await api.patch(`/tenants/${id}`, { status })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenant', id] })
  });

  if (isLoading) return <div className="card p-6">Loading store details...</div>;
  if (error || !data?.tenant) return <div className="card p-6 text-red-600">Unable to load store details.</div>;

  const { tenant, summary, admins = [] } = data;

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
            disabled={toggleStatus.isPending}
            onClick={() => toggleStatus.mutate(tenant.status === 'active' ? 'inactive' : 'active')}
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
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card space-y-2 p-5">
            <h3 className="text-lg font-black">Store profile</h3>
            <p><span className="text-slate-500">Owner:</span> {tenant.ownerName || '-'}</p>
            <p><span className="text-slate-500">GST:</span> {tenant.gstNumber || '-'}</p>
            <p><span className="text-slate-500">Customers:</span> {summary?.customers ?? 0}</p>
            <p><span className="text-slate-500">Created:</span> {dateTime(tenant.createdAt)}</p>
          </div>
          <DataTable
            title="Store admins"
            rows={admins}
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'mobile', label: 'Mobile' },
              { key: 'role', label: 'Role' },
              { key: 'status', label: 'Status' }
            ]}
          />
        </div>
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
