import { FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Edit, Eye, EyeOff, Plus, Search, Trash2 } from "lucide-react";
import { api, errMsg } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../layouts/DashboardLayout";
import { Confirm, Field, Modal, PageHead, Pager, Skeleton } from "../../components/ui";
import { img, money } from "../../utils/format";
const blank = { name: "", sku: "", category: "", description: "", price: "", costPrice: "", quantity: "", gender: "unisex", size: "", color: "", productType: "", published: false, featured: false };
export default function Products() {
  const { user } = useAuth(); const edit = can(user?.role, ["manager"]);
  const [d, setD] = useState<any>(null); const [loading, setLoading] = useState(true); const [cats, setCats] = useState<any[]>([]);
  const [q, setQ] = useState(""); const [cat, setCat] = useState(""); const [pub, setPub] = useState(""); const [page, setPage] = useState(1);
  const [form, setForm] = useState<any>(null); const [file, setFile] = useState<File | null>(null); const [del, setDel] = useState<any>(null); const [busy, setBusy] = useState(false);
  const load = useCallback(() => { setLoading(true); api.get("/products/manage", { params: { q: q || undefined, category: cat || undefined, published: pub || undefined, page, limit: 10 } })
    .then(r => setD(r.data.data)).catch(e => toast.error(errMsg(e))).finally(() => setLoading(false)); }, [q, cat, pub, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  useEffect(() => { api.get("/categories/manage").then(r => setCats(r.data.data)).catch(() => {}); }, []);
  const open = (p?: any) => { setFile(null); setForm(p ? { ...blank, ...p, category: p.category?._id || "" } : { ...blank, category: cats[0]?._id || "" }); };
  const save = async (e: FormEvent) => { e.preventDefault(); setBusy(true);
    try { const fd = new FormData(); ["name", "sku", "category", "description", "price", "costPrice", "quantity", "gender", "size", "color", "productType", "published", "featured"].forEach(k => fd.append(k, String(form[k] ?? "")));
      if (file) fd.append("image", file);
      form._id ? await api.put(`/products/${form._id}`, fd) : await api.post("/products", fd); toast.success("Product saved"); setForm(null); load(); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); } };
  const toggle = async (p: any) => { try { const fd = new FormData(); fd.append("published", String(!p.published)); await api.put(`/products/${p._id}`, fd); load(); } catch (e) { toast.error(errMsg(e)); } };
  const remove = async () => { try { await api.delete(`/products/${del._id}`); toast.success("Product deleted"); setDel(null); load(); } catch (e) { toast.error(errMsg(e)); } };
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  return (<div>
    <PageHead title="Products">{edit && <button className="btn-primary" onClick={() => open()}><Plus className="h-4 w-4" />Add product</button>}</PageHead>
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input className="input pl-9" placeholder="Search name or SKU" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} /></label>
      <select className="input" value={cat} onChange={e => { setCat(e.target.value); setPage(1); }}><option value="">All categories</option>{cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
      <select className="input" value={pub} onChange={e => { setPub(e.target.value); setPage(1); }}><option value="">All statuses</option><option value="true">Published</option><option value="false">Unpublished</option></select></div>
    {loading && !d ? <Skeleton /> : !d?.items.length ? <p className="py-16 text-center text-gray-500">No products found.</p> :
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["Product", "SKU", "Category", "Stock", "Cost", "Price", "Status", ""].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
        <tbody>{d.items.map((p: any) => <tr key={p._id} className="border-t">
          <td className="px-4 py-2"><div className="flex items-center gap-3">{p.image ? <img src={img(p.image)} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-gray-100" />}<span className="font-semibold">{p.name}</span></div></td>
          <td className="px-4">{p.sku}</td><td className="px-4">{p.category?.name}</td>
          <td className={`px-4 font-semibold ${p.quantity <= 0 ? "text-red-600" : p.quantity <= 10 ? "text-amber-600" : ""}`}>{p.quantity}</td><td className="px-4">{money(p.costPrice)}</td><td className="px-4">{money(p.price)}</td>
          <td className="px-4"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.published ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>{p.published ? "Published" : "Hidden"}</span></td>
          <td className="whitespace-nowrap px-4 text-right">{edit && <>
            <button aria-label="Toggle published" title="Publish / unpublish" className="p-1.5" onClick={() => toggle(p)}>{p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            <button aria-label="Edit" className="p-1.5" onClick={() => open(p)}><Edit className="h-4 w-4" /></button>
            <button aria-label="Delete" className="p-1.5 text-red-600" onClick={() => setDel(p)}><Trash2 className="h-4 w-4" /></button></>}</td></tr>)}</tbody></table></div>}
    {d && <Pager page={d.page} pages={d.pages} onChange={setPage} />}
    <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? "Edit product" : "Add product"}>{form && <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
      <Field label="Name"><input className="input" required value={form.name} onChange={set("name")} /></Field>
      <Field label="SKU"><input className="input" required value={form.sku} onChange={set("sku")} /></Field>
      <Field label="Category"><select className="input" required value={form.category} onChange={set("category")}><option value="" disabled>Select…</option>{cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></Field>
      <Field label="Gender"><select className="input" value={form.gender} onChange={set("gender")}>{["men", "women", "children", "unisex"].map(g => <option key={g}>{g}</option>)}</select></Field>
      <Field label="Price"><input className="input" type="number" min="0" step="0.01" required value={form.price} onChange={set("price")} /></Field>
      <Field label="Cost price"><input className="input" type="number" min="0" step="0.01" value={form.costPrice} onChange={set("costPrice")} /></Field>
      <Field label="Quantity"><input className="input" type="number" min="0" value={form.quantity} onChange={set("quantity")} /></Field>
      <Field label="Size"><input className="input" value={form.size} onChange={set("size")} /></Field>
      <Field label="Color"><input className="input" value={form.color} onChange={set("color")} /></Field>
      <Field label="Product type"><input className="input" value={form.productType} onChange={set("productType")} /></Field>
      <div className="sm:col-span-2"><Field label="Description"><textarea className="input" rows={3} value={form.description} onChange={set("description")} /></Field></div>
      <div className="sm:col-span-2"><Field label="Image"><input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm" /></Field>
        {(file || form.image) && <img src={file ? URL.createObjectURL(file) : img(form.image)} alt="" className="mt-2 h-20 w-20 rounded object-cover" />}</div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={set("published")} />Published on website</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={set("featured")} />Featured on home page</label>
      <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Save</button></div></form>}</Modal>
    <Confirm open={!!del} text={`Delete "${del?.name}"? This cannot be undone.`} onYes={remove} onNo={() => setDel(null)} />
  </div>);
}
