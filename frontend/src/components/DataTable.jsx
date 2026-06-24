import { Search } from 'lucide-react';

export default function DataTable({ title, columns, rows, search, onSearch, actions }) {
  return (
    <div className="card">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-black">{title}</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          {onSearch && (
            <label className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input className="input pl-10" placeholder="Search..." value={search || ''} onChange={(event) => onSearch(event.target.value)} />
            </label>
          )}
          {actions}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500">
            <tr>{columns.map((col) => <th key={col.key} className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">{col.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row._id || index} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                {columns.map((col) => <td key={col.key} className="px-3 py-3">{col.render ? col.render(row) : row[col.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
