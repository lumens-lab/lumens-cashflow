import { Transaction } from "@/components/finance/TransactionsContext";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

const cols = ["date", "type", "vendor", "name", "category", "account", "amount"] as const;
const headers = ["Date", "Type", "Vendor", "Note", "Category", "Account", "Amount"];

const toRows = (txs: Transaction[]) =>
  txs.map((t) => [t.date, t.type === "in" ? "Income" : "Expense", t.vendor, t.name, t.category, t.account, t.amount]);

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
};

const stamp = () => new Date().toISOString().slice(0, 10);

export const exportCSV = (txs: Transaction[]) => {
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...toRows(txs).map((r) => r.map(esc).join(","))].join("\n");
  download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `lumens-cashflow-${stamp()}.csv`);
};

export const exportXLSX = (txs: Transaction[]) => {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...toRows(txs)]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cashflow");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  download(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `lumens-cashflow-${stamp()}.xlsx`);
};

export const exportPDF = (txs: Transaction[], currencySymbol = "") => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFontSize(16);
  doc.text("Lumens — Cashflow Backup", 40, 50);
  doc.setFontSize(10);
  doc.text(`Generated ${new Date().toLocaleString()} · ${txs.length} records`, 40, 68);

  const cw = [70, 50, 100, 110, 80, 70, 60];
  let y = 100;
  doc.setFont("helvetica", "bold");
  let x = 40;
  headers.forEach((h, i) => { doc.text(h, x, y); x += cw[i]; });
  doc.setFont("helvetica", "normal");
  y += 14;

  toRows(txs).forEach((r) => {
    if (y > 790) { doc.addPage(); y = 50; }
    x = 40;
    r.forEach((cell, i) => {
      const txt = i === 6 ? `${currencySymbol}${Number(cell).toFixed(2)}` : String(cell ?? "");
      doc.text(txt.slice(0, 28), x, y);
      x += cw[i];
    });
    y += 12;
  });

  doc.save(`lumens-cashflow-${stamp()}.pdf`);
};
