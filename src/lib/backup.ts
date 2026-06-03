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

/* ----------------- IMPORT ----------------- */

export type ImportRow = Omit<Transaction, "id">;

const norm = (s: any) => String(s ?? "").trim();
const parseType = (v: any): "in" | "out" => {
  const s = norm(v).toLowerCase();
  if (s === "in" || s === "income" || s === "credit") return "in";
  return "out";
};
const parseDate = (v: any): string => {
  const s = norm(v);
  if (!s) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // Excel serial date
  if (typeof v === "number" && v > 20000 && v < 80000) {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return d.toISOString().slice(0, 10);
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
};
const parseAmount = (v: any): number => {
  if (typeof v === "number") return Math.abs(v);
  const s = norm(v).replace(/[^\d.\-]/g, "");
  const n = parseFloat(s);
  return isFinite(n) ? Math.abs(n) : 0;
};

const headerMap = (h: string): keyof ImportRow | "type" | "" => {
  const k = h.toLowerCase().trim();
  if (["date", "txn date", "transaction date"].includes(k)) return "date";
  if (["type", "direction"].includes(k)) return "type";
  if (["vendor", "merchant", "payee", "description"].includes(k)) return "vendor";
  if (["note", "name", "memo", "details"].includes(k)) return "name";
  if (["category", "cat"].includes(k)) return "category";
  if (["account", "wallet"].includes(k)) return "account";
  if (["amount", "value", "total"].includes(k)) return "amount";
  return "";
};

const rowsToImports = (rows: any[][]): ImportRow[] => {
  if (!rows.length) return [];
  const head = rows[0].map((h) => headerMap(String(h)));
  const out: ImportRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every((c) => c === null || c === undefined || c === "")) continue;
    const rec: any = { type: "out", account: "Checking", category: "Other", name: "", vendor: "", amount: 0, date: new Date().toISOString().slice(0, 10) };
    head.forEach((k, idx) => {
      if (!k) return;
      const v = r[idx];
      if (k === "type") rec.type = parseType(v);
      else if (k === "amount") rec.amount = parseAmount(v);
      else if (k === "date") rec.date = parseDate(v);
      else rec[k] = norm(v) || rec[k];
    });
    if (!rec.vendor) rec.vendor = rec.name || "Imported";
    if (!rec.name) rec.name = rec.vendor;
    if (rec.amount > 0) out.push(rec as ImportRow);
  }
  return out;
};

const parseCSV = (text: string): any[][] => {
  // Simple RFC4180 parser
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (cell !== "" || row.length) { row.push(cell); rows.push(row); row = []; cell = ""; }
        if (c === "\r" && text[i + 1] === "\n") i++;
      } else cell += c;
    }
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
};

export const importFromFile = async (file: File): Promise<ImportRow[]> => {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    const txt = await file.text();
    return rowsToImports(parseCSV(txt));
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: true });
    return rowsToImports(rows);
  }
  if (name.endsWith(".pdf")) {
    // PDF text extraction is unreliable without a heavy library.
    // We attempt a simple regex over text content if accessible; otherwise return [].
    throw new Error("PDF import is not yet supported. Use CSV or XLSX exported from Lumens.");
  }
  throw new Error("Unsupported file type. Use .csv, .xlsx, or .xls");
};
