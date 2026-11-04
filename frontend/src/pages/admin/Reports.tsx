import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api, errMsg } from "../../services/api";
import { PageHead, Skeleton } from "../../components/ui";
import { money } from "../../utils/format";
const TYPES: [string, string][] = [["sales", "Sales (daily / weekly / monthly / yearly)"], ["products", "Product sales"], ["categories", "Category sales"], ["customers", "Customer purchases"], ["debts", "Customer debts"], ["expenses", "Expenses"], ["profit", "Profit"], ["inventory", "Inventory valuation"], ["containers", "Container profitability"], ["bundles", "Bundle profitability"]];
const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
function preset(p: string): [string, string] {
  const n = new Date(), day = new Date(n.getFullYear(), n.getMonth(), n.getDate()); const add = (d: Date, k: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + k);
  if (p === "today") return [iso(day), iso(day)]; if (p === "yesterday") return [iso(add(day, -1)), iso(add(day, -1))];
  if (p === "week") return [iso(add(day, -((day.getDay() + 6) % 7))), iso(day)]; if (p === "month") return [iso(new Date(n.getFullYear(), n.getMonth(), 1)), iso(day)];
  if (p === "lastmonth") return [iso(new Date(n.getFullYear(), n.getMonth() - 1, 1)), iso(new Date(n.getFullYear(), n.getMonth(), 0))]; return [iso(new Date(n.getFullYear(), 0, 1)), iso(day)];
}
export default function Reports() {
  const [type, setType] = useState("sales"); const [pre, setPre] = useState("month"); const [range, setRange] = useState<[string, string]>(preset("month")); const [group, setGroup] = useState("day"); const [d, setD] = useState<any>(null);
  useEffect(() => { if (pre !== "custom") setRange(preset(pre)); }, [pre]);
  useEffect(() => { setD(null); api.get(`/reports/${type}`, { params: { from: range[0], to: range[1], group: type === "profit" ? (group === "day" ? "month" : group) : group } }).then(r => setD(r.data.data)).catch(e => toast.error(errMsg(e))); }, [type, range, group]);
  const fmt = (c: any, v: any) => c.money ? money(v || 0) : v ?? "-";
  const totals = d && d.rows.length ? d.columns.map((c: any, i: number) => i === 0 ? "Total" : c.money ? money(d.rows.reduce((a: number, r: any) => a + (r[c.key] || 0), 0)) : "") : null;
  const title = TYPES.find(t => t[0] === type)![1];
  const csv = () => { const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`; const body = [d.columns.map((c: any) => esc(c.label)).join(","), ...d.rows.map((r: any) => d.columns.map((c: any) => esc(r[c.key])).join(","))].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" })); a.download = `${type}-report.csv`; a.click(); };
  const pdf = () => { const doc = new jsPDF({ orientation: "landscape" }); doc.setFontSize(14); doc.text(`KHALIIF SECOND HAND CLOTHES COMPANY - ${title}`, 14, 14); doc.setFontSize(9); doc.text(`${range[0]} to ${range[1]}`, 14, 20);
    autoTable(doc, { startY: 25, head: [d.columns.map((c: any) => c.label)], body: d.rows.map((r: any) => d.columns.map((c: any) => String(fmt(c, r[c.key])))), foot: totals ? [totals] : undefined, headStyles: { fillColor: [59, 85, 168] }, footStyles: { fillColor: [230, 230, 230], textColor: 20 } }); doc.save(`${type}-report.pdf`); };
  return (<div><PageHead title="Reports">{d && <div className="flex gap-2"><button className="btn-outline" onClick={csv}><Download className="h-4 w-4" />Excel / CSV</button><button className="btn-primary" onClick={pdf}><FileText className="h-4 w-4" />PDF</button></div>}</PageHead>
    <div className="mb-4 grid gap-3 md:grid-cols-4"><select className="input md:col-span-2" value={type} onChange={e => setType(e.target.value)}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <select className="input" value={pre} onChange={e => setPre(e.target.value)}>{[["today", "Today"], ["yesterday", "Yesterday"], ["week", "This week"], ["month", "This month"], ["lastmonth", "Last month"], ["year", "This year"], ["custom", "Custom range"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      {(type === "sales" || type === "profit") && <select className="input" value={group} onChange={e => setGroup(e.target.value)}><option value="day">Daily</option><option value="week">Weekly</option><option value="month">Monthly</option><option value="year">Yearly</option></select>}
      {pre === "custom" && <><input aria-label="From" className="input" type="date" value={range[0]} onChange={e => setRange([e.target.value, range[1]])} /><input aria-label="To" className="input" type="date" value={range[1]} onChange={e => setRange([range[0], e.target.value])} /></>}</div>
    {!d ? <Skeleton /> : !d.rows.length ? <p className="py-16 text-center text-gray-500">No data for this selection.</p> : <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{d.columns.map((c: any) => <th key={c.key} className="px-4 py-3">{c.label}</th>)}</tr></thead>
      <tbody>{d.rows.map((r: any, i: number) => <tr key={i} className="border-t">{d.columns.map((c: any) => <td key={c.key} className={`px-4 py-2.5 capitalize-none ${c.money && r[c.key] < 0 ? "text-red-600" : ""}`}>{fmt(c, r[c.key])}</td>)}</tr>)}</tbody>
      {totals && <tfoot className="border-t-2 bg-gray-50 font-bold"><tr>{totals.map((t: string, i: number) => <td key={i} className="px-4 py-2.5">{t}</td>)}</tr></tfoot>}</table></div>}</div>);
}
