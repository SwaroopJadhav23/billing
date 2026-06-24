import { useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { currency } from '../utils/format';

const categories = ['All', 'Starters', 'Main Course', 'Beverages', 'Desserts'];

export default function POS() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [customer, setCustomer] = useState({ name: '', mobile: '' });
  const [printBill, setPrintBill] = useState(null);
  const { items } = useResource('menu-items', { limit: 100 });

  const visibleItems = items.filter((item) => (category === 'All' || item.categoryName === category) && item.name.toLowerCase().includes(search.toLowerCase()) && item.isAvailable);
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gstTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity * (item.gstPercentage || 0)) / 100, 0);
    const grandTotal = Math.max(0, subtotal + gstTotal + Number(serviceCharge) - Number(discount));
    return { subtotal, gstTotal, grandTotal };
  }, [cart, discount, serviceCharge]);

  function addItem(item) {
    setCart((current) => {
      const exists = current.find((line) => line._id === item._id);
      if (exists) return current.map((line) => line._id === item._id ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { ...item, quantity: 1 }];
    });
  }

  function updateQty(id, delta) {
    setCart((current) => current.map((item) => item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  }

  async function saveBill() {
    const receiptItems = cart.map((item) => ({
      name: item.name,
      price: item.price,
      gstPercentage: item.gstPercentage,
      quantity: item.quantity
    }));
    const orderPayload = {
      type: 'takeaway',
      customer: undefined,
      items: cart.map((item) => ({ menuItem: item._id, name: item.name, price: item.price, gstPercentage: item.gstPercentage, quantity: item.quantity })),
      discount,
      serviceCharge
    };
    const { data: order } = await api.post('/orders', orderPayload);
    const { data: bill } = await api.post('/bills/generate', { order: order._id, paymentMode, paidAmount: totals.grandTotal, grandTotal: totals.grandTotal, restaurant: { name: 'Restaurant POS' } });
    setPrintBill({
      ...bill,
      items: receiptItems,
      customerName: customer.name,
      customerMobile: customer.mobile,
      subtotal: totals.subtotal,
      gstTotal: totals.gstTotal,
      discount: Number(discount || 0),
      serviceCharge: Number(serviceCharge || 0),
      grandTotal: totals.grandTotal,
      paymentMode
    });
    setTimeout(() => {
      window.print();
      setCart([]);
      setCustomer({ name: '', mobile: '' });
    }, 100);
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-4">
        <div className="card">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((name) => <button key={name} className={category === name ? 'btn-primary whitespace-nowrap' : 'btn-muted whitespace-nowrap'} onClick={() => setCategory(name)}>{name}</button>)}
            </div>
            <label className="relative min-w-64">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input className="input pl-10" placeholder="Search menu item" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <button key={item._id} onClick={() => addItem(item)} className="card text-left transition hover:-translate-y-1">
              {item.image ? (
                <img src={item.image} alt={item.name} className="mb-4 h-28 w-full rounded-3xl object-cover" />
              ) : (
                <div className="mb-4 h-28 rounded-3xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-950 dark:to-slate-900" />
              )}
              <p className="font-black">{item.name}</p>
              <p className="text-sm text-slate-500">{item.categoryName}</p>
              <p className="mt-3 text-lg font-black text-brand-600">{currency(item.price)}</p>
            </button>
          ))}
        </div>
        </section>
        <aside className="card sticky top-24 h-fit">
        <h2 className="text-xl font-black">Current Bill</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <input className="input" placeholder="Customer name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} />
          <input className="input" placeholder="Mobile" value={customer.mobile} onChange={(event) => setCustomer({ ...customer, mobile: event.target.value })} />
        </div>
        <div className="mt-5 max-h-80 space-y-3 overflow-auto">
          {cart.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-slate-800">Add items to start billing</p>}
          {cart.map((item) => (
            <div key={item._id} className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
              <div className="flex justify-between gap-3">
                <div><p className="font-bold">{item.name}</p><p className="text-sm text-slate-500">{currency(item.price)}</p></div>
                <button onClick={() => setCart(cart.filter((line) => line._id !== item._id))}><Trash2 size={18} /></button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-3xl font-black leading-none text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" onClick={() => updateQty(item._id, -1)}>-</button>
                  <span className="font-black">{item.quantity}</span>
                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-3xl font-black leading-none text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" onClick={() => updateQty(item._id, 1)}>+</button>
                </div>
                <p className="font-black">{currency(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">
          <div className="flex justify-between"><span>Subtotal</span><b>{currency(totals.subtotal)}</b></div>
          <div className="flex justify-between"><span>GST</span><b>{currency(totals.gstTotal)}</b></div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" type="number" placeholder="Discount" value={discount} onChange={(event) => setDiscount(event.target.value)} />
            <input className="input" type="number" placeholder="Service charge" value={serviceCharge} onChange={(event) => setServiceCharge(event.target.value)} />
          </div>
          <select className="input" value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>
          <div className="flex justify-between text-xl"><span>Grand Total</span><b>{currency(totals.grandTotal)}</b></div>
          <button className="btn-primary w-full" disabled={!cart.length} onClick={saveBill}>Save & Print Bill</button>
        </div>
        </aside>
      </div>

      {printBill && (
        <div className="print-receipt">
          <div className="receipt-center">
            <h1>Restaurant POS</h1>
            <p>Receipt / Tax Invoice</p>
            <p>Invoice: {printBill.invoiceNumber}</p>
            <p>{new Date(printBill.createdAt || Date.now()).toLocaleString()}</p>
          </div>
          {(printBill.customerName || printBill.customerMobile) && (
            <div className="receipt-section">
              {printBill.customerName && <p>Customer: {printBill.customerName}</p>}
              {printBill.customerMobile && <p>Mobile: {printBill.customerMobile}</p>}
            </div>
          )}
          <div className="receipt-section">
            <div className="receipt-row receipt-head">
              <span>Item</span>
              <span>Qty</span>
              <span>Amt</span>
            </div>
            {printBill.items.map((item, index) => (
              <div className="receipt-row" key={`${item.name}-${index}`}>
                <span>{item.name}</span>
                <span>{item.quantity}</span>
                <span>{currency(Number(item.price || 0) * Number(item.quantity || 1))}</span>
              </div>
            ))}
          </div>
          <div className="receipt-section">
            <div className="receipt-row"><span>Subtotal</span><span>{currency(printBill.subtotal)}</span></div>
            <div className="receipt-row"><span>GST</span><span>{currency(printBill.gstTotal)}</span></div>
            <div className="receipt-row"><span>Discount</span><span>{currency(printBill.discount)}</span></div>
            <div className="receipt-row"><span>Service Charge</span><span>{currency(printBill.serviceCharge)}</span></div>
            <div className="receipt-row receipt-total"><span>Total</span><span>{currency(printBill.grandTotal)}</span></div>
            <div className="receipt-row"><span>Payment</span><span>{printBill.paymentMode.toUpperCase()}</span></div>
          </div>
          <div className="receipt-center receipt-section">
            <p>Thank you, visit again!</p>
          </div>
        </div>
      )}
    </>
  );
}
