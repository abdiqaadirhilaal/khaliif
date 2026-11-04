import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import ProductCard from "../components/ProductCard";
import { Empty, ErrorBox, Loading } from "../components/States";
export default function Products() {
  const [sp, setSp] = useSearchParams(); const set = (k: string, v: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); n.delete("page"); setSp(n); };
  const page = +(sp.get("page") || 1);
  const params = { q: sp.get("q") || undefined, category: sp.get("category") || undefined, gender: sp.get("gender") || undefined, page, limit: 12 };
  const { data, loading, error } = useFetch<any>("/products", params); const cats = useFetch<any[]>("/categories");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Products</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input className="input pl-9" placeholder="Search name or SKU" defaultValue={sp.get("q") || ""} onKeyDown={e => e.key === "Enter" && set("q", e.currentTarget.value)} /></label>
        <select className="input" value={sp.get("category") || ""} onChange={e => set("category", e.target.value)}><option value="">All categories</option>{cats.data?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
        <select className="input" value={sp.get("gender") || ""} onChange={e => set("gender", e.target.value)}><option value="">All genders</option><option value="men">Men</option><option value="women">Women</option><option value="children">Children</option><option value="unisex">Unisex</option></select>
      </div>
      {loading ? <Loading /> : error ? <ErrorBox text={error} /> : !data.items.length ? <Empty text="No products match your search." /> : <>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{data.items.map((p: any) => <ProductCard key={p._id} p={p} />)}</div>
        <div className="mt-8 flex items-center justify-center gap-3 text-sm"><button className="btn-outline" disabled={page <= 1} onClick={() => set("page", String(page - 1))}>Previous</button><span>Page {data.page} of {data.pages}</span><button className="btn-outline" disabled={page >= data.pages} onClick={() => set("page", String(page + 1))}>Next</button></div></>}
    </div>
  );
}
