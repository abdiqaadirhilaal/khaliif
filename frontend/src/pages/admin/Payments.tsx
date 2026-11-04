import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { api, errMsg } from "../../services/api";
import { Field, Modal, PageHead, Pager, Skeleton } from "../../components/ui";
import { money } from "../../utils/format";
export default function Payments() {
  const [d, setD] = useState<any>(null); const [page, setPage] = useState(1); const [open, setOpen] = useState(false); const [custs, setCusts] = useState<any[]>([]); const [due, setDue] = useState<any[]>([]); const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ customer: "", sale: "", amount: "", method: "cash", date: "", reference: "", notes: "" });
  const load = useCallback(() => { api.get("/payments", { params: { page } }).then(r => setD(r.data.data)).catch(e => toast.error(errMsg(e))); }, [page]); useEffect(load, [load]);
  const openForm = () => { setF({ customer: "", sale: "", amount: "", method: "cash", date: "", reference: "", notes: "" }); setDue([]); api.get("/customers", { params: { limit: 100 } }).then(r => setCusts(r.data.data.items.filter((c: any) => c.balance > 0))).catch(() => {}); setOpen(true); };
  const pick = (id: string) => { setF({ ...f, customer: id, sale: "" }); if (id) api.get("/sales", { params: { customer: id, due: true, limit: 50 } }).then(r => setDue(r.data.data.items)).catch(() => {}); };
  const cust = custs.find(c => c._id === f.customer);
  const save = async (e: FormEvent) => { e.preventDefault(); setBusy(true);
    try { await api.post("/payments", { ...f, sale: f.sale || undefined, date: f.date || undefined, reference: f.reference || undefined, notes: f.notes || undefined }); toast.success("Payment recorded"); setOpen(false); load(); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); } };
  return (<div><PageHead title="Payments"><button className="btn-primary" onClick={openForm}><Plus className="h-4 w-4" />Record payment</button></PageHead>
    {!d ? <Skeleton /> : !d.items.length ? <p className="py-16 text-center text-gray-500">No payments yet.</p> : <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["Date", "Customer", "Invoice", "Amount", "Method", "Reference"].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
      <tbody>{d.items.map((p: any) => <tr key={p._id} className="border-t"><td className="px-4 py-2.5">{new Date(p.date).toLocaleDateString()}</td><td className="px-4">{p.customer?.name || "Walk-in"}</td><td className="px-4">{p.sale?.invoiceNumber || "On account"}</td><td className="px-4 font-semibold">{money(p.amount)}</td><td className="px-4 capitalize">{p.method.replace("_", " ")}</td><td className="px-4">{p.reference || "-"}</td></tr>)}</tbody></table></div>}
    {d && <Pager page={d.page} pages={d.pages} onChange={setPage} />}
    <Modal open={open} onClose={() => setOpen(false)} title="Record payment"><form onSubmit={save} className="space-y-3">
      <Field label="Customer with balance"><select className="input" required value={f.customer} onChange={e => pick(e.target.value)}><option value="">Select…</option>{custs.map(c => <option key={c._id} value={c._id}>{c.name} · owes {money(c.balance)}</option>)}</select></Field>
      <Field label="Invoice (optional, otherwise oldest first)"><select className="input" value={f.sale} onChange={e => setF({ ...f, sale: e.target.value })}><option value="">Apply to oldest invoices</option>{due.map(s => <option key={s._id} value={s._id}>{s.invoiceNumber} · due {money(s.balance)}</option>)}</select></Field>
      <Field label={`Amount${cust ? ` (max ${money(cust.balance)})` : ""}`}><input className="input" type="number" min="0.01" step="any" required value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} /></Field>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Method"><select className="input" value={f.method} onChange={e => setF({ ...f, method: e.target.value })}><option value="cash">Cash</option><option value="bank">Bank</option><option value="mobile_money">Mobile Money</option><option value="other">Other</option></select></Field>
        <Field label="Date"><input className="input" type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></Field></div>
      <Field label="Reference"><input className="input" value={f.reference} onChange={e => setF({ ...f, reference: e.target.value })} /></Field><Field label="Notes"><input className="input" value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></Field>
      <div className="flex justify-end gap-2"><button type="button" className="btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={busy}>Save payment</button></div></form></Modal></div>);
}
