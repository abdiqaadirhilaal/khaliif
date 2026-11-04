import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, PackageX, Plus, Search } from "lucide-react";
import { api, errMsg } from "../../services/api";
import { Field, Modal, PageHead, Pager, Skeleton } from "../../components/ui";
import { money } from "../../utils/format";
const badge: Record<string, string> = { in_stock: "bg-green-100 text-green-800", low_stock: "bg-amber-100 text-amber-800", out_of_stock: "bg-red-100 text-red-800" };
export default function Inventory() {
  const [tab, setTab] = useState<"stock" | "history">("stock"); const [d, setD] = useState<any>(null); const [q, setQ] = useState(""); const [stock, setStock] = useState(""); const [page, setPage] = useState(1);
  const [adj, setAdj] = useState<any>(null); const [busy, setBusy] = useState(false);
  const load = useCallback(() => { setD(null); api.get(tab === "stock" ? "/inventory" : "/inventory/transactions", { params: { q: q || undefined, stock: stock || undefined, page } }).then(r => setD(r.data.data)).catch(e => toast.error(errMsg(e))); }, [tab, q, stock, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  const save = async (e: FormEvent) => { e.preventDefault(); setBusy(true);
    try { await api.post("/inventory/adjust", { product: adj._id, type: adj.type, quantity: adj.quantity, reason: adj.reason, reference: adj.reference || undefined }); toast.success("Stock updated"); setAdj(null); load(); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); } };
  const s = d?.summary;
  return (<div><PageHead title="Inventory" />
    {tab === "stock" && s && <div className="mb-5 grid gap-3 sm:grid-cols-4">{[["Total units", s.totalUnits], ["Stock value (cost)", money(s.totalValue)], [`Low stock (≤${s.threshold})`, s.lowStock], ["Out of stock", s.outOfStock]].map(([l, v]) => <div key={l as string} className="rounded-xl bg-white p-4 shadow-sm"><p className="text-xs text-gray-500">{l}</p><p className="text-2xl font-extrabold">{v}</p></div>)}</div>}
    {tab === "stock" && s && (s.lowStock > 0 || s.outOfStock > 0) && <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"><AlertTriangle className="h-4 w-4" />{s.outOfStock} out of stock, {s.lowStock} low on stock.<button className="ml-auto underline" onClick={() => { setStock("low"); setPage(1); }}>Show low</button><button className="underline" onClick={() => { setStock("out"); setPage(1); }}>Show out</button></div>}
    <div className="mb-4 flex gap-2">{(["stock", "history"] as const).map(t => <button key={t} className={tab === t ? "btn-primary" : "btn-outline"} onClick={() => { setTab(t); setPage(1); }}>{t === "stock" ? "Stock levels" : "History"}</button>)}</div>
    {tab === "stock" && <div className="mb-4 grid gap-3 md:grid-cols-3"><label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input className="input pl-9" placeholder="Search name or SKU" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} /></label>
      <select className="input" value={stock} onChange={e => { setStock(e.target.value); setPage(1); }}><option value="">All stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select></div>}
    {!d ? <Skeleton /> : !d.items.length ? <p className="py-16 text-center text-gray-500">Nothing to show.</p> : <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm">
      {tab === "stock" ? <><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["Product", "SKU", "Category", "Stock", "Cost", "Price", "Value", "Status", ""].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
        <tbody>{d.items.map((p: any) => <tr key={p._id} className="border-t"><td className="px-4 py-2.5 font-semibold">{p.name}</td><td className="px-4">{p.sku}</td><td className="px-4">{p.category?.name}</td><td className="px-4 font-semibold">{p.quantity}</td><td className="px-4">{money(p.costPrice)}</td><td className="px-4">{money(p.price)}</td><td className="px-4">{money(p.stockValue)}</td>
          <td className="px-4"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[p.stockStatus]}`}>{p.stockStatus.replace(/_/g, " ")}</span></td>
          <td className="px-4 text-right"><button className="btn-outline py-1" onClick={() => setAdj({ ...p, type: "in", quantity: "", reason: "", reference: "" })}><Plus className="h-3 w-3" />Adjust</button></td></tr>)}</tbody></>
      : <><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["Date", "Product", "Type", "Qty", "Balance", "Reason", "Reference", "User"].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
        <tbody>{d.items.map((t: any) => <tr key={t._id} className="border-t"><td className="px-4 py-2.5">{new Date(t.createdAt).toLocaleString()}</td><td className="px-4">{t.product?.name} <span className="text-xs text-gray-500">{t.product?.sku}</span></td>
          <td className={`px-4 font-semibold ${t.type === "in" ? "text-green-700" : "text-red-600"}`}>{t.type === "in" ? "Added" : "Removed"}</td><td className="px-4">{t.quantity}</td><td className="px-4">{t.balanceAfter}</td><td className="px-4">{t.reason}</td><td className="px-4">{t.reference || "-"}</td><td className="px-4">{t.user?.name || "-"}</td></tr>)}</tbody></>}</table></div>}
    {d && <Pager page={d.page} pages={d.pages} onChange={setPage} />}
    <Modal open={!!adj} onClose={() => setAdj(null)} title={`Adjust stock: ${adj?.name}`}>{adj && <form onSubmit={save} className="space-y-3"><p className="text-sm text-gray-500">Current stock: {adj.quantity}</p>
      <Field label="Action"><select className="input" value={adj.type} onChange={e => setAdj({ ...adj, type: e.target.value })}><option value="in">Add stock</option><option value="out">Remove stock</option></select></Field>
      <Field label="Quantity"><input className="input" type="number" min="1" required value={adj.quantity} onChange={e => setAdj({ ...adj, quantity: e.target.value })} /></Field>
      <Field label="Reason"><input className="input" required placeholder="e.g. New bundle opened, damaged items" value={adj.reason} onChange={e => setAdj({ ...adj, reason: e.target.value })} /></Field>
      <Field label="Reference (optional)"><input className="input" placeholder="e.g. BND-001" value={adj.reference} onChange={e => setAdj({ ...adj, reference: e.target.value })} /></Field>
      <div className="flex justify-end gap-2"><button type="button" className="btn-outline" onClick={() => setAdj(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Save</button></div></form>}</Modal></div>);
}
