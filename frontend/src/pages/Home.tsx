import { Link } from "react-router-dom";
import { Boxes, ShieldCheck, Tags, Truck } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { useFetch } from "../hooks/useFetch";
import ProductCard from "../components/ProductCard";
import ContactButtons from "../components/ContactButtons";
import { Loading } from "../components/States";
import { img } from "../utils/format";
export default function Home() {
  const s = useSettings(); const w = s.website || {};
  const feat = useFetch<any>("/products", { featured: true, limit: 4 }); const cats = useFetch<any[]>("/categories");
  return (
    <>
      <section className="bg-white"><div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
        <div><h1 className="text-4xl font-extrabold leading-tight md:text-5xl">{w.heroTitle || "Quality second-hand clothes, supplied in containers and bundles"}</h1>
          <p className="mt-4 max-w-lg text-gray-600">{w.heroDescription || `${s.companyName} specializes in quality second-hand clothes for wholesale and retail buyers.`}</p>
          <div className="mt-6 flex gap-3"><Link to="/products" className="btn-primary">View Products</Link><Link to="/contact" className="btn-outline">Contact Us</Link></div></div>
        <img src={img(s.logo)} alt={s.companyName} className="mx-auto w-full max-w-md object-contain" />
      </div></section>
      {!!cats.data?.length && <section className="mx-auto max-w-6xl px-4 py-12"><h2 className="mb-6 text-2xl font-bold">Shop by category</h2>
        <div className="flex flex-wrap gap-3">{cats.data.map(c => <Link key={c._id} to={`/products?category=${c._id}`} className="rounded-full border bg-white px-4 py-2 text-sm font-semibold hover:border-brand-red hover:text-brand-red">{c.name}</Link>)}</div></section>}
      <section className="mx-auto max-w-6xl px-4 pb-12"><div className="mb-6 flex items-end justify-between"><h2 className="text-2xl font-bold">Featured products</h2><Link to="/products" className="text-sm font-semibold text-brand-navy">See all products</Link></div>
        {feat.loading ? <Loading /> : feat.data?.items.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{feat.data.items.map((p: any) => <ProductCard key={p._id} p={p} />)}</div> : <p className="text-gray-500">No featured products yet.</p>}</section>
      <section className="bg-white"><div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-4">
        {[[ShieldCheck, "Sorted for quality", "Clothes are checked and graded before sale."], [Boxes, "Bundles and containers", "Buy by the bundle or in larger container quantities."], [Tags, "Fair wholesale value", "Second-hand stock priced for resale margins."], [Truck, "Direct supply", "Contact us to arrange orders and delivery."]].map(([I, t, d]: any) =>
          <div key={t}><I className="h-8 w-8 text-brand-red" /><h3 className="mt-3 font-bold">{t}</h3><p className="mt-1 text-sm text-gray-600">{d}</p></div>)}</div></section>
      {!!w.stats?.length && <section className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 md:grid-cols-4">{w.stats.map(x => <div key={x.label}><p className="text-3xl font-extrabold text-brand-navy">{x.value}</p><p className="text-sm text-gray-600">{x.label}</p></div>)}</section>}
      <section className="bg-brand-navy py-12 text-white"><div className="mx-auto max-w-6xl space-y-4 px-4"><h2 className="text-2xl font-bold">Ready to order or ask a question?</h2><ContactButtons /></div></section>
    </>
  );
}
