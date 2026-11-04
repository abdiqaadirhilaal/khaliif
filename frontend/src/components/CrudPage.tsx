import { FormEvent, ReactNode, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { api, errMsg } from "../services/api";
import { Confirm, Field, Modal, PageHead, Pager, Skeleton } from "./ui";
export interface F { key: string; label: string; type?: "text" | "number" | "date" | "email" | "select" | "textarea" | "file" | "password"; options?: [string, string][]; required?: boolean; wide?: boolean }
interface P { title: string; singular: string; endpoint: string; columns: [string, (r: any) => ReactNode][]; fields: F[]; blank: any; filters?: { key: string; label: string; options: [string, string][] }[];
  canEdit: boolean; actions?: (r: any) => ReactNode; fromRow?: (r: any) => any; reloadKey?: any }
export default function CrudPage(p: P) {
  const [d, setD] = useState<any>(null); const [q, setQ] = useState(""); const [page, setPage] = useState(1); const [fv, setFv] = useState<any>({});
  const [form, setForm] = useState<any>(null); const [del, setDel] = useState<any>(null); const [busy, setBusy] = useState(false);
  const load = useCallback(() => { api.get(p.endpoint, { params: { q: q || undefined, page, limit: 10, ...fv } }).then(r => setD(r.data.data)).catch(e => toast.error(errMsg(e))); }, [p.endpoint, q, page, fv, p.reloadKey]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  const save = async (e: FormEvent) => { e.preventDefault(); setBusy(true);
    try { const body = Object.fromEntries(Object.entries(form).filter(([k, v]) => v !== "" && v != null && p.fields.some(f => f.key === k)));
      form._id ? await api.put(`${p.endpoint}/${form._id}`, body) : await api.post(p.endpoint, body); toast.success(`${p.singular} saved`); setForm(null); load(); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); } };
  const remove = async () => { try { await api.delete(`${p.endpoint}/${del._id}`); toast.success(`${p.singular} deleted`); setDel(null); load(); } catch (e) { toast.error(errMsg(e)); setDel(null); } };
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });
  return (<div><PageHead title={p.title}>{p.canEdit && <button className="btn-primary" onClick={() => setForm({ ...p.blank })}><Plus className="h-4 w-4" />Add {p.singular.toLowerCase()}</button>}</PageHead>
    <div className="mb-4 grid gap-3 md:grid-cols-3"><label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input className="input pl-9" placeholder="Search…" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} /></label>
      {p.filters?.map(f => <select key={f.key} className="input" value={fv[f.key] || ""} onChange={e => { setFv({ ...fv, [f.key]: e.target.value || undefined }); setPage(1); }}><option value="">{f.label}</option>{f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>)}</div>
    {!d ? <Skeleton /> : !d.items.length ? <p className="py-16 text-center text-gray-500">No records found.</p> :
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{p.columns.map(([h]) => <th key={h} className="px-4 py-3">{h}</th>)}<th /></tr></thead>
        <tbody>{d.items.map((r: any) => <tr key={r._id} className="border-t">{p.columns.map(([h, f]) => <td key={h} className="px-4 py-2.5">{f(r)}</td>)}
          <td className="whitespace-nowrap px-4 text-right">{p.actions?.(r)}{p.canEdit && <><button aria-label="Edit" className="p-1.5" onClick={() => setForm(p.fromRow ? p.fromRow(r) : r)}><Edit className="h-4 w-4" /></button>
            <button aria-label="Delete" className="p-1.5 text-red-600" onClick={() => setDel(r)}><Trash2 className="h-4 w-4" /></button></>}</td></tr>)}</tbody></table></div>}
    {d && <Pager page={d.page} pages={d.pages} onChange={setPage} />}
    <Modal open={!!form} onClose={() => setForm(null)} title={`${form?._id ? "Edit" : "Add"} ${p.singular.toLowerCase()}`}>{form && <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
      {p.fields.map(f => <div key={f.key} className={f.wide || f.type === "textarea" ? "sm:col-span-2" : ""}><Field label={f.label}>
        {f.type === "select" ? <select className="input" required={f.required} value={form[f.key] ?? ""} onChange={set(f.key)}><option value="">Select…</option>{f.options?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          : f.type === "file" ? <div><input type="file" accept="image/*" className="text-sm" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const fd = new FormData(); fd.append("file", file);
              try { const r = await api.post("/upload", fd); setForm({ ...form, [f.key]: r.data.data.url }); toast.success("Uploaded"); } catch (err) { toast.error(errMsg(err)); } }} />{form[f.key] && <p className="mt-1 text-xs text-green-700">File attached</p>}</div>
          : f.type === "textarea" ? <textarea className="input" rows={3} value={form[f.key] ?? ""} onChange={set(f.key)} />
          : <input className="input" type={f.type || "text"} step="any" min={f.type === "number" ? 0 : undefined} required={f.required} value={form[f.key] ?? ""} onChange={set(f.key)} />}</Field></div>)}
      <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Save</button></div></form>}</Modal>
    <Confirm open={!!del} text="Delete this record? This cannot be undone." onYes={remove} onNo={() => setDel(null)} /></div>);
}
