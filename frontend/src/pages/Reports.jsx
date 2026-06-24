import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { downloadCsv, downloadHtml } from '../utils/export';

const reports = ['Daily Sales Report', 'Weekly Sales Report', 'Monthly Sales Report', 'GST Report', 'Item-wise Sales Report', 'Category-wise Sales Report', 'Revenue Report', 'Expense Report', 'Profit & Loss Report'];

export default function Reports() {
  function exportPdf(report) {
    downloadHtml(`${report}.html`, report, `<h1>${report}</h1><p>Generated from Restaurant POS.</p>`);
  }

  function exportExcel(report) {
    downloadCsv(`${report}.csv`, [['Report', 'Generated At'], [report, new Date().toLocaleString()]]);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {reports.map((report) => (
        <div key={report} className="card">
          <h3 className="text-lg font-black">{report}</h3>
          <p className="mt-2 text-sm text-slate-500">Filter by date range, export, download or print this report.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="btn-muted" onClick={() => exportPdf(report)}><Download size={16} /> PDF</button>
            <button className="btn-muted" onClick={() => exportExcel(report)}><FileSpreadsheet size={16} /> Excel</button>
            <button className="btn-muted" onClick={() => window.print()}><Printer size={16} /> Print</button>
          </div>
        </div>
      ))}
    </div>
  );
}
