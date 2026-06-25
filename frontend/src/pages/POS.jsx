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

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[char]);
  }

  function printReceipt(receipt) {
    const itemRows = receipt.items.map((item) => `
      <div class="row">
        <span>${escapeHtml(item.name)}</span>
        <span>${item.quantity}</span>
        <span>${currency(Number(item.price || 0) * Number(item.quantity || 1))}</span>
      </div>
    `).join('');

    const customerBlock = receipt.customerName || receipt.customerMobile ? `
      <div class="section">
        ${receipt.customerName ? `<p>Customer: ${escapeHtml(receipt.customerName)}</p>` : ''}
        ${receipt.customerMobile ? `<p>Mobile: ${escapeHtml(receipt.customerMobile)}</p>` : ''}
      </div>
    ` : '';

    const receiptHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Receipt</title>
          <style>
            @page { size: 80mm 120mm; margin: 0; }
            * { box-sizing: border-box; }
            html, body {
              width: 80mm;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
              font-family: "Courier New", monospace;
              font-size: 11px;
              line-height: 1.35;
            }
            body { padding: 4mm; }
            h1 { margin: 0 0 4px; text-align: center; font-size: 16px; }
            p { margin: 2px 0; }
            .center { text-align: center; }
            .section { border-top: 1px dashed #000; margin-top: 8px; padding-top: 8px; }
            .row { display: grid; grid-template-columns: 1fr 28px 58px; gap: 4px; margin: 3px 0; }
            .row span:last-child { text-align: right; }
            .head, .total { font-weight: 700; }
            .total { border-top: 1px dashed #000; margin-top: 6px; padding-top: 6px; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="center">
            <h1>Restaurant POS</h1>
            <p>Receipt / Tax Invoice</p>
            <p>Invoice: ${escapeHtml(receipt.invoiceNumber)}</p>
            <p>${escapeHtml(new Date(receipt.createdAt || Date.now()).toLocaleString())}</p>
          </div>
          ${customerBlock}
          <div class="section">
            <div class="row head"><span>Item</span><span>Qty</span><span>Amt</span></div>
            ${itemRows}
          </div>
          <div class="section">
            <div class="row"><span>Subtotal</span><span></span><span>${currency(receipt.subtotal)}</span></div>
            <div class="row"><span>GST</span><span></span><span>${currency(receipt.gstTotal)}</span></div>
            <div class="row"><span>Discount</span><span></span><span>${currency(receipt.discount)}</span></div>
            <div class="row"><span>Service</span><span></span><span>${currency(receipt.serviceCharge)}</span></div>
            <div class="row total"><span>Total</span><span></span><span>${currency(receipt.grandTotal)}</span></div>
            <div class="row"><span>Payment</span><span></span><span>${escapeHtml(receipt.paymentMode.toUpperCase())}</span></div>
          </div>
          <div class="center section"><p>Thank you, visit again!</p></div>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const printWindow = iframe.contentWindow;
    printWindow.document.open();
    printWindow.document.write(receiptHtml);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => iframe.remove(), 500);
    }, 100);
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
    printReceipt({
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
    setCart([]);
    setCustomer({ name: '', mobile: '' });
  }

  return (
    <>
      <div className="grid w-full min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <section className="space-y-4">
        <div className="card">
          <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-wrap gap-2">
              {categories.map((name) => <button key={name} className={category === name ? 'btn-primary whitespace-nowrap' : 'btn-muted whitespace-nowrap'} onClick={() => setCategory(name)}>{name}</button>)}
            </div>
            <label className="relative w-full shrink-0 xl:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input className="input" style={{ paddingLeft: '2.75rem' }} placeholder="Search menu item" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
          </div>
        </div>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
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
    </>
  );
}
