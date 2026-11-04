import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Edit, Plus, Trash2 } from "lucide-react";
import { api, errMsg } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../layouts/DashboardLayout";
import { Confirm, Field, Modal, PageHead, Skeleton } from "../../components/ui";
import { img } from "../../utils/format";
export default function Categories() {
  const { user } = useAuth(); const edit = can(user?.role, ["manager"]);
  const [items, setItems] = useState<any[] | null>(null); const [form, setForm] = useState<any>(null); const [file, setFile] = useState<File | null>(null); const [del, setDel] = useState<any>(null);
  const load = useCallback(() => { api.get("/categories/manage").then(r => setItems(r.data.data)).catch(e => toast.error(errMsg(e))); }, []);
  useEffect(load, [load]);
  const save = async (e: FormEvent) => { e.preventDefault();
    try { const fd = new FormData(); fd.append("name", form.name); fd.append("description", form.description || ""); fd.append("active", String(form.active)); if (file) fd.append("image", file);
      form._id ? await api.put(`/categories/${form._id}`, fd) : await api.post("/categories", fd); toast.success("Category saved"); setForm(null); setFile(null); load(); } catch (err) { toast.error(errMsg(err)); } };
  const remove = async () => { try { await api.delete(`/categories/${del._id}`); toast.success("Category deleted"); setDel(null); load(); } catch (e) { toast.error(errMsg(e)); setDel(null); } };
  return (<div><PageHead title="Categories">{edit && <button className="btn-primary" onClick={() => setForm({ name: "", description: "", active: true })}><Plus className="h-4 w-4" />Add category</button>}</PageHead>
    {!items ? <Skeleton /> : !items.length ? <p className="py-16 text-center text-gray-500">No categories yet.</p> :
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(c => <div key={c._id} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        {c.image ? <img src={img(c.image)} alt="" className="h-12 w-12 rounded object-cover" /> : <div className="h-12 w-12 rounded bg-gray-100" />}
        <div className="min-w-0 flex-1"><p className="truncate font-semibold">{c.name}</p><p className={`text-xs ${c.active ? "text-green-700" : "text-gray-500"}`}>{c.active ? "Active" : "Inactive"}</p></div>
        {edit && <><button aria-label="Edit" onClick={() => setForm(c)}><Edit className="h-4 w-4" /></button><button aria-label="Delete" className="text-red-600" onClick={() => setDel(c)}><Trash2 className="h-4 w-4" /></button></>}</div>)}</div>}
    <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? "Edit category" : "Add category"}>{form && <form onSubmit={save} className="space-y-3">
      <Field label="Name"><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Description"><textarea className="input" rows={3} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
      <Field label="Image"><input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm" /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />Active</label>
      <div className="flex justify-end gap-2"><button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary">Save</button></div></form>}</Modal>
    <Confirm open={!!del} text={`Delete category "${del?.name}"?`} onYes={remove} onNo={() => setDel(null)} /></div>);
}
