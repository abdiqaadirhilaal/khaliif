import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Shirt } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { useSettings } from "../contexts/SettingsContext";
import { stockLabel } from "../components/ProductCard";
import { ErrorBox, Loading } from "../components/States";
import ContactButtons from "../components/ContactButtons";
import { img, money, waLink } from "../utils/format";
export default function ProductDetail() {
  const { id } = useParams(); const s = useSettings(); const { data: p, loading, error } = useFetch<any>(`/products/${id}`);
  if (loading) return <Loading />; if (error || !p) return <ErrorBox text={error || "Product not found"} />;
  const msg = `I am interested in ${p.name}, SKU ${p.sku}. Please provide more information.`; const [t, c] = stockLabel[p.stockStatus];
  const facts = [["SKU", p.sku], ["Gender", p.gender], ["Size", p.size], ["Color", p.color], ["Type", p.productType]].filter(f => f[1]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/products" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-navy"><ArrowLeft className="h-4 w-4" />All products</Link>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">{p.image ? <img src={img(p.image)} alt={p.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-gray-300"><Shirt className="h-24 w-24" /></div>}</div>
        <div className="space-y-4"><p className="text-sm text-brand-blue">{p.category?.name}</p><h1 className="text-3xl font-extrabold">{p.name}</h1>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${c}`}>{t}</span>
          {p.price != null && <p className="text-2xl font-extrabold text-brand-red">{money(p.price, s.system?.currency)}</p>}
          {p.description && <p className="text-gray-700">{p.description}</p>}
          <dl className="grid grid-cols-2 gap-2 text-sm">{facts.map(([k, v]) => <div key={k as string}><dt className="text-gray-500">{k}</dt><dd className="font-semibold capitalize">{v}</dd></div>)}</dl>
          <div className="space-y-3 border-t pt-4"><a className="btn-primary w-full" href={waLink(s.whatsapp, msg)} target="_blank" rel="noreferrer">Contact Us About This Product</a>
            <Link className="btn-outline w-full" to={`/contact?product=${encodeURIComponent(`${p.name}|${p.sku}`)}`}>Send an inquiry by form</Link>
            <a className="btn-outline w-full" href={`tel:${s.phone1}`}><Phone className="h-4 w-4" />Call {s.phone1}</a></div></div>
      </div>
    </div>
  );
}
