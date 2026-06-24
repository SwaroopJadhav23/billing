export default function StatCard({ label, value, icon: Icon, tone = 'orange' }) {
  const tones = {
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
    red: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200'
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black">{value}</p>
        </div>
        {Icon && <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[tone]}`}><Icon size={22} /></div>}
      </div>
    </div>
  );
}
