import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MessageCircle, Phone, Search, Trash2 } from "lucide-react";
import { api, errMsg } from "../../services/api";
import { Confirm, PageHead, Pager, Skeleton } from "../../components/ui";
import { digits } from "../../utils/format";
const colors: Record<string, string> = { unread: "bg-brand-red text-white", read: "bg-gray-200 text-gray-700", replied: "bg-green-100 text-green-800", closed: "bg-gray-800 text-white" };
export default function Messages() {
  const [d, setD] = useState<any>(null); const [q, setQ] = useState(""); const [status, setStatus] = useState(""); const [page, setPage] = useState(1);
  const [sel, setSel] = useState<any>(null); const [del, setDel] = useState<any>(null);
  const load = useCallback(() => { api.get("/messages", { params: { q: q || undefined, status: status || undefined, page } }).then(r => setD(r.data.data)).catch(e => toast.error(errMsg(e))); }, [q, status, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  const setSt = async (m: any, s: string) => { try { const r = await api.put(`/messages/${m._id}`, { status: s }); setSel(r.data.data); load(); window.dispatchEvent(new Event("msgs-changed")); } catch (e) { toast.error(errMsg(e)); } };
  const openMsg = (m: any) => { setSel(m); if (m.status === "unread") setSt(m, "read"); };
  const remove = async () => { try { await api.delete(`/messages/${del._id}`); toast.success("Deleted"); setDel(null); setSel(null); load(); window.dispatchEvent(new Event("msgs-changed")); } catch (e) { toast.error(errMsg(e)); } };
  return (<div><PageHead title="Messages" />
    <div className="mb-4 grid gap-3 md:grid-cols-2"><label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input className="input pl-9" placeholder="Name, phone or subject" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} /></label>
      <select className="input" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{Object.keys(colors).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <div>{!d ? <Skeleton /> : !d.items.length ? <p className="py-16 text-center text-gray-500">No messages.</p> : <div className="space-y-2">{d.items.map((m: any) =>
        <button key={m._id} onClick={() => openMsg(m)} className={`block w-full rounded-xl bg-white p-4 text-left shadow-sm ${sel?._id === m._id ? "ring-2 ring-brand-navy" : ""}`}>
          <div className="flex items-center justify-between gap-2"><span className={`truncate ${m.status === "unread" ? "font-extrabold" : "font-semibold"}`}>{m.name}</span><span className={`rounded-full px-2 py-0.5 text-xs ${colors[m.status]}`}>{m.status}</span></div>
          <p className="truncate text-sm">{m.subject}</p><p className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()}</p></button>)}</div>}
        {d && <Pager page={d.page} pages={d.pages} onChange={setPage} />}</div>
      {sel && <div className="h-fit space-y-3 rounded-xl bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">{sel.subject}</h2>
        <p className="text-sm text-gray-600">{sel.name} · {sel.phone}{sel.email && ` · ${sel.email}`}</p>{sel.productRef && <p className="text-xs text-brand-blue">Product: {sel.productRef}</p>}
        <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm">{sel.message}</p>
        <div className="flex flex-wrap gap-2"><a className="btn-outline py-1.5" href={`tel:${sel.phone}`}><Phone className="h-4 w-4" />Call</a>
          <a className="btn-outline py-1.5" target="_blank" rel="noreferrer" href={`https://wa.me/${digits(sel.phone)}?text=${encodeURIComponent(`Hello ${sel.name}, thank you for contacting us.`)}`}><MessageCircle className="h-4 w-4" />WhatsApp</a>
          {sel.email && <a className="btn-outline py-1.5" href={`mailto:${sel.email}?subject=Re: ${encodeURIComponent(sel.subject)}`}>Email</a>}</div>
        <div className="flex flex-wrap gap-2 border-t pt-3">{["read", "replied", "closed"].map(s => <button key={s} disabled={sel.status === s} className="btn-outline py-1.5 capitalize" onClick={() => setSt(sel, s)}>Mark {s}</button>)}
          <button className="btn-outline ml-auto border-red-600 py-1.5 text-red-600" onClick={() => setDel(sel)}><Trash2 className="h-4 w-4" />Delete</button></div></div>}
    </div>
    <Confirm open={!!del} text="Delete this message permanently?" onYes={remove} onNo={() => setDel(null)} /></div>);
}
