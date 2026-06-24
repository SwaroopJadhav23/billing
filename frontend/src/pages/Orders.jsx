import DataTable from '../components/DataTable';
import { useResource } from '../hooks/useResource';
import { currency, dateTime } from '../utils/format';

export default function Orders() {
  const { items } = useResource('orders', { limit: 100 });
  return (
    <DataTable
      title="Order Management"
      rows={items}
      columns={[
        { key: 'orderNumber', label: 'Order No' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
        { key: 'grandTotal', label: 'Total', render: (row) => currency(row.grandTotal) },
        { key: 'createdAt', label: 'Created', render: (row) => dateTime(row.createdAt) }
      ]}
    />
  );
}
