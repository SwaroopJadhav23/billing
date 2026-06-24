export default function Settings() {
  return (
    <div className="card max-w-3xl">
      <h1 className="text-2xl font-black">System Settings</h1>
      <p className="mt-2 text-sm text-slate-500">Super admin area for restaurant profile, GST number, receipt footer, printer defaults and application settings.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <input className="input" placeholder="Restaurant Name" />
        <input className="input" placeholder="GST Number" />
        <input className="input sm:col-span-2" placeholder="Address" />
        <input className="input" placeholder="Thermal printer name" />
        <input className="input" placeholder="Receipt footer" />
      </div>
      <button className="btn-primary mt-6">Save Settings</button>
    </div>
  );
}
