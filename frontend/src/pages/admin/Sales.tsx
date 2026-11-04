import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Plus, Search, Trash2 } from "lucide-react";
import { api, errMsg } from "../../services/api";
import { Field, Modal, PageHead, Pager, Skeleton } from "../../components/ui";
import { money } from "../../utils/format";
export default function Sales() {
  const [d, setD] = useState<any>(null); const [q, setQ] = useState(""); const [page, setPage] = useState(1); const [open, setOpen] = useState(false);
  const load = useCallback(() => { api.get("/sales", { params: { q: q || undefined, page } }).then(r => setD(r.data.data)).catch(e => toast.error(errMsg(e))); }, [q, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  return (<div><PageHead title="Sales"><button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />New sale</button></PageHead>
    <label className="relative mb-4 block max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input className="input pl-9" placeholder="Invoice or customer" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} /></label>
    {!d ? <Skeleton /> : !d.items.length ? <p className="py-16 text-center text-gray-500">No sales yet.</p> : <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["Invoice", "Date", "Customer", "Total", "Paid", "Balance", "Method", ""].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
      <tbody>{d.items.map((s: any) => <tr key={s._id} className="border-t"><td className="px-4 py-2.5 font-semibold">{s.invoiceNumber}</td><td className="px-4">{new Date(s.saleDate).toLocaleDateString()}</td><td className="px-4">{s.customer?.name || "Walk-in"}</td><td className="px-4">{money(s.total)}</td><td className="px-4">{money(s.paid)}</td>
        <td className={`px-4 ${s.balance > 0 ? "font-semibold text-red-600" : ""}`}>{money(s.balance)}</td><td className="px-4 capitalize">{s.paymentMethod.replace("_", " ")}</td><td className="px-4 text-right"><Link aria-label="View invoice" to={`/dashboard/sales/${s._id}`}><Eye className="inline h-4 w-4" /></Link></td></tr>)}</tbody></table></div>}
    {d && <Pager page={d.page} pages={d.pages} onChange={setPage} />}
    <NewSale open={open} onClose={() => setOpen(false)} /></div>);
}
function NewSale({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate(); const [customers, setCustomers] = useState<any[]>([]); const [items, setItems] = useState<any[]>([]); const [ps, setPs] = useState(""); const [res, setRes] = useState<any[]>([]);
  const [f, setF] = useState({ customer: "", discount: "", paid: "", method: "cash", date: "", notes: "" }); const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setItems([]); setF({ customer: "", discount: "", paid: "", method: "cash", date: "", notes: "" }); api.get("/customers", { params: { limit: 100 } }).then(r => setCustomers(r.data.data.items)).catch(() => {}); } }, [open]);
  useEffect(() => { if (!ps) return setRes([]); const t = setTimeout(() => api.get("/products/manage", { params: { q: ps, limit: 6 } }).then(r => setRes(r.data.data.items)).catch(() => {}), 250); return () => clearTimeout(t); }, [ps]);
  const add = (p: any) => { setItems(it => it.find(i => i.product === p._id) ? it.map(i => i.product === p._id ? { ...i, quantity: i.quantity + 1 } : i) : [...it, { product: p._id, name: p.name, sku: p.sku, stock: p.quantity, quantity: 1, unitPrice: p.price }]); setPs(""); };
  const upd = (id: string, k: string, v: any) => setItems(it => it.map(i => i.product === id ? { ...i, [k]: v } : i));
  const subtotal = items.reduce((a, i) => a + (+i.quantity || 0) * (+i.unitPrice || 0), 0); const disc = Math.min(+f.discount || 0, subtotal); const total = subtotal - disc; const paid = f.paid === "" ? total : +f.paid; const bal = total - paid;
  const submit = async (e: FormEvent) => { e.preventDefault(); setBusy(true);
    try { const r = await api.post("/sales", { customer: f.customer || undefined, items: items.map(i => ({ product: i.product, quantity: +i.quantity, unitPrice: +i.unitPrice })), discount: disc, paid, paymentMethod: f.method, saleDate: f.date || undefined, notes: f.notes || undefined });
      toast.success("Sale completed"); onClose(); nav(`/dashboard/sales/${r.data.data._id}`); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); } };
  return (<Modal open={open} onClose={onClose} title="New sale"><form onSubmit={submit} className="space-y-4">
    <div className="relative"><Field label="Add product"><input className="input" placeholder="Search name or SKU…" value={ps} onChange={e => setPs(e.target.value)} /></Field>
      {!!res.length && <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-lg">{res.map(p => <button type="button" key={p._id} disabled={p.quantity < 1} onClick={() => add(p)} className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-40"><span>{p.name} <span className="text-gray-500">{p.sku}</span></span><span>{p.quantity < 1 ? "Out of stock" : `${p.quantity} · ${money(p.price)}`}</span></button>)}</div>}</div>
    {items.length > 0 && <div className="space-y-2">{items.map(i => <div key={i.product} className="grid grid-cols-12 items-center gap-2 text-sm"><span className="col-span-5 truncate font-semibold">{i.name}</span>
      <input aria-label="Quantity" className="input col-span-2 px-2" type="number" min="1" max={i.stock} value={i.quantity} onChange={e => upd(i.product, "quantity", e.target.value)} /><input aria-label="Unit price" className="input col-span-3 px-2" type="number" min="0" step="any" value={i.unitPrice} onChange={e => upd(i.product, "unitPrice", e.target.value)} />
      <span className="col-span-1 text-right">{money((+i.quantity || 0) * (+i.unitPrice || 0))}</span><button type="button" aria-label="Remove" className="col-span-1 text-red-600" onClick={() => setItems(items.filter(x => x.product !== i.product))}><Trash2 className="h-4 w-4" /></button></div>)}</div>}
    <div className="grid gap-3 sm:grid-cols-2"><Field label="Customer (leave empty for walk-in)"><select className="input" value={f.customer} onChange={e => setF({ ...f, customer: e.target.value })}><option value="">Walk-in customer</option>{customers.map(c => <option key={c._id} value={c._id}>{c.name} · {c.phone}</option>)}</select></Field>
      <Field label="Payment method"><select className="input" value={f.method} onChange={e => setF({ ...f, method: e.target.value })}><option value="cash">Cash</option><option value="bank">Bank</option><option value="mobile_money">Mobile Money</option><option value="other">Other</option></select></Field>
      <Field label="Discount"><input className="input" type="number" min="0" step="any" value={f.discount} onChange={e => setF({ ...f, discount: e.target.value })} /></Field>
      <Field label={`Paid now (default: ${money(total)})`}><input className="input" type="number" min="0" step="any" value={f.paid} onChange={e => setF({ ...f, paid: e.target.value })} /></Field>
      <Field label="Sale date"><input className="input" type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></Field><Field label="Notes"><input className="input" value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></Field></div>
    <div className="rounded-lg bg-gray-50 p-3 text-sm"><p className="flex justify-between"><span>Subtotal</span>{money(subtotal)}</p><p className="flex justify-between"><span>Discount</span>{money(disc)}</p><p className="flex justify-between text-base font-bold"><span>Total</span>{money(total)}</p>
      <p className="flex justify-between"><span>Paid</span>{money(paid)}</p><p className={`flex justify-between font-semibold ${bal > 0 ? "text-red-600" : ""}`}><span>Remaining balance</span>{money(bal)}</p></div>
    <div className="flex justify-end gap-2"><button type="button" className="btn-outline" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy || !items.length}>Complete sale</button></div></form></Modal>);
}
