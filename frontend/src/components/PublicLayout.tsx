import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, X, Phone, MessageCircle, MapPin } from "lucide-react";
import Logo from "./Logo";
import { useSettings } from "../contexts/SettingsContext";
import { waLink } from "../utils/format";
const links = [["/", "Home"], ["/about", "About"], ["/products", "Products"], ["/contact", "Contact"]];
export default function PublicLayout() {
  const [open, setOpen] = useState(false); const s = useSettings();
  const cls = ({ isActive }: { isActive: boolean }) => `text-sm font-semibold ${isActive ? "text-brand-red" : "text-gray-700 hover:text-brand-navy"}`;
  const addr = [s.address, s.city, s.country].filter(Boolean).join(", ");
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <Link to="/"><Logo size={44} /></Link>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map(([to, l]) => <NavLink key={to} to={to} end={to === "/"} className={cls}>{l}</NavLink>)}
            <Link to="/login" className="btn-outline py-1.5">Login</Link>
          </nav>
          <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && <nav className="flex flex-col gap-3 border-t bg-white px-4 py-4 md:hidden">
          {links.map(([to, l]) => <NavLink key={to} to={to} end={to === "/"} className={cls} onClick={() => setOpen(false)}>{l}</NavLink>)}
          <Link to="/login" className="btn-outline" onClick={() => setOpen(false)}>Login</Link></nav>}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="bg-brand-ink text-gray-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
          <div className="md:col-span-2"><img src="/logo.png" alt="" className="h-20 w-20 rounded-full bg-white object-contain" />
            <p className="mt-3 font-bold text-white">{s.companyName}</p><p className="mt-1 max-w-sm text-sm">{s.website?.footerText || "Quality second-hand clothes in containers and bundles."}</p></div>
          <div className="space-y-2 text-sm"><p className="font-semibold text-white">Contact</p>
            <a className="flex items-center gap-2 hover:text-white" href={`tel:${s.phone1}`}><Phone className="h-4 w-4" />{s.phone1}</a>
            <a className="flex items-center gap-2 hover:text-white" href={`tel:${s.phone2}`}><Phone className="h-4 w-4" />{s.phone2}</a>
            <a className="flex items-center gap-2 hover:text-white" href={waLink(s.whatsapp, "Hello, I would like more information.")}><MessageCircle className="h-4 w-4" />WhatsApp</a>
            {addr && <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{addr}</p>}
            {s.googleMapsUrl && <a className="underline" href={s.googleMapsUrl} target="_blank" rel="noreferrer">Open map</a>}</div>
          <div className="space-y-2 text-sm"><p className="font-semibold text-white">Pages</p>
            {links.map(([to, l]) => <Link key={to} to={to} className="block hover:text-white">{l}</Link>)}
            {Object.entries(s.social || {}).filter(([, v]) => v).map(([k, v]) => <a key={k} href={v} target="_blank" rel="noreferrer" className="block capitalize hover:text-white">{k}</a>)}</div>
        </div>
        <p className="border-t border-gray-700 py-4 text-center text-xs">© {new Date().getFullYear()} {s.companyName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
