import { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useResource } from '../hooks/useResource';
import { currency } from '../utils/format';

const empty = { name: '', categoryName: 'Starters', description: '', price: '', gstPercentage: 5, image: '', isAvailable: true, status: 'active' };

export default function Menu() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const { items, create, update, remove } = useResource('menu-items', { search, limit: 50 });

  function openAdd() {
    setEditingItem(null);
    setForm(empty);
    setImageFile(null);
    setOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      categoryName: item.categoryName || 'Starters',
      description: item.description || '',
      price: item.price || '',
      gstPercentage: item.gstPercentage ?? 5,
      image: item.image || '',
      isAvailable: item.isAvailable ?? true,
      status: item.status || 'active'
    });
    setImageFile(null);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingItem(null);
    setForm(empty);
    setImageFile(null);
  }

  function handleImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setForm((current) => ({ ...current, image: URL.createObjectURL(file) }));
  }

  function submit(event) {
    event.preventDefault();
    const payload = new FormData();
    Object.entries({
      ...form,
      price: Number(form.price),
      gstPercentage: Number(form.gstPercentage)
    }).forEach(([key, value]) => payload.append(key, value ?? ''));
    if (imageFile) payload.append('imageFile', imageFile);

    if (editingItem) {
      update.mutate({ id: editingItem._id, payload }, { onSuccess: closeModal });
    } else {
      create.mutate(payload, { onSuccess: closeModal });
    }
  }

  return (
    <>
      <DataTable
        title="Menu Management"
        search={search}
        onSearch={setSearch}
        rows={items}
        columns={[
          { key: 'name', label: 'Item' },
          { key: 'categoryName', label: 'Category' },
          { key: 'price', label: 'Price', render: (row) => currency(row.price) },
          { key: 'gstPercentage', label: 'GST %' },
          { key: 'isAvailable', label: 'Available', render: (row) => row.isAvailable ? 'Yes' : 'No' },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <div className="flex gap-3">
                <button className="font-bold text-brand-600" onClick={() => openEdit(row)}>Edit</button>
                <button className="font-bold text-red-600" onClick={() => remove.mutate(row._id)}>Delete</button>
              </div>
            )
          }
        ]}
        actions={<button className="btn-primary" onClick={openAdd}>Add Food Item</button>}
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item._id} className="card">
            {item.image ? <img src={item.image} alt={item.name} className="mb-3 h-32 w-full rounded-3xl object-cover" /> : <div className="mb-3 h-32 rounded-3xl bg-orange-100 dark:bg-orange-950" />}
            <h3 className="font-black">{item.name}</h3>
            <p className="text-sm text-slate-500">{item.categoryName}</p>
            <p className="mt-2 font-black text-brand-600">{currency(item.price)}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="btn-muted" onClick={() => openEdit(item)}>Edit</button>
              <button className="btn-muted text-red-600" onClick={() => remove.mutate(item._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <Modal title={editingItem ? 'Edit Food Item' : 'Add Food Item'} open={open} onClose={closeModal}>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <select className="input" value={form.categoryName} onChange={(event) => setForm({ ...form, categoryName: event.target.value })}>{['Starters', 'Main Course', 'Beverages', 'Desserts'].map((c) => <option key={c}>{c}</option>)}</select>
          <input className="input sm:col-span-2" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <input className="input" type="number" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
          <input className="input" type="number" placeholder="GST %" value={form.gstPercentage} onChange={(event) => setForm({ ...form, gstPercentage: event.target.value })} />
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Food Image</span>
            <input className="input" type="file" accept="image/*" onChange={handleImage} />
          </label>
          {form.image && (
            <div className="sm:col-span-2">
              <img src={form.image} alt="Food preview" className="h-44 w-full rounded-3xl object-cover" />
              <button type="button" className="btn-muted mt-3" onClick={() => { setImageFile(null); setForm({ ...form, image: '' }); }}>Remove Image</button>
            </div>
          )}
          <button className="btn-primary sm:col-span-2">{editingItem ? 'Update Item' : 'Save Item'}</button>
        </form>
      </Modal>
    </>
  );
}
