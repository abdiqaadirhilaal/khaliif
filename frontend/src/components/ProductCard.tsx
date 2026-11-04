import { Link } from "react-router-dom";
import { Shirt } from "lucide-react";
import { img, money } from "../utils/format";
import { useSettings } from "../contexts/SettingsContext";
export const stockLabel: Record<string, [string, string]> = { in_stock: ["In stock", "bg-green-100 text-green-800"], low_stock: ["Low stock", "bg-amber-100 text-amber-800"], out_of_stock: ["Out of stock", "bg-red-100 text-red-800"] };
export default function ProductCard({ p }: { p: any }) {
  const s = useSettings(); const [t, c] = stockLabel[p.stockStatus] || stockLabel.in_stock;
  return (
    <Link to={`/products/${p._id}`} className="group overflow-hidden rounded-xl border bg-white transition hover:shadow-lg">
      <div className="aspect-square bg-gray-100">{p.image ? <img src={img(p.image)} alt={p.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        : <div className="grid h-full place-items-center text-gray-300"><Shirt className="h-16 w-16" /></div>}</div>
      <div className="space-y-1 p-4"><p className="text-xs text-brand-blue">{p.category?.name}</p><h3 className="font-bold">{p.name}</h3>
        <div className="flex items-center justify-between pt-1">{p.price != null && <span className="font-extrabold text-brand-red">{money(p.price, s.system?.currency)}</span>}<span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c}`}>{t}</span></div></div>
    </Link>
  );
}
