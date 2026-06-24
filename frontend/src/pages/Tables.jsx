import { useMemo, useState } from 'react';
import Modal from '../components/Modal';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { currency } from '../utils/format';

const colors = {
  available: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  occupied: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200',
  reserved: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200'
};

export default function Tables() {
  const [name, setName] = useState('');
  const [billingTable, setBillingTable] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [billCart, setBillCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', mobile: '' });
  const [includeGst, setIncludeGst] = useState(false);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [billingError, setBillingError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { items, create, update, remove, refetch } = useResource('tables', { limit: 100 });
  const { items: menuItems } = useResource('menu-items', { limit: 100 });

  const billTotals = useMemo(() => {
    const subtotal = billCart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
    const gstTotal = includeGst
      ? billCart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1) * Number(item.gstPercentage || 0)) / 100, 0)
      : 0;
    return { subtotal, gstTotal, grandTotal: subtotal + gstTotal };
  }, [billCart, includeGst]);

  function add(event) {
    event.preventDefault();
    create.mutate({ name, capacity: 4 }, { onSuccess: () => setName('') });
  }

  function openBilling(table) {
    setBillingTable(table);
    setBillCart([]);
    setCustomer({ name: '', mobile: '' });
    setIncludeGst(false);
    setPaymentMode('cash');
    setBillingError('');
    setSelectedMenuItem(menuItems[0]?._id || '');
  }

  function addBillItem() {
    const item = menuItems.find((menuItem) => menuItem._id === selectedMenuItem);
    if (!item) return;
    setBillCart((current) => {
      const existing = current.find((line) => line._id === item._id);
      if (existing) return current.map((line) => line._id === item._id ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { ...item, quantity: 1 }];
    });
  }

  function updateBillQty(id, quantity) {
    setBillCart((current) => current.map((item) => item._id === id ? { ...item, quantity: Math.max(1, Number(quantity) || 1) } : item));
  }

  async function generateTableBill() {
    if (!billingTable || billCart.length === 0) {
      setBillingError('Please add at least one item.');
      return;
    }

    setBillingError('');
    setIsGenerating(true);
    try {
      const orderPayload = {
        type: 'dine-in',
        table: billingTable._id,
        items: billCart.map((item) => ({
          menuItem: item._id,
          name: item.name,
          price: item.price,
          gstPercentage: includeGst ? item.gstPercentage : 0,
          quantity: item.quantity
        }))
      };
      const { data: order } = await api.post('/orders', orderPayload);
      await api.post('/bills/generate', {
        order: order._id,
        paymentMode,
        paidAmount: billTotals.grandTotal,
        grandTotal: billTotals.grandTotal,
        restaurant: { name: 'Restaurant POS' }
      });
      window.print();
      setBillingTable(null);
      setBillCart([]);
      refetch();
    } catch (error) {
      setBillingError(error.response?.data?.message || 'Unable to generate bill.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <form onSubmit={add} className="card flex flex-col gap-3 sm:flex-row">
          <input className="input" placeholder="Table name / number" value={name} onChange={(event) => setName(event.target.value)} required />
          <button className="btn-primary">Create Table</button>
        </form>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((table) => (
            <div key={table._id} className={`rounded-3xl border p-5 shadow-sm ${colors[table.status]}`}>
              <div className="flex items-start justify-between">
                <div><h3 className="text-2xl font-black">{table.name}</h3><p className="text-sm capitalize">{table.status}</p><p className="text-sm">Capacity: {table.capacity}</p></div>
                <button className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-brand-700" onClick={() => openBilling(table)}>Billing</button>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {['available', 'occupied', 'reserved'].map((status) => <button key={status} className="rounded-xl bg-white/70 px-2 py-2 text-xs font-bold capitalize dark:bg-slate-900/40" onClick={() => update.mutate({ id: table._id, payload: { status } })}>{status}</button>)}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs font-bold">
                <button className="rounded-xl bg-white/70 py-2 dark:bg-slate-900/40">Merge</button>
                <button className="rounded-xl bg-white/70 py-2 dark:bg-slate-900/40">Split</button>
                <button className="rounded-xl bg-white/70 py-2 dark:bg-slate-900/40">Transfer</button>
                <button onClick={() => remove.mutate(table._id)} className="rounded-xl bg-red-50 py-2 text-red-700 dark:bg-red-950 dark:text-red-200">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal title={`Generate Bill${billingTable ? ` - ${billingTable.name}` : ''}`} open={Boolean(billingTable)} onClose={() => setBillingTable(null)}>
        <div className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
          {billingError && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-200">{billingError}</div>}

          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Customer name (optional)" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} />
            <input className="input" placeholder="Mobile number (optional)" value={customer.mobile} onChange={(event) => setCustomer({ ...customer, mobile: event.target.value })} />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <select className="input" value={selectedMenuItem} onChange={(event) => setSelectedMenuItem(event.target.value)}>
              <option value="">Select item</option>
              {menuItems.filter((item) => item.isAvailable).map((item) => <option key={item._id} value={item._id}>{item.name} - {currency(item.price)}</option>)}
            </select>
            <button className="btn-primary" onClick={addBillItem}>Add Item</button>
          </div>

          <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 text-sm font-bold dark:border-slate-800">
            <span>Add GST to this bill</span>
            <input type="checkbox" checked={includeGst} onChange={(event) => setIncludeGst(event.target.checked)} />
          </label>

          <div className="space-y-3">
            {billCart.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-slate-800">No items added yet.</p>}
            {billCart.map((item) => (
              <div key={item._id} className="grid gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-[1fr_120px_90px] sm:items-center">
                <div>
                  <p className="font-black">{item.name}</p>
                  <p className="text-sm text-slate-500">{currency(item.price)} {includeGst ? `+ ${item.gstPercentage}% GST` : '(No GST)'}</p>
                </div>
                <input className="input" type="number" min="1" value={item.quantity} onChange={(event) => updateBillQty(item._id, event.target.value)} />
                <button className="btn-muted" onClick={() => setBillCart((current) => current.filter((line) => line._id !== item._id))}>Remove</button>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
            <div className="flex justify-between"><span>Subtotal</span><b>{currency(billTotals.subtotal)}</b></div>
            <div className="mt-2 flex justify-between"><span>GST</span><b>{currency(billTotals.gstTotal)}</b></div>
            <div className="mt-3 flex justify-between text-xl"><span>Grand Total</span><b>{currency(billTotals.grandTotal)}</b></div>
          </div>

          <select className="input" value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>

          <button className="btn-primary w-full" disabled={isGenerating || billCart.length === 0} onClick={generateTableBill}>
            {isGenerating ? 'Generating...' : 'Generate Bill'}
          </button>
        </div>
      </Modal>
    </>
  );
}
